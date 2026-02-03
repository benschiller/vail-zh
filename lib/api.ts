import { Space, SpacesListResponse, ReportResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vail.report';

// Apply vail-zh global gate filter
function applyGlobalGate(spaces: Space[]): Space[] {
  return spaces.filter(space => {
    // Check if space matches all criteria
    const hasZhLanguage = space.detected_language === 'zh';
    const isCrypto = space.is_crypto === true;
    const isEnded = space.state === 'Ended' || space.state === 'TimedOut';
    
    // Check if space has published English report
    const hasPublishedEnglishReport = space.reports?.some(
      report => report.report_language === 'en' && report.is_published === true
    );

    return hasZhLanguage && isCrypto && isEnded && hasPublishedEnglishReport;
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
  // Fetch both report and space data
  const reportUrl = `${API_URL}/v0/spaces/${spaceId}/report?include_meta=1`;
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

  const reportData = await reportResponse.json();
  const spaceData = await spaceResponse.json();
  
  // Validate that report data exists before processing
  // New API returns report data in reportData.report_data
  if (!reportData || !reportData.report_data || Object.keys(reportData.report_data).length === 0) {
    console.error('[fetchReport] Report data is null for space:', spaceId);
    return null;
  }
  
  // Find the specific space that matches the requested spaceId
  // The single space endpoint returns the space directly, list endpoint wraps in data array
  const space = spaceData.data?.find((s: Space) => s.id === spaceId) || spaceData;

  if (!space) {
    console.error('[fetchReport] Space not found in response. Requested:', spaceId);
    return null;
  }

  return {
    report: {
      id: reportData.id,
      space_id: reportData.space_id,
      report_language: reportData.report_language || 'en',
      is_published: reportData.is_published,
      created_at: new Date().toISOString(),
      report_data: reportData.report_data  // Extract report_data from the response
    },
    space: space  // Use the properly structured Space object
  };
}

export function getListenUrl(spaceId: string): string {
  // Direct call to vail-core listen endpoint (no auth required now)
  return `${API_URL}/v0/spaces/${spaceId}/listen`;
}
