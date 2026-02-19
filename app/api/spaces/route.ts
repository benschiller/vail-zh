import { NextResponse } from 'next/server';
import { fetchSpaces } from '@/lib/api';

export async function GET() {
  try {
    const { spaces } = await fetchSpaces();

    return NextResponse.json({ spaces });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
