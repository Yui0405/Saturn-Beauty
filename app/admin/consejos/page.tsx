"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Tip } from "@/lib/api-service";
import Image from "next/image";
import { ImageUpload } from "@/components/ui/image-upload";

export default function ConsejosPage() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Tip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    author: "",
  });

  useEffect(() => {
    const fetchTips = async () => {
      try {
        // Intentar cargar desde localStorage primero
        const savedTips = localStorage.getItem('saturn-tips');
        
        if (savedTips) {
          const data = JSON.parse(savedTips);
          setTips(data.tips || []);
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
          }
        }
      } catch (error) {
        console.error("Error cargando consejos:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los consejos",
          variant: "destructive",
        });
      }
    };

    fetchTips();
  }, []);

  const handleEdit = (tip: Tip) => {
    setFormData(tip);
    setEditingId(tip.id);
    // Limpiar errores al editar
    setErrors({
      title: "",
      content: "",
      author: "",
    });
  };
  const validateForm = (): boolean => {
    if (!formData) return false;
    
    const newErrors = {
      title: "",
      content: "",
      author: "",
    };
    let isValid = true;

    // Validar título
    if (!formData.title) {
      newErrors.title = "El título es obligatorio";
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = `El título debe tener máximo 100 caracteres (actual: ${formData.title.length})`;
      isValid = false;
    }

    // Validar contenido
    if (!formData.content) {
      newErrors.content = "El contenido es obligatorio";
      isValid = false;
    } else if (formData.content.length < 20) {
      newErrors.content = `El contenido debe tener al menos 20 caracteres (actual: ${formData.content.length})`;
      isValid = false;
    } else if (formData.content.length > 200) {
      newErrors.content = `El contenido debe tener máximo 200 caracteres (actual: ${formData.content.length})`;
      isValid = false;
    }

    // Validar autor
    if (!formData.author) {
      newErrors.author = "El autor es obligatorio";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (id: string) => {
    if (!formData) return;
    
    // Validar formulario antes de procesar
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      // Actualizar la UI primero
      const updatedTips = tips.map(item => 
        item.id === id ? { ...formData } as Tip : item
      );
      setTips(updatedTips);
      setEditingId(null);
      setFormData(null);

      // Guardar en localStorage
      localStorage.setItem('saturn-tips', JSON.stringify({ tips: updatedTips }));

      toast({
        title: "¡Listo!",
        description: "El consejo se ha actualizado correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar el consejo:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el consejo. Los cambios no persisten después de recargar.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-mint-green-dark mb-2">
          Gestionar Consejos
        </h1>
        <p className="text-gray-600">
          Edita los consejos que se muestran en la página principal
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tips.map((item) => (
          <Card key={item.id} className="overflow-hidden bg-white">
            {editingId === item.id ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Título
                  </label>
                  <Input
                    value={formData?.title}
                    onChange={(e) => {
                      setFormData({ ...formData!, title: e.target.value });
                      // Limpiar error si el usuario está corrigiendo
                      if (errors.title && e.target.value) {
                        setErrors({...errors, title: ""});
                      }
                    }}
                    maxLength={100}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData?.title?.length || 0}/100 caracteres
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Descripción
                  </label>
                  <Textarea
                    value={formData?.content || ''}
                    onChange={(e) => {
                      setFormData({ ...formData!, content: e.target.value });
                      // Limpiar error si el usuario está corrigiendo
                      if (errors.content && e.target.value.length >= 20 && e.target.value.length <= 200) {
                        setErrors({...errors, content: ""});
                      }
                    }}
                    className={`resize-none h-24 ${errors.content ? "border-red-500" : ""}`}
                  />
                  {errors.content && (
                    <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                  )}
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-500 mt-1">
                      Entre 20 y 200 caracteres
                    </p>
                    <p className={`text-xs mt-1 ${(formData?.content?.length || 0) < 20 || (formData?.content?.length || 0) > 200 ? "text-red-500" : "text-gray-500"}`}>
                      {formData?.content?.length || 0}/200
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Autor
                  </label>
                  <Input
                    value={formData?.author || ''}
                    onChange={(e) => {
                      setFormData({ ...formData!, author: e.target.value });
                      // Limpiar error si el usuario está corrigiendo
                      if (errors.author && e.target.value) {
                        setErrors({...errors, author: ""});
                      }
                    }}
                    className={errors.author ? "border-red-500" : ""}
                  />
                  {errors.author && (
                    <p className="text-red-500 text-xs mt-1">{errors.author}</p>
                  )}
                </div>

                <ImageUpload
                  label="Imagen"
                  currentImage={formData?.image || "/placeholder.jpg"}
                  onImageUpload={(url) =>
                    setFormData({ ...formData!, image: url })
                  }
                  type="tips"
                />

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleSave(item.id)}
                    className="text-white bg-[#488d4f] hover:bg-accent-green hover:text-[#488d4f]"
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-mint-green-dark">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {item.content}
                  </p>
                  <div className="flex justify-between items-center">
                    {" "}
                    <p className="text-sm text-mint-green">
                      Por: {item.author}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="text-[#488d4f] border-[#488d4f] hover:bg-[#488d4f] hover:text-white"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
