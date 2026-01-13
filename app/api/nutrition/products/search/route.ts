import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/nutrition/openfoodfacts';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10'); // Reduced for faster response

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    console.log(`[API /nutrition/products/search] Searching for: "${query}"`);

    const products = await searchProducts(query, page, pageSize);

    console.log(`[API /nutrition/products/search] Found ${products.length} products`);

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('[API /nutrition/products/search] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to search products',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
