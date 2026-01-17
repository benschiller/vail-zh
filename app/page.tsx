import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { SpacesList } from '@/components/spaces-list';
import { fetchSpaces } from '@/lib/api';

// Force dynamic rendering - data is fetched at request time, not build time
// This is required because VAIL_API_BEARER_TOKEN is only available at runtime
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  try {
    console.log('[HomePage] Starting to fetch spaces...');
    const { spaces, next_page } = await fetchSpaces(20);
    console.log('[HomePage] Fetched', spaces.length, 'spaces');

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <SpacesList initialSpaces={spaces} initialNextPage={next_page} />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error('[HomePage] Error:', error);
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <div className="text-red-500">
            <h1 className="text-2xl font-bold mb-4">Error Loading Spaces</h1>
            <pre className="bg-gray-100 p-4 rounded">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
}
