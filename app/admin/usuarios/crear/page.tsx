"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminForm } from "@/components/ui/admin-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createUser } from "@/lib/user-service";
import { Textarea } from "@/components/ui/textarea";

const roles = ["user", "admin"];

export default function CreateUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "admin" | "user",
    avatar: null as File | null,
    name: "",
    bio: "",
  });
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

      if (!formData.password || formData.password.length < 8) {
        toast({
          title: "Error",
          description: "La contraseña debe tener al menos 8 caracteres.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Obtener usuarios actuales
      const response = await fetch("/data/users.json");
      const { users } = await response.json();

      // Verificar usuario/email duplicado
      const userExists = users.some(
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

      // Crear nuevo usuario
      const newUser = {
        id: (
          Math.max(...users.map((u: { id: string }) => parseInt(u.id)), 0) + 1
        ).toString(),
        username: formData.username,
        email: formData.email,
        password: formData.password, // En una app real esto se hashearía
        role: formData.role,
        name: formData.name,
        bio: formData.bio || "",
        avatar: "/placeholder.svg",
        createdAt: new Date().toISOString(),
      }; // Actualizar el JSON a través de la API
      const updatedUsers = [...users, newUser];
      const saveResponse = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: updatedUsers }),
      });

      if (!saveResponse.ok) {
        throw new Error("Error al guardar el usuario");
      }

      await router.push("/admin/usuarios");

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
        </div>{" "}
        {formData.role === "user" && (
          <div>
            <Label htmlFor="bio">Biografía (opcional)</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
            />
          </div>
        )}
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
        <div>
          <Label htmlFor="role">Rol</Label>
          <Select
            value={formData.role}
            onValueChange={(value) =>
              setFormData({ ...formData, role: value as "admin" | "user" })
            }
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {roles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="avatar">Imagen de Perfil (opcional)</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                  toast({
                    title: "Error",
                    description: "La imagen no debe superar los 2MB",
                    variant: "destructive",
                  });
                  return;
                }

                // Validate file type
                const validTypes = ["image/jpeg", "image/png"];
                if (!validTypes.includes(file.type)) {
                  toast({
                    title: "Error",
                    description:
                      "Por favor sube una imagen en formato JPG o PNG",
                    variant: "destructive",
                  });
                  return;
                }

                try {
                  const formData = new FormData();
                  formData.append("file", file);

                  const uploadResponse = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (!uploadResponse.ok) {
                    throw new Error("Error al subir la imagen");
                  }

                  const { path: imagePath } = await uploadResponse.json();
                  setFormData((prev) => ({
                    ...prev,
                    avatar: imagePath,
                  }));

                  toast({
                    title: "Éxito",
                    description: "Imagen subida correctamente",
                  });
                } catch (error) {
                  console.error("Error uploading image:", error);
                  toast({
                    title: "Error",
                    description: "No se pudo subir la imagen",
                    variant: "destructive",
                  });
                }
              }
            }}
            className="cursor-pointer"
          />
          <p className="text-sm text-gray-500 mt-1">
            Formatos aceptados: JPEG, PNG. Tamaño máximo: 2MB
          </p>
        </div>
      </div>
    </AdminForm>
  );
}
