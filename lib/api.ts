import { Space, SpacesListResponse, ReportResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vail.report';

// Apply vail-zh global gate filter
function applyGlobalGate(spaces: Space[]): Space[] {
  return spaces.filter(space => {
    // Check if space matches all criteria
    const hasZhLanguage = space.detected_language === 'zh';
    const isCrypto = space.is_crypto === true;
    const isEnded = space.state === 'Ended' || space.state === 'TimedOut';
    
    // Check if space has abstract (indicates report exists)
    // New API v0: abstract moved to space level, reports array no longer embedded
    const hasAbstract = space.abstract && space.abstract.length > 0;

    return hasZhLanguage && isCrypto && isEnded && hasAbstract;
  });
}

export async function fetchSpaces(limit: number = 20, pageToken?: string): Promise<SpacesListResponse> {
  let allFilteredSpaces: Space[] = [];
  let currentPageToken = pageToken;
  let hasMorePages = true;
  
  // Keep fetching until we have enough filtered results or no more pages
  while (allFilteredSpaces.length < limit && hasMorePages) {
    const url = new URL(`${API_URL}/v0/spaces`);
    // Request more than needed to account for filtering
    url.searchParams.set('limit', Math.max(limit * 2, 40).toString());
    url.searchParams.set('include_reports', '1');
    
    if (currentPageToken) {
      url.searchParams.set('page', currentPageToken);
    }

    const response = await fetch(url.toString(), {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      console.error('[lib/api.ts] Failed to fetch spaces:', response.status, response.statusText);
      throw new Error(`Failed to fetch spaces: ${response.statusText}`);
    }

    const data = await response.json();
    
    // API returns { data: [...], next_page: ... }
    const spaces = data.data || [];
    const filteredSpaces = applyGlobalGate(spaces);
    
    allFilteredSpaces = [...allFilteredSpaces, ...filteredSpaces];
    currentPageToken = data.next_page;
    hasMorePages = !!data.next_page;
    
    // If we got no filtered results from this page, continue to next page
    // unless there are no more pages
    if (filteredSpaces.length === 0 && !hasMorePages) {
      break;
    }
  }

  // Return only the requested number of spaces
  const resultSpaces = allFilteredSpaces.slice(0, limit);
  
  // Determine if there are more pages available
  // We have more if: we got more filtered results than requested, or there are more API pages
  const hasMore = allFilteredSpaces.length > limit || hasMorePages;

  return {
    spaces: resultSpaces,
    next_page: hasMore ? (currentPageToken || null) : null,
  };
}

export async function fetchReport(spaceId: string): Promise<ReportResponse | null> {
  // New API v0: Simplified endpoint structure
  // - /v0/spaces/{id}/report returns report_data directly (not wrapped)
  // - /v0/spaces/{id} returns space object directly
  const reportUrl = `${API_URL}/v0/spaces/${spaceId}/report`;
  const spaceUrl = `${API_URL}/v0/spaces/${spaceId}`;

  const [reportResponse, spaceResponse] = await Promise.all([
    fetch(reportUrl, {
      cache: 'no-store',
    }),
    fetch(spaceUrl, {
      cache: 'no-store',
    }),
  ]);

  if (!reportResponse.ok) {
    // 400/404 errors are expected for invalid/non-existent space IDs - return null to show 404 page
    if (reportResponse.status === 400 || reportResponse.status === 404) {
      console.log('[lib/api.ts] Report not found for space:', spaceId, '- showing 404 page');
      return null;
    }
    // Log unexpected errors
    console.error('[lib/api.ts] Failed to fetch report:', reportResponse.status, reportResponse.statusText);
    throw new Error(`Failed to fetch report: ${reportResponse.statusText}`);
  }

  if (!spaceResponse.ok) {
    // 400/404 errors are expected for invalid/non-existent space IDs - return null to show 404 page
    if (spaceResponse.status === 400 || spaceResponse.status === 404) {
      console.log('[lib/api.ts] Space not found:', spaceId, '- showing 404 page');
      return null;
    }
    // Log unexpected errors
    console.error('[lib/api.ts] Failed to fetch space:', spaceResponse.status, spaceResponse.statusText);
    throw new Error(`Failed to fetch space: ${spaceResponse.statusText}`);
  }

  // New API v0: report endpoint returns report_data object directly
  const reportData = await reportResponse.json();
  const space: Space = await spaceResponse.json();
  
  // Validate that report data exists before processing
  if (!reportData || Object.keys(reportData).length === 0) {
    console.error('[fetchReport] Report data is null for space:', spaceId);
    return null;
  }

  // Ensure abstract is available in report_data (it's also in space.abstract)
  // Prefer report_data.abstract if present, otherwise use space.abstract
  const abstract = reportData.abstract || space.abstract || [];

  return {
    report: {
      id: space.id, // Use space ID as report ID (no separate report ID in new structure)
      space_id: spaceId,
      report_language: 'en', // Default to English for vail-zh
      is_published: true,
      created_at: space.created_at ? new Date(space.created_at).toISOString() : new Date().toISOString(),
      report_data: {
        ...reportData,
        abstract, // Ensure abstract is included
      }
    },
    space: space
  };
}

export function getListenUrl(spaceId: string): string {
  // Use our internal API route to proxy the request (avoids CORS issues)
  return `/api/spaces/${spaceId}/listen`;
}
