"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { toast } from "@/hooks/use-toast";
import { readUsers, deleteUser, type User } from "@/lib/user-service";

const columns = [
  {
    header: "Usuario",
    accessorKey: "username",
  },
  {
    header: "Nombre",
    accessorKey: "name",
  },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Rol",
    accessorKey: "role",
    cell: ({ row }: { row: User }) => (
      <span
        className={row.role === "admin" ? "text-mint-green font-medium" : ""}
      >
        {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
      </span>
    ),
  },
  {
    header: "Fecha de Registro",
    accessorKey: "createdAt",
    cell: ({ row }: { row: User }) =>
      new Date(row.createdAt).toLocaleDateString(),
  },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // Primero intentar cargar del archivo JSON
      const response = await fetch("/data/users.json");
      if (!response.ok) throw new Error("Error cargando usuarios");

      const data = await response.json();
      setUsers(data.users);

      // Actualizar localStorage con los datos del JSON
      if (typeof window !== "undefined") {
        localStorage.setItem("users", JSON.stringify(data.users));
      }

      setError(null);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });

      // Si falla la carga del JSON, intentar cargar desde localStorage
      try {
        const data = readUsers();
        setUsers(data);
      } catch (localStorageErr) {
        console.error("Error loading from localStorage:", localStorageErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      // No permitir eliminar al administrador principal
      const userToDelete = users.find((user) => user.id === id);
      if (userToDelete?.username === "lisbethAdmin") {
        toast({
          title: "Acción no permitida",
          description: "No se puede eliminar al administrador principal.",
          variant: "destructive",
        });
        return;
      }

      deleteUser(id);
      setUsers(users.filter((user) => user.id !== id));
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-mint-green-dark mb-2">
            Gestionar Usuarios
          </h1>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
        <div className="animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-gray-100 mb-4 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-mint-green-dark">
          Gestionar Usuarios
        </h1>
        <p className="text-gray-600">
          Administra los usuarios registrados en la plataforma
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        data={users}
        onDelete={handleDelete}
        createLink="/admin/usuarios/crear"
        editPathPrefix="/admin/usuarios/editar"
        searchPlaceholder="Buscar usuarios..."
        itemsPerPage={10}
      />
    </div>
  );
}
