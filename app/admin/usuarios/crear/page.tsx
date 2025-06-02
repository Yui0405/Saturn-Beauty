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
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="username">Nombre de Usuario</Label>
          <Input
            id="username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              minLength={8}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              required
              minLength={8}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Imagen de Perfil</Label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={previewImage}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <Input
                id="avatar"
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formatos: JPG, PNG. Máx. 2MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminForm>
  );
}
