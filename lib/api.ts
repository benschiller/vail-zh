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

export async function fetchSpaces(): Promise<SpacesListResponse> {
  const url = new URL(`${API_URL}/v0/spaces`);
  // Fetch a generous batch — only a handful of zh-crypto spaces exist
  url.searchParams.set('limit', '100');
  url.searchParams.set('include_reports', '1');

  const response = await fetch(url.toString(), {
    cache: 'no-store', // Always fetch fresh data
  });

  if (!response.ok) {
    console.error('[lib/api.ts] Failed to fetch spaces:', response.status, response.statusText);
    throw new Error(`Failed to fetch spaces: ${response.statusText}`);
  }

  const data = await response.json();

  // API returns { data: [...], next_page: ... }
  const spaces: Space[] = data.data || [];
  const filteredSpaces = applyGlobalGate(spaces);

  // Deduplicate by space.id as a safety net
  const seen = new Set<string>();
  const uniqueSpaces = filteredSpaces.filter(space => {
    if (seen.has(space.id)) return false;
    seen.add(space.id);
    return true;
  });

  return { spaces: uniqueSpaces };
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
