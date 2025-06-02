"use client";

import { useState, useEffect } from "react";
import { Grid3X3, List, Star, Heart, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [maxRating, setMaxRating] = useState<number | null>(null);
  
  // Estado para controlar la sección activa del acordeón
  const [activeSection, setActiveSection] = useState<string | null>('categorias');
  
  // Función para alternar secciones del acordeón
  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  // Cargar productos desde localStorage o JSON
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Iniciando carga de productos...');
        
        // Primero intentamos cargar desde localStorage
        const cachedData = localStorage.getItem('saturn-products');
        
        if (cachedData) {
          // Si hay datos en localStorage, los usamos
          const parsedData = JSON.parse(cachedData);
          console.log('Productos cargados desde localStorage:', parsedData.length);
          setProducts(parsedData);
        } else {
          // Si no hay datos en localStorage, cargamos del JSON
          const response = await fetch('/data/products.json');
          console.log('Respuesta del JSON:', response.status, response.statusText);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Error en la respuesta:', errorText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Datos recibidos del JSON:', data);
          
          const productsData = data.products || [];
          console.log('Productos procesados:', productsData);
          
          // Guardamos en localStorage para futuras cargas
          localStorage.setItem('saturn-products', JSON.stringify(productsData));
          
          if (productsData.length === 0) {
            console.warn('El JSON devolvió una lista vacía de productos');
          }
          
          setProducts(productsData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
        console.error('Error al cargar productos:', errorMessage);
        setError(`No se pudieron cargar los productos: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    
    // Añadir un event listener para detectar cambios en localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'saturn-products' && event.newValue) {
        console.log('Detectado cambio en productos guardados');
        const updatedProducts = JSON.parse(event.newValue);
        setProducts(updatedProducts);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Limpiar el event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
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
            : `${product.image}`)
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
    
    // Filtrar por calificación máxima
    if (maxRating !== null && product.rating > maxRating + 0.9999) {
      return false;
    }
    
    // Filtrar por rango de precio
    const price = Number(product.price);
    if (isNaN(price)) return false;
    
    switch(priceRange) {
      case '0-20':
        return price >= 0 && price <= 20;
      case '20-50':
        return price > 20 && price <= 50;
      case '50-100':
        return price > 50 && price <= 100;
      case '100+':
        return price > 100;
      case 'all':
      default:
        return true;
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
  const toggleCategory = (category: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked
        ? [...prev, category]
        : prev.filter(c => c !== category)
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
    setMaxRating(value[0]);
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
      <div className="flex flex-col md:flex-row gap-8 relative">
        {/* Filtros en el sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg sticky top-4 space-y-6 shadow-sm border border-gray-100 transition-all duration-200 z-10">
            <h3 className="text-xl font-bold mb-6 text-mint-green-dark">Filtros</h3>
            
            {/* Categoría - Acordeón */}
            <div className="mb-4 border-b border-gray-200 pb-2">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('categorias')}
              >
                <h3 className="font-semibold text-mint-green-dark">Categoría</h3>
                {activeSection === 'categorias' ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
              
              {activeSection === 'categorias' && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cat-cuidado" 
                      className="h-4 w-4 rounded border-gray-300 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                      checked={selectedCategories.includes('Cuidado')}
                      onCheckedChange={(checked) => {
                        toggleCategory('Cuidado', !!checked);
                      }}
                    />
                    <Label htmlFor="cat-cuidado">Cuidado</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cat-bienestar" 
                      className="h-4 w-4 rounded border-gray-300 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                      checked={selectedCategories.includes('Bienestar')}
                      onCheckedChange={(checked) => {
                        toggleCategory('Bienestar', !!checked);
                      }}
                    />
                    <Label htmlFor="cat-bienestar">Bienestar</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cat-maquillaje" 
                      className="h-4 w-4 rounded border-gray-300 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                      checked={selectedCategories.includes('Maquillaje')}
                      onCheckedChange={(checked) => {
                        toggleCategory('Maquillaje', !!checked);
                      }}
                    />
                    <Label htmlFor="cat-maquillaje">Maquillaje</Label>
                  </div>
                </div>
              )}
            </div>

            {/* Precio - Acordeón */}
            <div className="mb-4 border-b border-gray-200 pb-2">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('precio')}
              >
                <h3 className="font-semibold text-mint-green-dark">Precio</h3>
                {activeSection === 'precio' ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
              
              {activeSection === 'precio' && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="price-all"
                      name="price-range"
                      checked={priceRange === 'all'}
                      onChange={() => handlePriceRangeChange('all')}
                      className="h-4 w-4 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="price-all">
                      Todos los precios
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="price-0-20"
                      name="price-range"
                      checked={priceRange === '0-20'}
                      onChange={() => handlePriceRangeChange('0-20')}
                      className="h-4 w-4 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="price-0-20">
                      Menos de $20
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="price-20-50"
                      name="price-range"
                      checked={priceRange === '20-50'}
                      onChange={() => handlePriceRangeChange('20-50')}
                      className="h-4 w-4 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="price-20-50">
                      $20 - $50
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="price-50-100"
                      name="price-range"
                      checked={priceRange === '50-100'}
                      onChange={() => handlePriceRangeChange('50-100')}
                      className="h-4 w-4 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="price-50-100">
                      $50 - $100
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="price-100plus"
                      name="price-range"
                      checked={priceRange === '100+'}
                      onChange={() => handlePriceRangeChange('100+')}
                      className="h-4 w-4 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="price-100plus">
                      Más de $100
                    </Label>
                  </div>
                </div>
              )}
            </div>

            {/* Popularidad - Acordeón */}
            <div className="mb-4 border-b border-gray-200 pb-2">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('popularidad')}
              >
                <h3 className="font-semibold text-mint-green-dark">Popularidad</h3>
                {activeSection === 'popularidad' ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
              
              {activeSection === 'popularidad' && (
                <div className="space-y-4 mt-3">
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Calificación máxima</span>
                      <span className="text-sm font-medium text-mint-green-dark">
                        {maxRating === null ? 'Todas' : `Hasta ${maxRating} estrellas`}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-6 w-6 mx-1 ${(maxRating === null || star <= maxRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} cursor-pointer hover:scale-110 transition-transform`}
                            onClick={() => {
                              setMaxRating(star);
                            }}
                            onMouseEnter={(e) => {
                              // Efecto visual al pasar el mouse sobre las estrellas
                              e.currentTarget.classList.add('scale-110');
                            }}
                            onMouseLeave={(e) => {
                              // Restaurar tamaño normal al quitar el mouse
                              e.currentTarget.classList.remove('scale-110');
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Botón Limpiar filtros */}
            <div className="mt-8 mb-4">
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setPriceRange('all');
                  setMaxRating(null);
                  setCurrentPage(1);
                }}
                className="w-full py-2 px-4 border bg-background border-mint-green text-mint-green-dark hover:bg-mint-green/10 hover:text-mint-green-dark rounded transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {/* Controles de vista y ordenación */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded flex items-center justify-center ${viewMode === 'grid' ? 'elim text-white' : 'text-gray-600'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded flex items-center justify-center ${viewMode === 'list' ? 'elim text-white' : 'text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex items-center">
              <span className="mr-2 text-sm font-medium">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#a8e6cf]"
              >
                <option value="name-asc">Nombre (A-Z)</option>
                <option value="name-desc">Nombre (Z-A)</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="rating-desc">Mejor valorados</option>
              </select>
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
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    rating: product.rating,
                    image: product.image,
                    stock: product.stock
                  }}
                  onAddToCart={() => {
                    addItem({
                      id: Number(product.id),
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      quantity: 1
                    });
                  }}
                  onToggleWishlist={() => {
                    if (isInWishlist(parseInt(product.id))) {
                      removeFromWishlist(parseInt(product.id));
                    } else {
                      addToWishlist({
                        id: parseInt(product.id),
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        rating: product.rating,
                        category: product.category
                      });
                    }
                  }}
                  isInWishlist={isInWishlist(parseInt(product.id))}
                  variant={viewMode === 'grid' ? 'grid' : 'list'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron productos que coincidan con los filtros seleccionados.</p>
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4 sm:mb-0">
                <p className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </p>
                <p className="text-sm text-gray-500">
                  ({(currentPage - 1) * productsPerPage + 1}-
                  {Math.min(currentPage * productsPerPage, filteredProducts.length)} de{" "}
                  {filteredProducts.length} productos)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    className="hidden sm:flex"
                  >
                    Primera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex"
                  >
                    Última
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
