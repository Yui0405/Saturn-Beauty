"use client";

import Image from "next/image";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    price: number;
    rating: number;
    image: string;
  };
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleToggleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
  };

  return (
    <div className="product-card flex flex-col">
      <div className="relative pt-[100%] bg-gray-100">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover p-4"
        />
        <Button
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
          onClick={handleToggleWishlist}
        >
          <Heart
            className={cn(
              "h-5 w-5",
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-500"
            )}
          />
          <span className="sr-only">
            {isWishlisted ? "Quitar de favoritos" : "Añadir a favoritos"}
          </span>
        </Button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-playfair font-medium text-lg mb-1 text-mint-green-dark">
          {product.name}
        </h3>
        <div className="flex mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.floor(product.rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <div className="mt-auto">
          <p className="text-xl font-playfair font-bold mb-2 text-mint-green-dark">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
            }).format(product.price)}
          </p>
          <Button
            onClick={handleAddToCart}
            className="w-full font-poppins bg-mint-green hover:bg-accent-green hover:text-mint-green-dark"
          >
            Añadir al Carrito
          </Button>
        </div>
      </div>
    </div>
  );
}
