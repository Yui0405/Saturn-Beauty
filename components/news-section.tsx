"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type News = {
  id: string;
  title: string;
  description: string;
  image: string;
  originalUrl: string;
  date: string;
};

export default function NewsSection() {
  const [news, setNews] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news", {
        next: { revalidate: 0 }, // Deshabilitar caché para actualizaciones en tiempo real
      });
      if (response.ok) {
        const data = await response.json();
        setNews(data);
        setError(null);
      } else {
        throw new Error("Error al cargar las noticias");
      }
    } catch (error) {
      console.error("Error al cargar noticias:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Configurar actualización periódica
    const pollInterval = setInterval(fetchNews, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(pollInterval);
  }, []);

  const handleImageError = (id: string) => {
    setImageErrors(prev => ({
      ...prev,
      [id]: true
    }));
  };

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        <p>Error al cargar las noticias. Por favor, intente de nuevo más tarde.</p>
        <Button onClick={fetchNews} variant="outline" className="mt-2">
          Reintentar
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="card overflow-hidden bg-mint-green-light animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {news.map((item) => {
        const hasError = imageErrors[item.id];
        const imageSrc = hasError ? "/placeholder-news.jpg" : (item.image || "/placeholder-news.jpg");
        
        return (
          <div key={item.id} className="card overflow-hidden bg-mint-green-light">
            <div className="relative h-48 bg-gray-100">
              <Image
                src={imageSrc}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                onError={() => handleImageError(item.id)}
              />
              {!hasError && !item.image && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 text-mint-green-dark font-playfair">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-3 font-poppins">
                {item.description}
              </p>
              <a
                href={item.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="link"
                  className="text-mint-green-dark p-0 h-auto font-poppins"
                >
                  Ver más
                </Button>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
