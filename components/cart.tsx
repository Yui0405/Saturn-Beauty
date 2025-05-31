"use client"
import Image from "next/image"
import Link from "next/link"
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { cn } from "@/lib/utils"

export default function Cart() {
  const { items, isCartOpen, toggleCart, closeCart, removeItem, updateQuantity, clearCart, totalItems, totalPrice } =
    useCart()

  return (
    <>
      {/* Overlay para cerrar el carrito al hacer clic fuera */}
      {isCartOpen && <div className="fixed inset-0 bg-black/20 z-40" onClick={closeCart} aria-hidden="true" />}

      {/* Mini carrito */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-screen w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out",
          isCartOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Cabecera */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">
            <h2 className="text-lg font-medium flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Tu Carrito
              {totalItems > 0 && <span className="ml-2 text-sm text-gray-500">({totalItems})</span>}
            </h2>
            <Button variant="ghost" size="icon" onClick={closeCart} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center space-y-2">
                <ShoppingCart className="h-12 w-12 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">Tu carrito está vacío</p>
                <p className="text-sm text-gray-500">Añade algunos productos para empezar</p>
                <Button onClick={closeCart} className="mt-4 bg-mint-green hover:bg-accent-green hover:text-mint-green">
                  Seguir comprando
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="flex py-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="line-clamp-1">{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} / unidad</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Reducir cantidad</span>
                          </Button>
                          <span className="text-gray-500 w-6 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Aumentar cantidad</span>
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                <p>Subtotal</p>
                <p>${totalPrice.toFixed(2)}</p>
              </div>
              <div className="flex flex-col space-y-2">
                <Link href="/checkout" onClick={closeCart}>
                  <Button className="w-full bg-mint-green hover:bg-accent-green hover:text-mint-green">
                    Proceder al pago
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-500 hover:bg-red-50"
                  onClick={clearCart}
                >
                  Vaciar carrito
                </Button>
              </div>
              <div className="mt-4 flex justify-center text-center text-sm text-gray-500">
                <p>
                  o{" "}
                  <button
                    type="button"
                    className="font-medium text-mint-green hover:text-mint-green-dark"
                    onClick={closeCart}
                  >
                    Seguir comprando
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
