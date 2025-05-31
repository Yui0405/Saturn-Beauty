"use client";

import { LuUsers, LuBox, LuShoppingCart, LuDollarSign } from "react-icons/lu";
import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div>
      {" "}
      <h1 className="text-3xl font-bold mb-8 text-mint-green-dark font-playfair">
        Panel de Control
      </h1>
      <p className="text-gray-600 mb-8 font-poppins">
        Resumen general de Saturn Beauty
      </p>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              {" "}
              <p className="text-sm text-gray-600 mb-1 font-poppins">
                Total Usuarios
              </p>
              <h3 className="text-2xl font-bold font-playfair">2</h3>
            </div>
            <div className="bg-lavender-light p-2 rounded-lg">
              <LuUsers className="text-lavender text-xl" />
            </div>
          </div>
        </Card>

        {/* Total Products */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Productos</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
            <div className="bg-mint-green-light p-2 rounded-lg">
              <LuBox className="text-mint-green text-xl" />
            </div>
          </div>
        </Card>

        {/* Total Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Pedidos</p>
              <h3 className="text-2xl font-bold">2</h3>
            </div>
            <div className="bg-accent-yellow bg-opacity-20 p-2 rounded-lg">
              <LuShoppingCart className="text-yellow-600 text-xl" />
            </div>
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
              <h3 className="text-2xl font-bold">$99.97</h3>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <LuDollarSign className="text-green-600 text-xl" />
            </div>
          </div>
        </Card>
      </div>
      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Orders */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Pedidos Pendientes</h3>
            <div className="bg-orange-100 p-1 rounded">
              <span className="text-orange-600">!</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-orange-600">1</span>
            <p className="text-gray-600 mt-1">Requieren atención</p>
          </div>
        </Card>

        {/* Low Stock */}
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Stock Bajo</h3>
            <div className="bg-red-100 p-1 rounded">
              <span className="text-red-600">!</span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-red-600">1</span>
            <p className="text-gray-600 mt-1">Productos con ≤5 unidades</p>
          </div>
        </Card>
      </div>
      {/* Recent Orders and Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pedidos Recientes</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">ORD-2023-001</p>
                <p className="text-sm text-gray-600">Juan Pérez</p>
              </div>
              <div className="text-right">
                <p className="font-medium">$59.98</p>
                <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  Procesando
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Low Stock Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Productos con Stock Bajo
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                <div>
                  <p className="font-medium">Sérum Facial Antiarrugas</p>
                  <p className="text-sm text-gray-600">Sérums</p>
                </div>
              </div>
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                0 unidades
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
