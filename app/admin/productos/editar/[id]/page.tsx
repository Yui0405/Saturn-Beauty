"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/ui/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Product } from "@/lib/api-service";

const skinTypes = ["Todas", "Normal", "Seca", "Mixta", "Sensible", "Grasa"];
const categories = ["Cuidado", "Bienestar", "Maquillaje"];

export default function EditarProductoPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        let foundProduct: Product | undefined;
        
        // 1. Buscar primero en localStorage
        const cachedData = localStorage.getItem('saturn-products');
        if (cachedData) {
          const products = JSON.parse(cachedData);
          foundProduct = products.find((p: Product) => p.id === params.id);
        }
        
        // 2. Si no se encuentra, buscar en el JSON
        if (!foundProduct) {
          const response = await fetch("/data/products.json");
          const data = await response.json();
          foundProduct = data.products.find((p: Product) => p.id === params.id);
        }

        if (foundProduct) {
          setProduct(foundProduct);
          // Asegurarse de que siempre haya una imagen de vista previa
          setPreviewImage(foundProduct.image || "/images/placeholder-product.jpg");
        } else {
          toast({
            title: "Error",
            description: "Producto no encontrado",
            variant: "destructive",
          });
          router.push("/admin/productos");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Error cargando el producto",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      setIsLoading(true);

      // Cargar productos existentes desde localStorage o desde el JSON si no hay datos
      let existingProducts: Product[] = [];
      const cachedData = localStorage.getItem('saturn-products');
      
      if (cachedData) {
        existingProducts = JSON.parse(cachedData);
      } else {
        // Si no hay datos en localStorage, cargamos del JSON
        const response = await fetch("/data/products.json");
        if (!response.ok) throw new Error("Error cargando productos");
        const data = await response.json();
        existingProducts = data.products;
      }

      // Encontrar el índice del producto a actualizar
      const productIndex = existingProducts.findIndex(p => p.id === product.id);
      
      if (productIndex === -1) {
        throw new Error("Producto no encontrado");
      }

      // Actualizar el producto en el array
      existingProducts[productIndex] = product;
      
      // Guardar en localStorage
      localStorage.setItem('saturn-products', JSON.stringify(existingProducts));

      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      });

      router.push("/admin/productos");
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-96 bg-gray-100 rounded"></div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <AdminForm
      title="Editar Producto"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      backUrl="/admin/productos"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Producto</Label>
          <Input
            id="name"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            required
            className="h-32"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rating">Calificación</Label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={product.rating}
              onChange={(e) =>
                setProduct({ ...product, rating: parseFloat(e.target.value) })
              }
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={product.price}
              onChange={(e) =>
                setProduct({ ...product, price: parseFloat(e.target.value) })
              }
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="skinType">Tipo de Piel</Label>
            <Select
              value={product.skinType}
              onValueChange={(value) =>
                setProduct({ ...product, skinType: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccionar tipo de piel" />
              </SelectTrigger>
              <SelectContent>
                {skinTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={product.category}
              onValueChange={(value) =>
                setProduct({ ...product, category: value })
              }
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="stock">Cantidad en Existencia</Label>
          <Input
            id="stock"
            type="number"
            min="0"
            value={product.stock}
            onChange={(e) =>
              setProduct({ ...product, stock: parseInt(e.target.value) })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="image">Imagen del Producto</Label>
          <div className="flex items-center space-x-4">
            <div className="relative w-32 h-32">
              <Image
                src={previewImage}
                alt={product.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    toast({
                      title: "Error",
                      description: "La imagen no debe superar los 5MB",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Validate file type
                  const validTypes = ["image/jpeg", "image/png", "image/webp"];
                  if (!validTypes.includes(file.type)) {
                    toast({
                      title: "Error",
                      description:
                        "Por favor sube una imagen en formato JPG, PNG o WebP",
                      variant: "destructive",
                    });
                    return;
                  }

                  // Create temporary preview URL
                  const previewUrl = URL.createObjectURL(file);
                  setPreviewImage(previewUrl);
                  setProduct({ ...product, image: previewUrl });
                }
              }}
            />
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
