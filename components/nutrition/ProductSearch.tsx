'use client';

import { useState, useRef, useEffect } from 'react';
import { SimplifiedProduct } from '@/lib/nutrition/openfoodfacts';

interface ProductSearchProps {
  onSelectProduct: (product: SimplifiedProduct & { meal_type: string; quantity: number }) => void;
  onCancel: () => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function ProductSearch({ onSelectProduct, onCancel, defaultMealType = 'breakfast' }: ProductSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimplifiedProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SimplifiedProduct | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultMealType);
  const [quantity, setQuantity] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/nutrition/products/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.products);
      } else {
        console.error('Search failed:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBarcodeSearch = async () => {
    if (!barcodeInput.trim()) return;

    setIsLookingUp(true);
    try {
      const response = await fetch(`/api/nutrition/products/barcode/${barcodeInput}`);
      const data = await response.json();

      if (data.success && data.product) {
        setSelectedProduct(data.product);
        setBarcodeInput('');
      } else {
        alert('Product not found. Try searching by name instead.');
      }
    } catch (error) {
      console.error('Error looking up barcode:', error);
      alert('Failed to look up product. Please try again.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const startBarcodeScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopBarcodeScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;

    onSelectProduct({
      ...selectedProduct,
      meal_type: mealType,
      quantity,
    });
  };

  return (
    <div className="space-y-4">
      {/* Meal Type Selector */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Meal Type
        </label>
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value as any)}
          className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      {/* Search Methods Tabs */}
      <div className="flex gap-2 border-b border-surface-elevated">
        <button
          onClick={() => {
            stopBarcodeScanner();
            setSelectedProduct(null);
          }}
          className="px-4 py-2 text-sm font-medium text-text-primary border-b-2 border-primary-500"
        >
          🔍 Search by Name
        </button>
        <button
          onClick={() => {
            setSearchResults([]);
            setSelectedProduct(null);
          }}
          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          📷 Scan Barcode
        </button>
      </div>

      {/* Search by Name */}
      {!isScanning && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for products (e.g., 'banana', 'milk')..."
              className="flex-1 px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="btn-primary disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Manual Barcode Input */}
          <div className="p-3 rounded-lg bg-surface-elevated">
            <p className="text-xs text-text-tertiary mb-2">Or enter barcode manually:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                placeholder="Enter barcode number..."
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
              />
              <button
                onClick={handleBarcodeSearch}
                disabled={isLookingUp}
                className="px-4 py-2 text-sm rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 disabled:opacity-50"
              >
                {isLookingUp ? 'Looking up...' : 'Lookup'}
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && !selectedProduct && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <p className="text-sm text-text-secondary">Found {searchResults.length} products:</p>
              {searchResults.map((product, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedProduct(product)}
                  className="w-full p-3 rounded-lg bg-surface-elevated hover:bg-surface border border-transparent hover:border-primary-500/20 transition text-left"
                >
                  <div>
                    <p className="font-medium text-text-primary">{product.name}</p>
                    {product.brand && (
                      <p className="text-xs text-text-tertiary">{product.brand}</p>
                    )}
                    <div className="flex gap-3 mt-1 text-xs text-text-secondary">
                      <span>{product.calories} kcal</span>
                      <span>P: {product.protein}g</span>
                      <span>C: {product.carbs}g</span>
                      <span>F: {product.fat}g</span>
                    </div>
                    {product.servingSize && (
                      <p className="text-xs text-text-tertiary mt-1">per {product.servingSize}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Product */}
          {selectedProduct && (
            <div className="p-4 rounded-lg bg-surface border border-primary-500/20">
              <div className="mb-4">
                <p className="font-semibold text-text-primary">{selectedProduct.name}</p>
                {selectedProduct.brand && (
                  <p className="text-sm text-text-secondary">{selectedProduct.brand}</p>
                )}
                <div className="flex gap-4 mt-2 text-sm text-text-secondary">
                  <span>{selectedProduct.calories} kcal</span>
                  <span>P: {selectedProduct.protein}g</span>
                  <span>C: {selectedProduct.carbs}g</span>
                  <span>F: {selectedProduct.fat}g</span>
                </div>
                {selectedProduct.servingSize && (
                  <p className="text-xs text-text-tertiary mt-1">per {selectedProduct.servingSize}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Quantity (servings)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  className="w-full px-4 py-2 rounded-lg border border-surface-elevated bg-surface text-text-primary focus:outline-none focus:border-primary-500"
                />
                {quantity !== 1 && (
                  <p className="text-xs text-text-tertiary mt-1">
                    Total: {Math.round(selectedProduct.calories * quantity)} kcal,
                    P: {Math.round(selectedProduct.protein * quantity * 10) / 10}g,
                    C: {Math.round(selectedProduct.carbs * quantity * 10) / 10}g,
                    F: {Math.round(selectedProduct.fat * quantity * 10) / 10}g
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 btn-secondary"
                >
                  Choose Different Product
                </button>
                <button
                  onClick={handleAddProduct}
                  className="flex-1 btn-primary"
                >
                  Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Camera Scanner (placeholder for now) */}
      {isScanning && (
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-48 border-4 border-primary-500 rounded-lg"></div>
            </div>
          </div>
          <p className="text-sm text-text-secondary text-center">
            Note: Automatic barcode scanning requires additional libraries.
            For now, please use manual barcode entry or search by name.
          </p>
          <button
            onClick={stopBarcodeScanner}
            className="w-full btn-secondary"
          >
            Cancel Scanning
          </button>
        </div>
      )}

      {/* Cancel Button */}
      {!selectedProduct && !isScanning && (
        <button
          onClick={onCancel}
          className="w-full btn-secondary"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
