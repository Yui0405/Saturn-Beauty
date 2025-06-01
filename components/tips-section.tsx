"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { Tip } from "@/lib/api-service";

export default function TipsSection() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTips = async () => {
    try {
      // Intentar cargar desde localStorage primero para tener cambios locales
      const savedTips = localStorage.getItem('saturn-tips');
      
      if (savedTips) {
        const data = JSON.parse(savedTips);
        setTips(data.tips || []);
        setError(null);
      } else {
        // Si no hay datos guardados, cargar del archivo JSON
        const response = await fetch("/data/tips.json");
        if (response.ok) {
          const data = await response.json();
          // Convertir los ids numéricos a string si es necesario
          const tipsWithStringIds = data.tips.map((tip: any) => ({
            ...tip,
            id: String(tip.id)
          }));
          setTips(tipsWithStringIds);
          setError(null);
        } else {
          throw new Error("Error cargando consejos");
        }
      }
    } catch (error) {
      console.error("Error cargando consejos:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'saturn-tips') {
        fetchTips();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        <p>Error al cargar consejos. Por favor, intenta nuevamente más tarde.</p>
        <Button onClick={fetchTips} variant="outline" className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="card overflow-hidden bg-white animate-pulse">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tips.map((tip) => (
        <div key={tip.id} className="card overflow-hidden bg-white">
          <div className="relative h-48">
            <Image
              src={tip.image || "/placeholder.svg"}
              alt={tip.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4 text-mint-green-dark font-playfair">
              {tip.title}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 font-poppins">{tip.content}</p>
                <p className="text-sm text-mint-green mt-2 font-poppins">
                  Por: {tip.author}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
