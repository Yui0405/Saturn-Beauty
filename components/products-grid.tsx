"use client";

import { useState, useEffect } from "react";
import { Grid3X3, List, Star, Heart, ChevronDown, ChevronUp } from "lucide-react";
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
  
  // Estados para controlar el acordeón de filtros
  const [categoryOpen, setCategoryOpen] = useState<boolean>(true);
  const [priceOpen, setPriceOpen] = useState<boolean>(false);
  const [popularityOpen, setPopularityOpen] = useState<boolean>(false);
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
          <div className="bg-white p-6 rounded-lg sticky top-4 space-y-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 text-mint-green-dark">Filtros</h3>
            
            {/* Categoría - Acordeón */}
            <div className="mb-4 border-b border-gray-200 pb-2">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => setCategoryOpen(!categoryOpen)}
              >
                <h3 className="font-semibold text-mint-green-dark">Categoría</h3>
                {categoryOpen ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
              
              {categoryOpen && (
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
                onClick={() => setPriceOpen(!priceOpen)}
              >
                <h3 className="font-semibold text-mint-green-dark">Precio</h3>
                {priceOpen ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
              
              {priceOpen && (
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
                onClick={() => setPopularityOpen(!popularityOpen)}
              >
                <h3 className="font-semibold text-mint-green-dark">Popularidad</h3>
                {popularityOpen ? 
                  <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                }
              </div>
              
              {popularityOpen && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="checkbox"
                      id="pop-alta"
                      checked={minRating >= 4}
                      onChange={() => setMinRating(minRating >= 4 ? 0 : 4)}
                      className="h-4 w-4 rounded border-gray-300 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="pop-alta" className="flex-1 ml-2">
                      Alta
                    </Label>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`h-4 w-4 ${star <= 5 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="checkbox"
                      id="pop-media"
                      checked={minRating >= 3 && minRating < 4}
                      onChange={() => setMinRating(minRating >= 3 && minRating < 4 ? 0 : 3)}
                      className="h-4 w-4 rounded border-gray-300 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="pop-media" className="flex-1 ml-2">
                      Media
                    </Label>
                    <div className="flex">
                      {[1, 2, 3].map((star) => (
                        <Star 
                          key={star}
                          className="h-4 w-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                      {[4, 5].map((star) => (
                        <Star 
                          key={star}
                          className="h-4 w-4 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="checkbox"
                      id="pop-baja"
                      checked={minRating > 0 && minRating < 3}
                      onChange={() => setMinRating(minRating > 0 && minRating < 3 ? 0 : 2)}
                      className="h-4 w-4 rounded border-gray-300 text-[#7ec9a8] focus:ring-[#7ec9a8]"
                    />
                    <Label htmlFor="pop-baja" className="flex-1 ml-2">
                      Baja
                    </Label>
                    <div className="flex">
                      {[1, 2].map((star) => (
                        <Star 
                          key={star}
                          className="h-4 w-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                      {[3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className="h-4 w-4 text-gray-300"
                        />
                      ))}
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
                  setMinRating(0);
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
        <div className="flex-1">
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
                      <h3 className="font-medium text-mint-green-dark mt-1 mb-2 line-clamp-2 h-12 text-base">
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
