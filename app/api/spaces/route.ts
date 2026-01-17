import { NextRequest, NextResponse } from 'next/server';
import { fetchSpaces } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');

    const { spaces, next_page } = await fetchSpaces(20, page || undefined);

    return NextResponse.json({
      spaces,
      next_page,
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
