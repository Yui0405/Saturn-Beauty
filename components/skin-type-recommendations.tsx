"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/product-card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";

type Product = {
  id: string | number;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  skinType: string;
  category: string;
  stock: number;
};

// Skin type mapping to match with product data
const skinTypeMap = {
  normal: "normal",
  seca: "seca",
  grasa: "grasa",
  mixta: "mixta",
  sensible: "sensible"
};

// Number of products per page
const PRODUCTS_PER_PAGE = 3;

type SkinType = keyof typeof skinTypeMap;

export default function SkinTypeRecommendations() {
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType>('normal');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  // Load products from localStorage or JSON
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First try to load from localStorage
        const cachedData = localStorage.getItem('saturn-products');
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setProducts(parsedData);
        } else {
          // If no data in localStorage, load from JSON
          const response = await fetch('/data/products.json');
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          const productsData = data.products || [];
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Error al cargar los productos. Por favor, intente de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by selected skin type (include 'Todas' for all skin types)
  const filteredProducts = products.filter(
    (product) => {
      const productSkinType = product.skinType?.toLowerCase();
      const selectedSkinTypeValue = skinTypeMap[selectedSkinType];
      return productSkinType === selectedSkinTypeValue || productSkinType === 'todas';
    }
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  const handlePageChange = (newPage: number, e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-pulse text-gray-400">Cargando recomendaciones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-mint-green-dark mb-2">
          Recomendaciones para tu tipo de piel
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Descubre los productos más adecuados para tu tipo de piel. Selecciona tu tipo de piel para ver nuestras recomendaciones.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {Object.entries({
          normal: 'Piel Normal',
          seca: 'Piel Seca',
          grasa: 'Piel Grasa',
          mixta: 'Piel Mixta',
          sensible: 'Piel Sensible'
        }).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedSkinType === key ? 'default' : 'outline'}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium border',
              selectedSkinType === key && 'bg-mint-green text-mint-green-dark border-mint-green hover:!bg-mint-green hover:!text-mint-green-dark',
              selectedSkinType !== key && 'bg-transparent text-mint-green-dark border-mint-green hover:bg-mint-green-light'
            )}
            style={selectedSkinType === key ? { pointerEvents: 'none' } : {}}
            onClick={() => {
              setSelectedSkinType(key as SkinType);
              setCurrentPage(1);
            }}
          >
            {label}
          </Button>
        ))}
      </div>

      {paginatedProducts.length > 0 ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="h-full"
              />
            ))}
          </div>

          {/* Pagination - Always visible */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <p className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </p>
              <p className="text-sm text-gray-500">
                ({(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
                {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} de{" "}
                {filteredProducts.length} productos)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handlePageChange(1, e)}
                  disabled={currentPage === 1}
                  className="hidden sm:flex"
                >
                  Primera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handlePageChange(Math.max(1, currentPage - 1), e)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handlePageChange(Math.min(totalPages, currentPage + 1), e)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handlePageChange(totalPages, e)}
                  disabled={currentPage === totalPages}
                  className="hidden sm:flex"
                >
                  Última
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron productos para este tipo de piel.</p>
        </div>
      )}
    </div>
  );
}
