import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.vail.report';
const BEARER_TOKEN = process.env.VAIL_API_BEARER_TOKEN;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ spaceId: string }> }
) {
  const { spaceId } = await params;

  if (!BEARER_TOKEN) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    // Call vail-core listen endpoint with bearer auth
    const response = await fetch(
      `${API_URL}/v0/spaces/${spaceId}/listen`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
        },
        redirect: 'manual', // Don't follow redirects automatically
      }
    );

    // Get the redirect location
    const location = response.headers.get('location');
    
    if (location) {
      // Redirect to Twitter
      return NextResponse.redirect(location);
    }

    // If no redirect, return error
    return NextResponse.json(
      { error: 'Failed to get Twitter URL' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in listen redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
