import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ReportDisplay } from '@/components/report-display';
import { fetchReport } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

interface ReportPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const data = await fetchReport(id);
    
    if (!data) {
      return {
        title: 'Report Not Found | VAIL Reports',
      };
    }
    
    const spaceTitle = data.space?.title_en || data.space?.title || 'Report';
    
    return {
      title: `${spaceTitle} | VAIL Reports`,
      description: data.report.report_data?.abstract?.[0] || 'Space report',
    };
  } catch (error) {
    return {
      title: 'Report Not Found | VAIL Reports',
    };
  }
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params;
  
  try {
    const data = await fetchReport(id);
    
    // If fetchReport returns null, the space was not found (400/404)
    if (!data) {
      notFound();
    }

    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          <div className="mb-6">
            <Link 
              href="/chinese"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              ← Back to list
            </Link>
          </div>
          <ReportDisplay report={data.report} space={data.space} />
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    // Don't log NEXT_HTTP_ERROR_FALLBACK errors as they're expected from notFound()
    const isNotFoundError = error instanceof Error && error.message.includes('NEXT_HTTP_ERROR_FALLBACK');
    if (!isNotFoundError) {
      console.error('Error loading report:', error);
    }
    notFound();
  }
}
