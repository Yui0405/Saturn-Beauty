"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { toast } from "@/hooks/use-toast";
import { readUsers, deleteUser, type User } from "@/lib/user-service";
import { LuPlus } from "react-icons/lu";

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
    accessorKey: "joinDate",
    cell: ({ row }: { row: User }) =>
      new Date(row.joinDate).toLocaleDateString(),
  },
];

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Función para cargar usuarios desde localStorage
  const loadFromLocalStorage = () => {
    const storedUsers = localStorage.getItem('saturn-users');
    if (storedUsers) {
      const usersData = JSON.parse(storedUsers);
      const formattedUsers = usersData.map((user: User) => ({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        role: (user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
        name: user.name || '',
        avatar: user.avatar || '/placeholder.svg',
        bio: user.bio || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        password: user.password || '',
        joinDate: user.joinDate || new Date().toISOString(),
        lastLogin: user.lastLogin || new Date().toISOString(),
        createdAt: user.createdAt || new Date().toISOString()
      }));
      setUsers(formattedUsers);
    }
  };

  useEffect(() => {
    // Cargar usuarios al montar el componente
    loadUsers();
    
    // Función para manejar actualizaciones de usuarios
    const handleUsersUpdated = (event: CustomEvent) => {
      if (event.detail && event.detail.users) {
        // Si recibimos usuarios en el evento, actualizamos el estado
        setUsers(event.detail.users);
      } else {
        // Si no, recargamos los usuarios
        loadFromLocalStorage();
      }
    };

    // Escuchar eventos personalizados para actualizar la lista
    window.addEventListener('usersUpdated', handleUsersUpdated as EventListener);
    
    // Escuchar eventos de almacenamiento para actualizar la lista cuando cambien los datos
    const handleStorageChange = () => {
      loadFromLocalStorage();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Limpiar los event listeners al desmontar el componente
    return () => {
      window.removeEventListener('usersUpdated', handleUsersUpdated as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      
      // 1. Primero intentar cargar desde localStorage
      let usersData: User[] = [];
      const storedUsers = localStorage.getItem('saturn-users');
      
      if (storedUsers) {
        // Si hay datos en localStorage, usarlos
        usersData = JSON.parse(storedUsers);
      } else {
        // 2. Si no hay datos en localStorage, cargar desde el archivo JSON
        const response = await fetch("/data/users.json");
        if (!response.ok) throw new Error("Error cargando usuarios desde el archivo");
        
        const data = await response.json();
        usersData = data.users || [];
        
        // Guardar en localStorage para futuras cargas
        localStorage.setItem('saturn-users', JSON.stringify(usersData));
      }
      
      // Asegurarse de que los datos tengan el formato correcto
      const formattedUsers = usersData.map(user => ({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        role: (user.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
        name: user.name || '',
        avatar: user.avatar || '/placeholder.svg',
        bio: user.bio || '',
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        password: user.password || '',
        joinDate: user.joinDate || new Date().toISOString(),
        lastLogin: user.lastLogin || new Date().toISOString(),
        createdAt: user.createdAt || new Date().toISOString()
      }));
      
      setUsers(formattedUsers);
      setError(null);
      
      // 3. Cargar en segundo plano desde el JSON para sincronizar (solo si no hay datos en localStorage)
      if (!storedUsers) {
        try {
          const response = await fetch("/data/users.json?t=" + new Date().getTime());
          if (response.ok) {
            const data = await response.json();
            if (data.users && data.users.length > 0) {
              localStorage.setItem('saturn-users', JSON.stringify(data.users));
              setUsers(data.users.map((user: any) => ({
                ...user,
                joinDate: user.joinDate || new Date().toISOString(),
                role: user.role || 'user'
              })));
            }
          }
        } catch (syncError) {
          console.warn("No se pudo sincronizar con el archivo JSON:", syncError);
        }
      }
      
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios. Mostrando datos locales.",
        variant: "destructive",
      });
      
      // Último intento: cargar datos iniciales
      try {
        const initialUsers = readUsers();
        setUsers(initialUsers);
      } catch (fallbackError) {
        console.error("Error al cargar datos iniciales:", fallbackError);
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
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <h2 className="font-bold">Error al cargar los usuarios</h2>
        <p>{error.message}</p>
        <button 
          onClick={loadUsers}
          className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md"
        >
          Reintentar
        </button>
      </div>
    );
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
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-gray-100 rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-mint-green-dark">
          Gestionar Usuarios
        </h1>
        <p className="text-gray-600">
          Administra los usuarios registrados en la plataforma
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4">
        <AdminDataTable
          columns={columns}
          data={users}
          onDelete={handleDelete}
          createLink="/admin/usuarios/crear"
          editPathPrefix="/admin/usuarios/editar"
          searchPlaceholder="Buscar por nombre, email o rol..."
          itemsPerPage={10}
        />
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No se encontraron usuarios.</p>
          <Link 
            href="/admin/usuarios/crear"
            className="mt-4 inline-flex items-center px-4 py-2 bg-mint-green text-white rounded-md hover:bg-accent-green transition-colors"
          >
            <LuPlus className="mr-2" />
            Crear primer usuario
          </Link>
        </div>
      )}
    </div>
  );
}
