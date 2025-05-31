"use client";

import { useState, useEffect } from "react";
import { Grid3X3, List, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/product-card";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import Image from "next/image";

type Product = {
  id: string;
  name: string;
  description: string;
  rating: number;
  skinType: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  popularity?: string;
};

type ProductsResponse = {
  products: Product[];
};

type ViewMode = "grid" | "list";
type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc" | "rating-desc";

export default function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);
  const [minRating, setMinRating] = useState<number>(0);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Iniciando carga de productos...');
        const response = await fetch('/api/products');
        console.log('Respuesta de la API:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error en la respuesta:', errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Datos recibidos:', data);
        
        const productsData = Array.isArray(data) ? data : (data.products || []);
        console.log('Productos procesados:', productsData);
        
        if (productsData.length === 0) {
          console.warn('La API devolvió una lista vacía de productos');
        }
        
        setProducts(productsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error al cargar productos:', errorMessage);
        setError(`No se pudieron cargar los productos: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Procesar productos
  const processedProducts = products.map(product => {
    // Asegurarse de que el producto tenga todos los campos necesarios
    const processedProduct = {
      ...product,
      // Asegurarse de que la URL de la imagen sea válida
      image: product.image 
        ? (product.image.startsWith('http') || product.image.startsWith('/') 
            ? product.image 
            : `/images/products/${product.image}`)
        : '/images/placeholder-product.jpg',
      // Asegurarse de que el precio sea un número
      price: Number(product.price) || 0,
      // Asegurarse de que la calificación sea un número entre 0 y 5
      rating: Math.min(5, Math.max(0, Number(product.rating) || 0)),
      // Asignar una popularidad basada en la calificación para compatibilidad
      popularity: product.popularity || 
                 (product.rating >= 4.5 ? 'alta' : product.rating >= 3.5 ? 'media' : 'baja')
    };
    
    return processedProduct;
  });

  // Filtrar productos
  const filteredProducts = processedProducts.filter(product => {
    // Filtrar por categoría
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    
    // Filtrar por rango de precio
    const price = Number(product.price);
    if (isNaN(price)) return false;
    
    switch(priceRange) {
      case '0-20':
        if (price > 20) return false;
        break;
      case '20-50':
        if (price <= 20 || price > 50) return false;
        break;
      case '50-100':
        if (price <= 50 || price > 100) return false;
        break;
      case '100+':
        if (price <= 100) return false;
        break;
      case 'all':
      default:
        // No filtrar por precio
        break;
    }
    
    // Filtrar por calificación mínima
    if (product.rating < minRating) {
      return false;
    }
    
    return true;
  });

  // Lógica de paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Ordenar productos
  const sortedProducts = [...currentProducts].sort((a, b) => {
    // Ordenar por nombre ascendente por defecto
    if (!sortBy) return a.name.localeCompare(b.name);
    
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return Number(a.price) - Number(b.price);
      case 'price-desc':
        return Number(b.price) - Number(a.price);
      case 'rating-desc':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Obtener categorías únicas
  const categories = [...new Set(products.map(p => p.category))];

  // Función para manejar el cambio de categorías
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1); // Resetear a la primera página al cambiar filtros
  };

  // Función para manejar el cambio de rango de precios
  const handlePriceRangeChange = (value: string) => {
    setPriceRange(value);
    setCurrentPage(1);
  };

  // Función para manejar el cambio de calificación mínima
  const handleRatingChange = (value: number[]) => {
    setMinRating(value[0]);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-mint-green-light rounded-lg p-4 animate-pulse">
            <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filtros en el sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-4 space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Categorías</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <Label htmlFor={`cat-${category}`} className="capitalize">
                      {category}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Rango de precios</h3>
              <div className="space-y-2">
                {['all', '0-20', '20-50', '50-100', '100+'].map(range => (
                  <div key={range} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`price-${range}`}
                      name="price-range"
                      checked={priceRange === range}
                      onChange={() => handlePriceRangeChange(range)}
                      className="h-4 w-4 text-mint-green focus:ring-mint-green"
                    />
                    <Label htmlFor={`price-${range}`} className="capitalize">
                      {range === 'all' ? 'Todos los precios' : 
                       range === '0-20' ? 'Menos de $20' :
                       range === '20-50' ? '$20 - $50' :
                       range === '50-100' ? '$50 - $100' : 'Más de $100'}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Valoración mínima</h3>
              <div className="px-2">
                <Slider
                  value={[minRating]}
                  max={5}
                  step={0.5}
                  onValueChange={handleRatingChange}
                  className="my-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>0</span>
                  <div className="flex items-center">
                    {Array(5).fill(0).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(minRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="ml-1">{minRating.toFixed(1)}</span>
                  </div>
                  <span>5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          {/* Controles de vista y ordenación */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-10 w-10',
                  viewMode === 'grid' ? 'bg-mint-green hover:bg-accent-green' : 'hover:bg-mint-green-light'
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className={cn(
                  'h-10 w-10',
                  viewMode === 'list' ? 'bg-mint-green hover:bg-accent-green' : 'hover:bg-mint-green-light'
                )}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select 
                value={sortBy} 
                onValueChange={(value) => setSortBy(value as SortOption)}
                defaultValue="name-asc"
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                  <SelectItem value="rating-desc">Mejor valorados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid de productos */}
          {sortedProducts.length > 0 ? (
            <div className={cn(
              'grid gap-6',
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1 space-y-4'
            )}>
              {sortedProducts.map((product) => (
                viewMode === 'grid' ? (
                  <div 
                    key={product.id}
                    className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  >
                    {/* Badge Nuevo */}
                    <div className="absolute top-3 right-3 bg-mint-green text-white text-xs font-medium px-2 py-1 rounded-md z-10">
                      Nuevo
                    </div>
                    
                    {/* Imagen del producto */}
                    <div className="relative pt-[100%] bg-gray-50">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Botón de favoritos */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isInWishlist(parseInt(product.id))) {
                            removeFromWishlist(parseInt(product.id));
                          } else {
                            addToWishlist({
                              id: parseInt(product.id),
                              name: product.name,
                              price: product.price,
                              image: product.image
                            });
                          }
                        }}
                        className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
                      >
                        <Heart 
                          className={`h-5 w-5 ${isInWishlist(parseInt(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                        />
                      </button>
                    </div>
                    
                    {/* Contenido */}
                    <div className="p-4">
                      {/* Categoría */}
                      <span className="text-xs text-gray-500 font-medium">
                        {product.category}
                      </span>
                      
                      {/* Título */}
                      <h3 className="font-medium text-gray-900 mt-1 mb-2 line-clamp-2 h-12 text-base">
                        {product.name}
                      </h3>
                      
                      {/* Valoración */}
                      <div className="flex items-center mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                      </div>
                      
                      {/* Precio y botón */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              quantity: 1
                            });
                          }}
                          className="bg-mint-green hover:bg-accent-green hover:text-mint-green-dark text-sm font-medium px-3 py-1 h-8 text-xs"
                        >
                          Añadir al carrito
                        </Button>
                        <span className="text-base font-bold text-gray-900">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2
                          }).format(product.price)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInWishlist(parseInt(product.id))) {
                              removeFromWishlist(parseInt(product.id));
                            } else {
                              addToWishlist({
                                id: parseInt(product.id),
                                name: product.name,
                                price: product.price,
                                image: product.image
                              });
                            }
                          }}
                          className="p-1 rounded-full hover:bg-gray-100"
                          aria-label={isInWishlist(parseInt(product.id)) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                        >
                          <Heart 
                            className={`h-5 w-5 ${isInWishlist(parseInt(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div 
                    key={product.id}
                    className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 mb-4"
                  >
                    <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                      <Image
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                        <h3 className="text-xl font-medium text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 2
                            }).format(product.price)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isInWishlist(parseInt(product.id))) {
                                removeFromWishlist(parseInt(product.id));
                              } else {
                                addToWishlist({
                                  id: parseInt(product.id),
                                  name: product.name,
                                  price: product.price,
                                  image: product.image
                                });
                              }
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors mt-1"
                            aria-label={isInWishlist(parseInt(product.id)) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                          >
                            <Heart 
                              className={`h-5 w-5 ${isInWishlist(parseInt(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                            />
                          </button>
                        </div>
                      </div>
                      
                      <span className="text-xs text-gray-500 font-medium mb-2">
                        {product.category}
                      </span>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center">
                            <div className="flex mr-1">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.rating})</span>
                          </div>
                          
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                quantity: 1
                              });
                            }}
                            className="bg-mint-green hover:bg-accent-green hover:text-mint-green-dark text-sm font-medium px-4 py-2 h-10"
                          >
                            Añadir al carrito
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron productos que coincidan con los filtros seleccionados.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange('all');
                  setMinRating(0);
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <Button
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="w-10 h-10 p-0"
              >
                «
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Mostrar siempre 5 números de página, centrados en la página actual
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    className={`w-10 h-10 p-0 ${
                      currentPage === pageNum ? 'bg-mint-green hover:bg-accent-green' : ''
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="w-10 h-10 p-0"
              >
                »
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
