"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/ui/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { User } from "@/lib/user-service";

interface Props {
  params: {
    id: string;
  };
}

export default function EditUserPage({ params }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    avatar: ""
  });

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = () => {
      try {
        // Intentar cargar desde localStorage primero
        const storedUsers = localStorage.getItem('saturn-users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const foundUser = users.find((u: User) => u.id === params.id);
          
          if (foundUser) {
            setUser(foundUser);
            setFormData({
              username: foundUser.username,
              email: foundUser.email,
              name: foundUser.name || "",
              avatar: foundUser.avatar || ""
            });
            if (foundUser.avatar) {
              setPreviewImage(foundUser.avatar);
            }
            return;
          }
        }

        // Si no está en localStorage, cargar desde el JSON
        fetch("/data/users.json")
          .then(res => res.json())
          .then(data => {
            const foundUser = data.users.find((u: User) => u.id === params.id);
            if (foundUser) {
              setUser(foundUser);
              setFormData({
                username: foundUser.username,
                email: foundUser.email,
                name: foundUser.name || "",
                avatar: foundUser.avatar || ""
              });
              if (foundUser.avatar) {
                setPreviewImage(foundUser.avatar);
              }
            } else {
              throw new Error("Usuario no encontrado");
            }
          });
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        });
        router.push("/admin/usuarios");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [params.id, router]);

  // Manejar cambio de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor, sube un archivo de imagen válido (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe pesar más de 2MB",
        variant: "destructive",
      });
      return;
    }

    // Crear URL de previsualización
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      setFormData(prev => ({ ...prev, avatar: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);

      // Obtener usuarios actuales
      let users: User[] = [];
      const storedUsers = localStorage.getItem('saturn-users');
      
      if (storedUsers) {
        users = JSON.parse(storedUsers);
      } else {
        // Si no hay usuarios en localStorage, cargar desde el JSON
        const response = await fetch("/data/users.json");
        const data = await response.json();
        users = data.users || [];
      }

      // Verificar si el email/username ya existe (excluyendo el usuario actual)
      const userExists = users.some(
        (u: User) =>
          u.id !== params.id &&
          (u.username === formData.username || u.email === formData.email)
      );

      if (userExists) {
        toast({
          title: "Error",
          description: "El nombre de usuario o email ya está en uso.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Crear el objeto de usuario actualizado
      const updatedUser: User = {
        ...user,
        username: formData.username,
        email: formData.email,
        name: formData.name,
        avatar: formData.avatar || user.avatar,
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Actualizar usuario en el array
      const updatedUsers = users.map((u: User) => 
        u.id === params.id ? updatedUser : u
      );

      // Guardar en localStorage
      localStorage.setItem('saturn-users', JSON.stringify(updatedUsers));

      // Actualizar el estado local
      setUser(updatedUser);
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Usuario actualizado!",
        description: `Los datos de ${formData.name} han sido actualizados.`,
      });

      // Redirigir a la lista de usuarios después de 1 segundo
      setTimeout(() => {
        // Forzar recarga de la página de lista para asegurar que se vean los cambios
        window.dispatchEvent(new Event('storage'));
        router.push("/admin/usuarios");
      }, 1000);
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint-green"></div>
      </div>
    );
  }

  return (
    <AdminForm
      title="Editar Usuario"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      backUrl="/admin/usuarios"
    >
      <div className="space-y-6">
        {/* Sección de imagen de perfil */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
            {previewImage ? (
              <Image
                src={previewImage}
                alt={`Foto de ${formData.name}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                <span>Sin imagen</span>
              </div>
            )}
          </div>
          <div className="text-center">
            <input
              type="file"
              id="avatar"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="avatar"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-green cursor-pointer"
            >
              Cambiar imagen
            </label>
            <p className="mt-1 text-xs text-gray-500">
              JPG, PNG (máx. 2MB)
            </p>
          </div>
        </div>

        {/* Campos del formulario */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nombre Completo
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Nombre de Usuario
            </Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full"
              required
            />
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
