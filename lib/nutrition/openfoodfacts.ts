/**
 * OpenFoodFacts API Integration
 * API Documentation: https://world.openfoodfacts.org/data
 */

export interface OpenFoodFactsProduct {
  code: string; // Barcode
  product_name: string;
  brands?: string;
  quantity?: string;
  serving_size?: string;
  nutriments: {
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
    'proteins_100g'?: number;
    'proteins_serving'?: number;
    'carbohydrates_100g'?: number;
    'carbohydrates_serving'?: number;
    'fat_100g'?: number;
    'fat_serving'?: number;
  };
  image_url?: string;
  image_small_url?: string;
}

export interface SearchResult {
  products: OpenFoodFactsProduct[];
  count: number;
  page: number;
  page_size: number;
}

export interface SimplifiedProduct {
  barcode: string;
  name: string;
  brand?: string;
  servingSize?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

const API_BASE_URL = 'https://world.openfoodfacts.org/api/v2';

/**
 * Search for products by name
 * Optimized to only fetch essential nutritional data for fast response
 */
export async function searchProducts(
  query: string,
  page: number = 1,
  pageSize: number = 10 // Reduced from 20 for faster response
): Promise<SimplifiedProduct[]> {
  try {
    // Only request essential fields - no images for speed
    const fields = 'code,product_name,brands,serving_size,nutriments';

    const response = await fetch(
      `${API_BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page=${page}&page_size=${pageSize}&fields=${fields}`,
      {
        headers: {
          'User-Agent': 'FitnessApp/1.0.0',
        },
        // Add timeout for faster failure
        signal: AbortSignal.timeout(10000), // 10 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }

    const data: SearchResult = await response.json();
    return data.products.map(simplifyProduct).filter((p) => p !== null) as SimplifiedProduct[];
  } catch (error) {
    console.error('[OpenFoodFacts] Error searching products:', error);
    throw error;
  }
}

/**
 * Get product by barcode
 * Optimized to only fetch essential nutritional data for fast response
 */
export async function getProductByBarcode(barcode: string): Promise<SimplifiedProduct | null> {
  try {
    // Only request essential fields - no images for speed
    const fields = 'code,product_name,brands,serving_size,nutriments';

    const response = await fetch(
      `${API_BASE_URL}/product/${barcode}?fields=${fields}`,
      {
        headers: {
          'User-Agent': 'FitnessApp/1.0.0',
        },
        // Add timeout for faster failure
        signal: AbortSignal.timeout(8000), // 8 second timeout
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`OpenFoodFacts API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 0 || !data.product) {
      return null; // Product not found
    }

    return simplifyProduct(data.product);
  } catch (error) {
    console.error('[OpenFoodFacts] Error fetching product by barcode:', error);
    throw error;
  }
}

/**
 * Simplify OpenFoodFacts product data to our format
 */
function simplifyProduct(product: OpenFoodFactsProduct): SimplifiedProduct | null {
  // Prefer serving values, fallback to 100g values
  const caloriesServing = product.nutriments['energy-kcal_serving'];
  const calories100g = product.nutriments['energy-kcal_100g'];
  const proteinServing = product.nutriments['proteins_serving'];
  const protein100g = product.nutriments['proteins_100g'];
  const carbsServing = product.nutriments['carbohydrates_serving'];
  const carbs100g = product.nutriments['carbohydrates_100g'];
  const fatServing = product.nutriments['fat_serving'];
  const fat100g = product.nutriments['fat_100g'];

  // If we have serving data, use it
  if (caloriesServing && proteinServing !== undefined && carbsServing !== undefined && fatServing !== undefined) {
    return {
      barcode: product.code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands,
      servingSize: product.serving_size,
      calories: Math.round(caloriesServing),
      protein: Math.round(proteinServing * 10) / 10,
      carbs: Math.round(carbsServing * 10) / 10,
      fat: Math.round(fatServing * 10) / 10,
    };
  }

  // Otherwise use 100g data
  if (calories100g && protein100g !== undefined && carbs100g !== undefined && fat100g !== undefined) {
    return {
      barcode: product.code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands,
      servingSize: '100g',
      calories: Math.round(calories100g),
      protein: Math.round(protein100g * 10) / 10,
      carbs: Math.round(carbs100g * 10) / 10,
      fat: Math.round(fat100g * 10) / 10,
    };
  }

  // Not enough nutritional data
  return null;
}
