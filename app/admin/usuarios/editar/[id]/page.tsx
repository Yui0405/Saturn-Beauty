"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
    avatar: ""
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    name: false,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    name: "",
  });

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (!/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+)*$/.test(value)) 
          return 'Cada nombre y apellido debe comenzar con mayúscula y solo contener letras';
        if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.length > 50) return 'El nombre no puede exceder los 50 caracteres';
        return '';
        
      case 'username':
        if (!value.trim()) return 'El nombre de usuario es obligatorio';
        if (!/^[a-z0-9_]+$/.test(value)) 
          return 'El usuario solo puede contener minúsculas, números y guiones bajos';
        if (value.length < 3) return 'El usuario debe tener al menos 3 caracteres';
        if (value.length > 20) return 'El usuario no puede exceder los 20 caracteres';
        return '';
        
      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) 
          return 'Ingrese un correo electrónico válido';
        return '';
        
      default:
        return '';
    }
  };

  const handleBlur = (field: 'username' | 'email' | 'name') => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    const error = validateField(field, formData[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleFieldChange = (field: string, value: string) => {
    // Aplicar formato según el campo
    let formattedValue = value;
    
    if (field === 'name') {
      // Solo formatear si el valor no está vacío para evitar borrar el último carácter
      if (value) {
        // Capitalizar primera letra de cada palabra
        formattedValue = value
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    } else if (field === 'username') {
      // Convertir a minúsculas
      formattedValue = value.toLowerCase();
    }
    
    // Actualizar el estado
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Validar si el campo ha sido tocado
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, formattedValue);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  // Cargar usuario al iniciar
  useEffect(() => {
    const loadUser = () => {
      // Asegurarse de que params.id sea un string
      const userId = Array.isArray(params.id) ? params.id[0] : params.id;
      
      if (!userId) {
        toast({
          title: "Error",
          description: "ID de usuario no válido",
          variant: "destructive",
        });
        router.push("/admin/usuarios");
        return;
      }

      try {
        // Intentar cargar desde localStorage primero
        const storedUsers = localStorage.getItem('saturn-users');
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          const foundUser = users.find((u: User) => u.id === userId);
          
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
            const foundUser = data.users.find((u: User) => u.id === userId);
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

      // Marcar todos los campos como tocados para mostrar errores
      const allTouched = {
        username: true,
        email: true,
        name: true
      };
      
      setTouched(allTouched);

      // Validar todos los campos
      const fieldErrors = {} as Record<string, string>;
      let hasErrors = false;

      Object.keys(formData).forEach(field => {
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) {
          fieldErrors[field] = error;
          hasErrors = true;
        }
      });

      // Si hay errores, mostrarlos
      if (hasErrors) {
        setErrors(prev => ({
          ...prev,
          ...fieldErrors
        }));
        
        // Desplazarse al primer error
        const firstErrorField = Object.keys(fieldErrors)[0];
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element?.focus();
          
          toast({
            title: "Error de validación",
            description: "Por favor corrige los errores en el formulario.",
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
        return;
      }

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

      // Verificar si el nombre de usuario ya existe (excluyendo el usuario actual)
      const usernameExists = users.some(
        (u: User) => u.id !== params.id && u.username === formData.username
      );

      if (usernameExists) {
        setErrors(prev => ({
          ...prev,
          username: 'Este nombre de usuario ya está en uso'
        }));
        
        const element = document.getElementById('username');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus();
        
        toast({
          title: "Error",
          description: "El nombre de usuario ya está en uso.",
          variant: "destructive",
        });
        
        setIsLoading(false);
        return;
      }

      // Verificar si el correo electrónico ya existe (excluyendo el usuario actual)
      const emailExists = users.some(
        (u: User) => u.id !== params.id && u.email === formData.email
      );

      if (emailExists) {
        setErrors(prev => ({
          ...prev,
          email: 'Este correo electrónico ya está registrado'
        }));
        
        const element = document.getElementById('email');
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element?.focus();
        
        toast({
          title: "Error",
          description: "El correo electrónico ya está registrado.",
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
    handleFieldChange(name, value);
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
              JPG, PNG, WebP (máx. 2MB)
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
              onBlur={() => handleBlur('name')}
              className={`mt-1 w-full ${errors.name && touched.name ? 'border-red-500' : ''}`}
              required
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
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
              onBlur={() => handleBlur('username')}
              className={`mt-1 w-full ${errors.username && touched.username ? 'border-red-500' : ''}`}
              required
            />
            {errors.username && touched.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
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
              onBlur={() => handleBlur('email')}
              className={`mt-1 w-full ${errors.email && touched.email ? 'border-red-500' : ''}`}
              required
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
