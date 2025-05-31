"use client"

import { useState, useEffect } from "react"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          variant="ghost"
          className="fixed bottom-6 right-6 bg-mint-green-dark text-white hover:bg-mint-green-dark hover:text-white p-3 rounded-full shadow-md z-50"
          style={{ transition: "none" }}
          aria-label="Volver al inicio"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}
