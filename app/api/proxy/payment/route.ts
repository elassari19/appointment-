// app/api/proxy/payment/route.ts
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  // Extract the target URL and service type from the query parameters
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const service = searchParams.get('service');

  if (!targetUrl || !service) {
    return Response.json({ error: 'Missing target URL or service type' }, { status: 400 });
  }

  try {
    // Validate service type to ensure it's a known payment provider
    const validServices = ['stripe', 'paypal', 'mada', 'applepay'];
    if (!validServices.includes(service.toLowerCase())) {
      return Response.json({ error: 'Invalid payment service' }, { status: 400 });
    }

    // Get the request body
    const body = await request.json();

    // Forward the request to the payment service
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        // Add any service-specific headers if needed
        ...(service.toLowerCase() === 'stripe' ? { 
          'Stripe-Version': '2022-11-15' 
        } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Payment proxy error:', error);
    return Response.json({ error: 'Payment proxy request failed' }, { status: 500 });
  }
}