"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/product-card"

// Sample product data
const products = [
  {
    id: 1,
    name: "Soft Pinch Tinted Lip Oil",
    price: 19.99,
    rating: 5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 2,
    name: "Hydrating Face Cream",
    price: 24.99,
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
    name: "Gentle Cleansing Foam",
    price: 18.99,
    rating: 4,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 5,
    name: "Exfoliating Toner",
    price: 22.99,
    rating: 5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 6,
    name: "Moisturizing Lip Balm",
    price: 12.99,
    rating: 4,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 7,
    name: "Brightening Eye Cream",
    price: 27.99,
    rating: 5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 8,
    name: "Nourishing Hair Oil",
    price: 23.99,
    rating: 4,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 9,
    name: "Hydrating Face Mist",
    price: 16.99,
    rating: 5,
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    id: 10,
    name: "Overnight Sleeping Mask",
    price: 25.99,
    rating: 4,
    image: "/placeholder.svg?height=300&width=300",
  },
]

export default function ProductCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

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

  const visibleProducts = isMobile ? 1 : 3
  const maxIndex = products.length - visibleProducts

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0))
  }

  const handleNext = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, maxIndex))
  }

  return (
    <div className="relative">
      <h2 className="section-title mb-6">Productos Destacados</h2>

      <div className="relative">
        <div ref={containerRef} className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / visibleProducts)}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className={cn("flex-shrink-0 px-2", isMobile ? "w-full" : "w-1/3")}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <ChevronLeft className="h-6 w-6 text-mint-green-dark" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === maxIndex}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed z-10"
        >
          <ChevronRight className="h-6 w-6 text-mint-green-dark" />
        </button>
      </div>
    </div>
  )
}
