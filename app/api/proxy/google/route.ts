// app/api/proxy/google/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract the target URL from the query parameters
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'Missing target URL' }, { status: 400 });
  }

  try {
    // Verify this is a legitimate Google API request
    if (!targetUrl.startsWith('https://www.googleapis.com/') && 
        !targetUrl.startsWith('https://oauth2.googleapis.com/')) {
      return Response.json({ error: 'Invalid Google API endpoint' }, { status: 400 });
    }

    // Forward the request to the Google API
    const response = await fetch(targetUrl, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Extract the target URL from the query parameters
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return Response.json({ error: 'Missing target URL' }, { status: 400 });
  }

  try {
    // Verify this is a legitimate Google API request
    if (!targetUrl.startsWith('https://www.googleapis.com/') && 
        !targetUrl.startsWith('https://oauth2.googleapis.com/')) {
      return Response.json({ error: 'Invalid Google API endpoint' }, { status: 400 });
    }

    // Get the request body
    const body = await request.json();

    // Forward the request to the Google API
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return Response.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}