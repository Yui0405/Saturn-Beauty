"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/lib/api-service";

const columns = [
  {
    header: "Nombre",
    accessorKey: "name",
  },
  {
    header: "Calificación",
    accessorKey: "rating",
    cell: ({ row }: { row: Product }) => {
      const rating = row.rating;
      const stars =
        rating < 2 ? 1 : rating < 3 ? 2 : rating < 4 ? 3 : rating < 5 ? 4 : 5;
      return "⭐".repeat(stars);
    },
  },
  {
    header: "Tipo de Piel",
    accessorKey: "skinType",
  },
  {
    header: "Categoría",
    accessorKey: "category",
  },
  {
    header: "Precio",
    accessorKey: "price",
    cell: ({ row }: { row: Product }) => `$${row.price.toFixed(2)}`,
  },
  {
    header: "Stock",
    accessorKey: "stock",
    cell: ({ row }: { row: Product }) => (
      <span className={row.stock <= 5 ? "text-red-600 font-medium" : ""}>
        {row.stock} unidades
      </span>
    ),
  },
];

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/data/products.json");
      if (!response.ok) throw new Error("Error cargando productos");

      const data = await response.json();
      setProducts(data.products);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error as Error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      // Optimistic update
      const previousProducts = [...products];
      setProducts(products.filter((p) => p.id !== id));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update localStorage to persist the change
      const updatedProducts = products.filter((p) => p.id !== id);
      localStorage.setItem("cachedProducts", JSON.stringify(updatedProducts));

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      // Revert on error
      setProducts(products);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-mint-green-dark mb-2">
            Gestionar Productos
          </h1>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-gray-100 mb-4 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-mint-green-dark mb-2">
          Gestionar Productos
        </h1>
        <p className="text-gray-600">
          Administra el catálogo de productos de la tienda
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        data={products}
        onDelete={handleDelete}
        createLink="/admin/productos/crear"
        editPathPrefix="/admin/productos/editar"
        searchPlaceholder="Buscar productos..."
      />
    </div>
  );
}
