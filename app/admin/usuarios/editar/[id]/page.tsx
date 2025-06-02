"use client";

import { useState, useEffect } from "react";
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
import type { User } from "@/lib/user-service";

const roles = ["user", "admin"];

interface Props {
  params: {
    id: string;
  };
}

export default function EditUserPage({ params }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    name: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Cargar usuarios del JSON
        const response = await fetch("/data/users.json");
        const { users } = await response.json();

        const user = users.find((u: User) => u.id === params.id);
        if (user) {
          setUser(user);
          setFormData({
            username: user.username,
            email: user.email,
            name: user.name || ""
          });
        } else {
          toast({
            title: "Error",
            description: "Usuario no encontrado",
            variant: "destructive",
          });
          router.push("/admin/usuarios");
        }
      } catch (error) {
        console.error("Error loading user:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);

      // Obtener usuarios actuales
      const response = await fetch("/data/users.json");
      const { users } = await response.json();

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

      // Actualizar usuario en el array
      const updatedUsers = users.map((u: User) =>
        u.id === params.id
          ? {
              ...u,
              username: formData.username,
              email: formData.email,
              name: formData.name,
              updatedAt: new Date().toISOString(),
            }
          : u
      ); // Guardar en el archivo JSON a través de la API
      const saveResponse = await fetch("/api/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ users: updatedUsers }),
      });

      if (!saveResponse.ok) {
        throw new Error("Error al actualizar el usuario");
      }

      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado exitosamente.",
      });
      router.push("/admin/usuarios");
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description:
          "No se pudo actualizar el usuario. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AdminForm
      title="Editar Usuario"
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
      </div>
    </AdminForm>
  );
}
