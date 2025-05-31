"use client";

import { useState, useEffect } from "react";
import { AdminDataTable } from "@/components/ui/admin-data-table";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Función para generar un código de pedido único
function generateOrderCode(): string {
  const prefix = "SB"; // Saturn Beauty
  const timestamp = Date.now().toString(36).toUpperCase(); // Timestamp en base 36
  const random = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 caracteres aleatorios
  return `${prefix}-${timestamp}${random}`;
}

interface OrderProduct {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  code: string;
  userId: string;
  userName: string;
  products: OrderProduct[];
  total: number;
  status: "en proceso" | "entregado";
  date: string;
}

const statusColors = {
  "en proceso": "text-blue-600 bg-blue-100",
  entregado: "text-green-600 bg-green-100",
} as const;

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/data/orders.json");
      if (!response.ok) throw new Error("Error cargando pedidos");

      const data = await response.json();
      setOrders(data.orders);
      setError(null);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error as Error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const saveOrdersToFile = async (updatedOrders: Order[]) => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orders: updatedOrders }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar los cambios");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleStatusChange = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    const previousOrders = [...orders];
    try {
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );

      // Optimistic update
      setOrders(updatedOrders);

      // Persist changes
      await saveOrdersToFile(updatedOrders);

      toast({
        title: "Éxito",
        description: "Estado del pedido actualizado correctamente",
      });
    } catch (error) {
      // Revert on error
      setOrders(previousOrders);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del pedido",
        variant: "destructive",
      });
    }
  };

  // Función vacía para cumplir con la interfaz de AdminDataTable
  const handleDelete = (id: string) => {};
  const columns = [
    {
      header: "Código",
      accessorKey: "code",
      cell: ({ row }: { row: Order }) => (
        <span className="font-mono text-sm font-medium">{row.code}</span>
      ),
    },
    {
      header: "Cliente",
      accessorKey: "userName",
    },
    {
      header: "Productos",
      accessorKey: "products",
      cell: ({ row }: { row: Order }) => (
        <div className="max-w-[300px]">
          {row.products.map((product, index) => (
            <div key={`${product.id}-${index}`} className="text-sm">
              {product.name} (x{product.quantity})
            </div>
          ))}
        </div>
      ),
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: ({ row }: { row: Order }) => (
        <span className="font-medium">${row.total.toFixed(2)}</span>
      ),
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: ({ row }: { row: Order }) => (
        <Select
          defaultValue={row.status}
          onValueChange={(value: Order["status"]) =>
            handleStatusChange(row.id, value)
          }
        >
          <SelectTrigger className={`w-[140px] ${statusColors[row.status]}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en proceso">En Proceso</SelectItem>
            <SelectItem value="entregado">Entregado</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      header: "Fecha",
      accessorKey: "date",
      cell: ({ row }: { row: Order }) => (
        <span>{new Date(row.date).toLocaleDateString()}</span>
      ),
    },
  ];
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-mint-green-dark mb-2">
            Historial de Pedidos
          </h1>
          <p className="text-gray-600">Cargando pedidos...</p>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-mint-green-dark mb-2">
          Historial de Pedidos
        </h1>
        <p className="text-gray-600">
          Consulta y gestiona el estado de los pedidos
        </p>
      </div>

      <AdminDataTable
        columns={columns}
        data={orders}
        onDelete={handleDelete}
        searchPlaceholder="Buscar por código, cliente o productos..."
        showCreateButton={false}
        showDeleteButton={false}
        showActionsColumn={false}
      />
    </div>
  );
}
