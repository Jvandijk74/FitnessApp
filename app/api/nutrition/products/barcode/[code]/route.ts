import { NextRequest, NextResponse } from 'next/server';
import { getProductByBarcode } from '@/lib/nutrition/openfoodfacts';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const barcode = code;

    if (!barcode) {
      return NextResponse.json(
        { error: 'Barcode is required' },
        { status: 400 }
      );
    }

    console.log(`[API /nutrition/products/barcode] Looking up barcode: ${barcode}`);

    const product = await getProductByBarcode(barcode);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found', barcode },
        { status: 404 }
      );
    }

    console.log(`[API /nutrition/products/barcode] Found product: ${product.name}`);

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('[API /nutrition/products/barcode] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to lookup product',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
