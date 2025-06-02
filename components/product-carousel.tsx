"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/product-card";

type Product = {
  id: string
  name: string
  description: string
  price: number
  rating: number
  image: string
  skinType?: string
  category?: string
  stock?: number
}

export default function ProductCarousel() {
  const [products, setProducts] = useState<Product[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle storage changes to refresh products
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'saturn-products' && event.newValue) {
      const updatedProducts = JSON.parse(event.newValue);
      // Sort by rating (highest first) and take top 10
      const sortedProducts = [...updatedProducts]
        .sort((a: Product, b: Product) => b.rating - a.rating)
        .slice(0, 10);
      setProducts(sortedProducts);
    }
  };

  useEffect(() => {
    // Fetch top 10 highest rated products
    const fetchProducts = async () => {
      try {
        // Try to load from localStorage first
        const cachedData = localStorage.getItem('saturn-products');
        
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          // Sort by rating (highest first) and take top 10
          const sortedProducts = [...parsedData]
            .sort((a: Product, b: Product) => b.rating - a.rating)
            .slice(0, 10);
          setProducts(sortedProducts);
        } else {
          // If no cached data, load from JSON
          const response = await fetch('/data/products.json');
          const data = await response.json();
          
          // Sort by rating (highest first) and take top 10
          const sortedProducts = [...data.products]
            .sort((a: Product, b: Product) => b.rating - a.rating)
            .slice(0, 10);
          
          setProducts(sortedProducts);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    
    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const productsToShow = 3; // Always show 3 products at a time
  const maxIndex = Math.max(0, products.length - productsToShow);
  const itemWidth = 100 / 3; // Each item takes up 1/3 of the container

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  // Hide next button when showing the last set of products
  const showNextButton = currentIndex < maxIndex;
  // Hide prev button when at the start
  const showPrevButton = currentIndex > 0;

  return (
    <div className="relative max-w-7xl mx-auto px-8 py-10">
      <h2 className="section-title mb-8 text-4xl font-playfair">Productos Destacados</h2>

      <div className="relative -mx-1">
        {isLoading ? (
          <div className="w-full py-12 flex justify-center">
            <div className="animate-pulse text-gray-400">Cargando productos destacados...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full py-12 text-center text-gray-500">
            No se encontraron productos destacados
          </div>
        ) : (
          <div className="relative w-full overflow-hidden group px-1">
            <div
              ref={containerRef}
              className="flex transition-transform duration-300 ease-out"
              style={{
                transform: `translateX(-${currentIndex * itemWidth}%)`,
              }}
            >
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="h-full flex-shrink-0"
                  style={{ width: `${itemWidth}%` }}
                >
                  <div className="h-full px-1">
                    <ProductCard 
                      product={{
                        ...product,
                        id: typeof product.id === 'string' ? parseInt(product.id) : product.id
                      }}
                      variant="carousel"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Navigation Buttons */}
            <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
              {showPrevButton && (
                <button
                  onClick={prevSlide}
                  className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg z-10 transition-all duration-200 hover:scale-110 ml-1 pointer-events-auto",
                  !showPrevButton && "opacity-0"
                )}>
                  <ChevronLeft className="h-5 w-5 text-mint-green-dark" />
                </button>
              )}
              
              {showNextButton && (
                <button
                  onClick={nextSlide}
                  className={cn(
                  "absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-lg z-10 transition-all duration-200 hover:scale-110 mr-1 pointer-events-auto",
                  !showNextButton && "opacity-0"
                )}>
                  <ChevronRight className="h-5 w-5 text-mint-green-dark" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
