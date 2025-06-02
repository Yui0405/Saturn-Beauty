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
  
  const [touched, setTouched] = useState({
    name: false,
    description: false,
    rating: false,
    price: false,
    stock: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    rating: "",
    price: "",
    stock: "",
  });
  
  // Validate a single field
  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'El nombre del producto es obligatorio';
        if (/^\d/.test(value)) return 'El nombre no puede comenzar con un número';
        if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.length > 100) return `El nombre debe tener máximo 100 caracteres (actual: ${value.length})`;
        return '';
        
      case 'description':
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.length < 10) return `La descripción debe tener al menos 10 caracteres (actual: ${value.length})`;
        if (value.length > 500) return `La descripción debe tener máximo 500 caracteres (actual: ${value.length})`;
        return '';
        
      case 'rating':
        if (isNaN(value) || value < 1 || value > 5) return 'La calificación debe estar entre 1 y 5';
        return '';
        
      case 'price':
        if (isNaN(value) || value <= 0) return 'El precio debe ser mayor a 0';
        if (value > 10000) return 'El precio no puede ser mayor a 10,000';
        return '';
        
      case 'stock':
        if (isNaN(value) || value < 0) return 'El stock no puede ser negativo';
        if (!Number.isInteger(Number(value))) return 'El stock debe ser un número entero';
        if (value > 10000) return 'El stock no puede ser mayor a 10,000';
        return '';
        
      default:
        return '';
    }
  };
  
  // Handle field blur
  const handleBlur = (field: string) => {
    if (!product) return;
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, product[field as keyof typeof product]);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  // Handle field change with validation
  const handleFieldChange = (field: string, value: any) => {
    if (!product) return;
    
    // Update product data
    setProduct({ ...product, [field]: value });
    
    // Only validate if the field has been touched
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };
  
  // Mark all fields as touched when form is submitted
  const markAllAsTouched = () => {
    setTouched({
      name: true,
      description: true,
      rating: true,
      price: true,
      stock: true,
    });
  };
  
  const validateForm = (): boolean => {
    if (!product) return false;
    
    const newErrors = {
      name: validateField('name', product.name),
      description: validateField('description', product.description),
      rating: validateField('rating', product.rating),
      price: validateField('price', product.price),
      stock: validateField('stock', product.stock),
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

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
          setPreviewImage(foundProduct.image || "/images/placeholder.svg");
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
    
    // Mark all fields as touched to show all errors
    markAllAsTouched();
    
    // Validate all fields
    const isFormValid = validateForm();
    
    if (!isFormValid) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      });
      return;
    }

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
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={errors.name ? "border-red-500" : ""}
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.name ? (
              <p className="text-red-500 text-xs">{errors.name}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {product.name.length}/100 caracteres
              </span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={product.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            className={`h-32 ${errors.description ? "border-red-500" : ""}`}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-red-500 text-xs">{errors.description}</p>
            ) : (
              <span className="text-xs text-gray-500">
                {product.description.length}/500 caracteres
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="rating">Calificación</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={product.rating}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string for better UX when deleting
                if (value === '') {
                  handleFieldChange('rating', '');
                  return;
                }
                
                // Allow typing decimal points and numbers
                if (/^\d*\.?\d*$/.test(value)) {
                  const numValue = parseFloat(value);
                  // Only update if it's a valid number within range or in the process of typing
                  if (isNaN(numValue) || (numValue >= 1 && numValue <= 5)) {
                    handleFieldChange('rating', value);
                  }
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === '') {
                  handleFieldChange('rating', 5);
                } else {
                  const numValue = parseFloat(value);
                  if (isNaN(numValue) || numValue < 1) {
                    handleFieldChange('rating', 1);
                  } else if (numValue > 5) {
                    handleFieldChange('rating', 5);
                  } else {
                    handleFieldChange('rating', parseFloat(Number(numValue).toFixed(1)));
                  }
                }
                handleBlur('rating');
              }}
              className={errors.rating ? "border-red-500" : ""}
            />
            {errors.rating && (
              <p className="text-red-500 text-xs mt-1">{errors.rating}</p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              min="0.01"
              step="0.01"
              value={product.price}
              onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
              onBlur={() => handleBlur('price')}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-red-500 text-xs mt-1">{errors.price}</p>
            )}
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
            step="1"
            value={product.stock}
            onChange={(e) => handleFieldChange('stock', parseInt(e.target.value) || 0)}
            onBlur={() => handleBlur('stock')}
            className={errors.stock ? "border-red-500" : ""}
          />
          {errors.stock && (
            <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
          )}
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
