"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/ui/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("/placeholder.svg");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    address: "",
    avatar: ""
  });
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
      const validTypes = ["image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Por favor sube una imagen en formato JPG o PNG",
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
      // Validaciones
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Las contraseñas no coinciden.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 8 caracteres.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Cargar usuarios existentes desde localStorage o JSON
      let existingUsers = [];
      const cachedData = localStorage.getItem('saturn-users');
      
      if (cachedData) {
        existingUsers = JSON.parse(cachedData);
      } else {
        const response = await fetch("/data/users.json");
        if (!response.ok) throw new Error("Error cargando usuarios");
        const data = await response.json();
        existingUsers = data.users;
      }

      // Verificar si el usuario/email ya existe
      const userExists = existingUsers.some(
        (u: { username: string; email: string }) =>
          u.username === formData.username || u.email === formData.email
      );

      if (userExists) {
        toast({
          title: "Error",
          description: "El nombre de usuario o email ya existe.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Crear nuevo usuario con todos los campos necesarios
      const newUserId = (Math.max(0, ...existingUsers.map((u: { id: string }) => parseInt(u.id) || 0)) + 1).toString();
      
      const newUser = {
        id: newUserId,
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password, // En una app real esto se hashearía
        role: 'user',
        name: formData.name.trim(),
        bio: "",
        telefono: "",
        direccion: "",
        avatar: formData.avatar || "/placeholder.svg",
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Agregar el nuevo usuario a la lista
      const updatedUsers = [...existingUsers, newUser];
      
      // Guardar en localStorage con formato correcto
      localStorage.setItem('saturn-users', JSON.stringify(updatedUsers, null, 2));
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Usuario creado!",
        description: `El usuario ${newUser.username} ha sido registrado exitosamente.`,
      });
      
      // Redirigir a la lista de usuarios después de 1 segundo
      setTimeout(() => {
        router.push('/admin/usuarios');
      }, 1000);


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
            <input
              type="file"
              id="avatar"
              accept="image/jpeg,image/png"
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
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
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="mt-1 w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="mt-1 w-full"
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Teléfono
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="mt-1 w-full"
            />
          </div>
          <div>
            <Label htmlFor="address" className="text-sm font-medium text-gray-700">
              Dirección
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="mt-1 w-full"
            />
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
