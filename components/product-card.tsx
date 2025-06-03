"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star, Heart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { isAuthenticated } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";

type Product = {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  rating: number;
  image: string;
  skinType: string;
  category: string;
  stock: number;
};

type ProductCardProps = {
  product: Product;
  className?: string;
  variant?: 'default' | 'carousel' | 'list';
};

export default function ProductCard({ 
  product, 
  className,
  variant = 'default' 
}: ProductCardProps) {
  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist();
  
  const productId = typeof product.id === 'string' ? parseInt(product.id) : product.id;
  const isWishlisted = isInWishlist(productId);

  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Debes iniciar sesión para agregar productos al carrito.",
        variant: "default",
        action: (
          <Button 
            variant="outline" 
            className="border-mint-green text-mint-green hover:bg-mint-green/10"
            onClick={() => router.push('/login')}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar sesión
          </Button>
        ),
      });
      return;
    }
    
    addItem({
      id: productId,
      name: product.name,
      price: product.price,
      image: product.image
    });
    
    toast({
      title: "Producto agregado",
      description: `${product.name} se ha añadido al carrito.`,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Debes iniciar sesión para agregar productos a favoritos.",
        variant: "default",
        action: (
          <Button 
            variant="outline" 
            className="border-mint-green text-mint-green hover:bg-mint-green/10"
            onClick={() => router.push('/login')}
          >
            <LogIn className="h-4 w-4 mr-2" />
            Iniciar sesión
          </Button>
        ),
      });
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlist(productId);
      toast({
        title: "Eliminado de favoritos",
        description: `${product.name} se ha eliminado de tus favoritos.`,
      });
    } else {
      addToWishlist({
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating,
        category: product.category
      });
      toast({
        title: "Agregado a favoritos",
        description: `${product.name} se ha añadido a tus favoritos.`,
      });
    }
  };

  if (variant === 'list') {
    return (
      <div className={cn(
        'relative flex flex-col sm:flex-row bg-white rounded-lg overflow-hidden border border-gray-100 transition-all duration-300',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-mint-green/30',
        className
      )}>
        {/* Imagen del producto */}
        <div className="relative w-full sm:w-48 h-48 sm:h-auto bg-gray-50 flex-shrink-0">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 192px"
          />
          {/* Botón de favoritos */}
          <button
            onClick={handleToggleWishlist}
            className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
            aria-label={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-colors",
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
              )} 
            />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex-1">
            {product.category && (
              <span className="text-xs text-gray-500 font-medium">
                {product.category}
              </span>
            )}
            
            <h3 className="font-medium text-mint-green-dark mt-1 text-lg">
              {product.name}
            </h3>
            
            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
              {product.description}
            </p>
            
            <div className="mt-3 flex items-center">
              <div className="flex items-center mr-4">
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
              
              <span className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 2
                }).format(product.price)}
              </span>
              
              {product.stock > 0 ? (
                <span className="ml-4 text-sm text-green-600">
                  En stock ({product.stock} unidades)
                </span>
              ) : (
                <span className="ml-4 text-sm text-amber-600">
                  Agotado
                </span>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
            <Button 
              onClick={handleAddToCart}
              className="bg-mint-green hover:bg-accent-green hover:text-mint-green-dark text-sm font-medium h-9 px-6"
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Añadir al carrito' : 'No disponible'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'relative flex flex-col bg-white rounded-lg overflow-hidden border border-gray-100 h-full transition-all duration-300',
        variant === 'carousel' ? 'shadow-sm hover:shadow-lg' : 'hover:shadow-md',
        'hover:-translate-y-1 hover:border-mint-green/30',
        className
      )}
    >
      {/* Imagen del producto */}
      <div className="relative pt-[100%] bg-gray-50">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={product.image || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover"
            sizes={variant === 'carousel' ? "(max-width: 640px) 50vw, 33vw" : "(max-width: 640px) 50vw, 25vw"}
          />
        </div>
        
        {/* Botón de favoritos */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3 left-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
          aria-label={isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-colors",
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
            )} 
          />
        </button>
      </div>
      
      {/* Contenido */}
      <div className="p-4">
        {/* Categoría */}
        {product.category && (
          <span className="text-xs text-gray-500 font-medium">
            {product.category}
          </span>
        )}
        
        {/* Título */}
        <h3 className="font-medium text-mint-green-dark mt-1 mb-2 line-clamp-2 h-12 text-base">
          {product.name}
        </h3>
        
        {/* Valoración y Precio */}
        <div className="mb-3">
          <div className="flex items-center mb-1">
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
          <span className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2
            }).format(product.price)}
          </span>
          
          {product.stock > 0 ? (
            <div className="text-xs text-green-600 mt-1">
              En stock ({product.stock} unidades)
            </div>
          ) : (
            <div className="text-xs text-amber-600 mt-1">
              Agotado
            </div>
          )}
        </div>
        
        {/* Botón de añadir al carrito */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-mint-green hover:bg-accent-green hover:text-mint-green-dark text-sm font-medium h-9"
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Añadir al carrito' : 'No disponible'}
          </Button>
        </div>
      </div>
    </div>
  );
}
