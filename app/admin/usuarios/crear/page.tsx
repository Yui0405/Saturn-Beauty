"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/ui/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("/images/placeholder.svg");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    avatar: ""
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    name: false,
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s:])/.test(value))
          return 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial';
        return '';
        
      case 'confirmPassword':
        if (value !== formData.password) 
          return 'Las contraseñas no coinciden';
        return '';
        
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors({ ...errors, [field]: error });
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
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen no debe superar los 2MB",
          variant: "destructive",
        });
        return;
      }

      // Validar tipo de archivo
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Por favor sube una imagen en formato JPG, PNG o WebP",
          variant: "destructive",
        });
        return;
      }

      // Crear vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Marcar todos los campos como tocados para mostrar errores
      const allTouched: { [key in keyof typeof touched]: boolean } = Object.keys(touched).reduce((acc, key) => ({
        ...acc,
        [key]: true
      }), {} as { [key in keyof typeof touched]: boolean });
      
      setTouched(allTouched);

      // Validar todos los campos
      const fieldErrors = {} as Record<string, string>;
      let hasErrors = false;

      Object.keys(formData).forEach(field => {
        if (field === 'confirmPassword') return; // Se valida aparte
        
        const error = validateField(field, formData[field as keyof typeof formData]);
        if (error) {
          fieldErrors[field] = error;
          hasErrors = true;
        }
      });

      // Validar confirmación de contraseña
      if (formData.password !== formData.confirmPassword) {
        fieldErrors.confirmPassword = 'Las contraseñas no coinciden';
        hasErrors = true;
      }

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

      // Verificar si el usuario o correo ya existen
      const storedUsers = localStorage.getItem('saturn-users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      const userExists = users.some((user: any) => user.username === formData.username);
      const emailExists = users.some((user: any) => user.email === formData.email);

      if (userExists) {
        toast({
          title: "Error",
          description: "El nombre de usuario ya está en uso",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (emailExists) {
        toast({
          title: "Error",
          description: "El correo electrónico ya está registrado",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Crear nuevo usuario
      const newUser = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        password: formData.password, // En una aplicación real, esto debería estar hasheado
        name: formData.name,
        phone: "", // Mantener compatibilidad con la estructura existente
        address: "", // Mantener compatibilidad con la estructura existente
        avatar: formData.avatar || "/placeholder-user.jpg",
        role: "user",
        createdAt: new Date().toISOString(),
      };

      // Guardar el nuevo usuario
      localStorage.setItem('saturn-users', JSON.stringify([...users, newUser]));

      // Redirigir a la lista de usuarios
      router.push("/admin/usuarios");

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente.",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminForm
      title="Crear Nuevo Usuario"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      backUrl="/admin/usuarios"
    >
      <div className="space-y-6">
        {/* Sección de imagen de perfil */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
            <Image
              src={previewImage}
              alt="Vista previa de la imagen de perfil"
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center">
            <Input
              type="file"
              id="avatar"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="avatar"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mint-green cursor-pointer"
            >
              Subir imagen
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
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`mt-1 w-full ${errors.name && 'border-red-500'}`}
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
              value={formData.username}
              onChange={(e) => handleFieldChange('username', e.target.value)}
              onBlur={() => handleBlur('username')}
              className={`mt-1 w-full ${errors.username && 'border-red-500'}`}
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
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`mt-1 w-full ${errors.email && 'border-red-500'}`}
              required
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`mt-1 w-full pr-10 ${errors.password && 'border-red-500'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {!errors.password && formData.password && (
                <p className="mt-1 text-xs text-green-600">La contraseña cumple con los requisitos</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`mt-1 w-full pr-10 ${errors.confirmPassword && 'border-red-500'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
              {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1 text-xs text-green-600">Las contraseñas coinciden</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
