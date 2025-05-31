"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { CreditCard, Truck, CheckCircle2 } from "lucide-react"
import Image from "next/image"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [orderNumber, setOrderNumber] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "España",
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.postalCode) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios",
        variant: "destructive",
      })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardName || !formData.cardExpiry || !formData.cardCvc) {
        toast({
          title: "Error",
          description: "Por favor, completa todos los datos de la tarjeta",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handlePreviousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep2()) return

    setLoading(true)

    // Simular proceso de pago
    setTimeout(() => {
      const newOrderNumber = `ORD-${Math.floor(Math.random() * 10000)}`
      setOrderNumber(newOrderNumber)
      setLoading(false)
      setStep(4) // Paso de confirmación

      toast({
        title: "¡Compra realizada con éxito!",
        description: "Gracias por tu compra. Recibirás un correo con los detalles.",
      })

      // Limpiar carrito después de la compra exitosa
      clearCart()
    }, 2000)
  }

  const handleBackToShopping = () => {
    router.push("/")
  }

  // Si no hay items en el carrito, redirigir a la página principal
  if (items.length === 0 && step !== 4) {
    return (
      <div className="min-h-screen py-12 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 font-playfair">Tu carrito está vacío</h1>
          <p className="mb-6 font-poppins">No hay productos en tu carrito para proceder al pago.</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
          >
            Volver a la tienda
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center font-playfair">Checkout</h1>

        {step < 4 && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className={`flex flex-col items-center ${step >= 1 ? "text-mint-green" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? "bg-mint-green text-white" : "bg-gray-200"}`}
                >
                  1
                </div>
                <span className="text-sm font-poppins">Envío</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-mint-green" : "bg-gray-200"}`}></div>
              <div className={`flex flex-col items-center ${step >= 2 ? "text-mint-green" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? "bg-mint-green text-white" : "bg-gray-200"}`}
                >
                  2
                </div>
                <span className="text-sm font-poppins">Pago</span>
              </div>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? "bg-mint-green" : "bg-gray-200"}`}></div>
              <div className={`flex flex-col items-center ${step >= 3 ? "text-mint-green" : "text-gray-400"}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? "bg-mint-green text-white" : "bg-gray-200"}`}
                >
                  3
                </div>
                <span className="text-sm font-poppins">Revisión</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario de checkout */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 font-playfair">Información de envío</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-poppins">
                        Nombre completo *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre completo"
                        required
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-poppins">
                        Correo electrónico *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        required
                        className="font-poppins"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="font-poppins">
                      Dirección *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Calle y número"
                      required
                      className="font-poppins"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-poppins">
                        Ciudad *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Tu ciudad"
                        required
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode" className="font-poppins">
                        Código postal *
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="28001"
                        required
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="font-poppins">
                        País *
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Tu país"
                        required
                        className="font-poppins"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
                  >
                    Continuar al pago
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 font-playfair">Método de pago</h2>
                <RadioGroup value={formData.paymentMethod} onValueChange={handlePaymentMethodChange} className="mb-6">
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center cursor-pointer font-poppins">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Tarjeta de crédito/débito
                    </Label>
                  </div>
                </RadioGroup>

                {formData.paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="font-poppins">
                        Número de tarjeta *
                      </Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleChange}
                        placeholder="1234 5678 9012 3456"
                        required
                        className="font-poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName" className="font-poppins">
                        Nombre en la tarjeta *
                      </Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleChange}
                        placeholder="Nombre como aparece en la tarjeta"
                        required
                        className="font-poppins"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardExpiry" className="font-poppins">
                          Fecha de expiración *
                        </Label>
                        <Input
                          id="cardExpiry"
                          name="cardExpiry"
                          value={formData.cardExpiry}
                          onChange={handleChange}
                          placeholder="MM/AA"
                          required
                          className="font-poppins"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cardCvc" className="font-poppins">
                          CVC/CVV *
                        </Label>
                        <Input
                          id="cardCvc"
                          name="cardCvc"
                          value={formData.cardCvc}
                          onChange={handleChange}
                          placeholder="123"
                          required
                          className="font-poppins"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} className="font-poppins">
                    Volver
                  </Button>
                  <Button
                    onClick={handleNextStep}
                    className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
                  >
                    Continuar a revisión
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 font-playfair">Revisar pedido</h2>

                <div className="mb-6">
                  <h3 className="font-medium mb-2 font-playfair">Información de envío</h3>
                  <div className="bg-gray-50 p-4 rounded-md font-poppins">
                    <p>{formData.name}</p>
                    <p>{formData.email}</p>
                    <p>{formData.address}</p>
                    <p>
                      {formData.city}, {formData.postalCode}
                    </p>
                    <p>{formData.country}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2 font-playfair">Método de pago</h3>
                  <div className="bg-gray-50 p-4 rounded-md flex items-center font-poppins">
                    <CreditCard className="mr-2 h-5 w-5" />
                    <span>Tarjeta terminada en {formData.cardNumber.slice(-4)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium mb-2 font-playfair">Productos</h3>
                  <ul className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <li key={item.id} className="py-4 flex">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col font-poppins">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h4>{item.name}</h4>
                              <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Cantidad: {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={handlePreviousStep} className="font-poppins">
                    Volver
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
                    disabled={loading}
                  >
                    {loading ? "Procesando..." : "Confirmar pedido"}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md mx-4">
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2 font-playfair">¡Pedido completado!</h2>
                    <p className="text-gray-600 mb-6 font-poppins">
                      Gracias por tu compra. Hemos enviado un correo electrónico con los detalles de tu pedido.
                    </p>
                    <p className="text-sm text-gray-500 mb-6 font-poppins">
                      Número de pedido: <span className="font-medium">{orderNumber}</span>
                    </p>
                    <div className="flex items-center justify-center text-sm text-gray-500 mb-4 font-poppins">
                      <Truck className="h-5 w-5 mr-2" />
                      <span>Tiempo estimado de entrega: 3-5 días hábiles</span>
                    </div>
                    <Button
                      onClick={handleBackToShopping}
                      className="bg-mint-green hover:bg-accent-green hover:text-mint-green font-poppins"
                    >
                      Volver a la tienda
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen del pedido */}
          {step < 4 && (
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4 font-playfair">Resumen del pedido</h2>
                <div className="space-y-4 font-poppins">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos</span>
                    <span>${(totalPrice * 0.21).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${(totalPrice * 1.21).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="font-medium mb-2 font-playfair">Productos ({items.length})</h3>
                  <ul className="space-y-2 font-poppins">
                    {items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="line-clamp-1">
                          {item.name} <span className="text-gray-500">x{item.quantity}</span>
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
