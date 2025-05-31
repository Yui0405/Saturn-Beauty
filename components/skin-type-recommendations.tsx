"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/product-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample product data by skin type
const productsBySkinType = {
  normal: [
    {
      id: 1,
      name: "Hydrating Face Cream",
      price: 24.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 2,
      name: "Gentle Cleansing Foam",
      price: 18.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 3,
      name: "Vitamin C Serum",
      price: 29.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 4,
      name: "Nourishing Face Mask",
      price: 22.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 5,
      name: "Brightening Eye Cream",
      price: 27.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 6,
      name: "Hydrating Face Mist",
      price: 16.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
  ],
  seca: [
    {
      id: 7,
      name: "Rich Moisturizing Cream",
      price: 26.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 8,
      name: "Hydrating Serum",
      price: 32.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 9,
      name: "Nourishing Cleansing Oil",
      price: 21.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 10,
      name: "Overnight Hydration Mask",
      price: 25.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 11,
      name: "Facial Oil",
      price: 29.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 12,
      name: "Hydrating Toner",
      price: 19.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
  ],
  grasa: [
    {
      id: 13,
      name: "Oil Control Moisturizer",
      price: 23.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 14,
      name: "Purifying Cleanser",
      price: 19.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 15,
      name: "Mattifying Serum",
      price: 28.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 16,
      name: "Clay Mask",
      price: 22.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 17,
      name: "Pore Minimizing Toner",
      price: 18.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 18,
      name: "Oil-Free Sunscreen",
      price: 24.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
  ],
  mixta: [
    {
      id: 19,
      name: "Balancing Moisturizer",
      price: 25.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 20,
      name: "Gentle Foaming Cleanser",
      price: 20.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 21,
      name: "Balancing Serum",
      price: 30.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 22,
      name: "Multi-Zone Mask",
      price: 24.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 23,
      name: "Balancing Toner",
      price: 19.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 24,
      name: "Dual-Action Moisturizer",
      price: 27.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
  ],
  sensible: [
    {
      id: 25,
      name: "Sensitive Skin Moisturizer",
      price: 26.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 26,
      name: "Ultra-Gentle Cleanser",
      price: 21.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 27,
      name: "Calming Serum",
      price: 31.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 28,
      name: "Soothing Mask",
      price: 23.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 29,
      name: "Alcohol-Free Toner",
      price: 18.99,
      rating: 5,
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      id: 30,
      name: "Fragrance-Free Sunscreen",
      price: 25.99,
      rating: 4,
      image: "/placeholder.svg?height=300&width=300",
    },
  ],
};

type SkinType = "normal" | "seca" | "grasa" | "mixta" | "sensible";

export default function SkinTypeRecommendations() {
  const [selectedSkinType, setSelectedSkinType] = useState<SkinType>("normal");
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 3;
  const products = productsBySkinType[selectedSkinType];
  const totalPages = Math.ceil(products.length / productsPerPage);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const handleSkinTypeChange = (skinType: SkinType) => {
    setSelectedSkinType(skinType);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="section-title">Recomendaciones Según Tipo de Piel</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Descubre productos especialmente seleccionados para tu tipo de piel.
          Nuestros expertos han creado estas recomendaciones para ayudarte a
          conseguir los mejores resultados.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
          {(
            ["normal", "seca", "grasa", "mixta", "sensible"] as SkinType[]
          ).map((skinType) => (
            <Button
              key={skinType}
              variant={selectedSkinType === skinType ? "default" : "outline"}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium border",
                selectedSkinType === skinType 
                  ? "bg-mint-green text-mint-green-dark border-mint-green" 
                  : "bg-transparent text-mint-green-dark border-mint-green"
              )}
              onClick={() => handleSkinTypeChange(skinType)}
            >
              {skinType.charAt(0).toUpperCase() + skinType.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {currentProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={currentPage === index + 1 ? "default" : "outline"}
              className={cn(
                "mx-1 min-w-[40px]",
                currentPage === index + 1
                  ? "bg-mint-green hover:bg-accent-green hover:text-mint-green"
                  : "hover:bg-mint-green-light"
              )}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
