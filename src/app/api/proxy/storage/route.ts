import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log('🔄 Proxying Firebase Storage URL:', url);
    
    // Fetch the file from Firebase Storage
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    // Get content type from the original response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    
    // Get the file data
    const arrayBuffer = await response.arrayBuffer();
    
    // Enhanced headers for better audio support
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    };

    // Add content length if available
    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    // Log audio file info for debugging
    if (contentType.startsWith('audio/')) {
      console.log('🎵 Audio file info:', {
        contentType,
        size: arrayBuffer.byteLength,
        url: url
      });
    }

    // Add range support for audio streaming
    if (request.headers.get('range')) {
      const range = request.headers.get('range');
      if (range) {
        // Handle range requests for audio streaming
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : arrayBuffer.byteLength - 1;
        const chunksize = (end - start) + 1;
        
        headers['Content-Range'] = `bytes ${start}-${end}/${arrayBuffer.byteLength}`;
        headers['Accept-Ranges'] = 'bytes';
        
        const slicedBuffer = arrayBuffer.slice(start, end + 1);
        
        return new NextResponse(slicedBuffer, {
          status: 206, // Partial Content
          headers
        });
      }
    }

    // Return the file with proper headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy file', details: (error as Error).message || 'Unknown error' },
      { status: 500 }
    );
  }
}