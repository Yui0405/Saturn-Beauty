"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type Tip = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  image: string;
};

export default function TipsSection() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTips = async () => {
    try {
      const response = await fetch("/api/tips", {
        next: { revalidate: 0 }, // Disable cache for real-time updates
      });
      if (response.ok) {
        const data = await response.json();
        setTips(data);
        setError(null);
      } else {
        throw new Error("Error fetching tips");
      }
    } catch (error) {
      console.error("Error fetching tips:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();

    // Set up real-time polling
    const pollInterval = setInterval(fetchTips, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, []);

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        <p>Error loading tips. Please try again later.</p>
        <Button onClick={fetchTips} variant="outline" className="mt-2">
          Retry
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
                <p className="text-gray-600 font-poppins">{tip.description}</p>
                <p className="text-sm text-mint-green mt-2 font-poppins">
                  Por: {tip.authorName}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
