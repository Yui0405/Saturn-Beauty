"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { CreditCard, Truck, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { getCurrentUser, isAuthenticated } from "@/lib/auth"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [orderNumber, setOrderNumber] = useState("")
  const [orderTotal, setOrderTotal] = useState(0)
  const [addressError, setAddressError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    paymentMethod: "card",
    cardNumber: "",
    cardName: "",
    cardExpiry: ""
  })
  
  const [validationErrors, setValidationErrors] = useState({
    cardNumber: "",
    cardName: "",
    cardExpiry: ""
  })

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Verificar si el usuario está autenticado
      if (!isAuthenticated()) {
        router.push('/login?redirect=/checkout')
        return
      }

      // Obtener datos del usuario actual
      const currentUser = getCurrentUser()
      if (currentUser) {
        // Obtener datos completos del usuario desde localStorage
        const storedUsers = localStorage.getItem('saturn-users')
        if (storedUsers) {
          const users = JSON.parse(storedUsers)
          const fullUser = users.find((u: any) => u.id === currentUser.id)
          
          if (fullUser) {
            // Actualizar el formulario con los datos del usuario
            setFormData(prev => ({
              ...prev,
              name: fullUser.name || '',
              email: fullUser.email || '',
              address: fullUser.direccion || ''
            }))


            // Validar si el usuario tiene dirección
            if (!fullUser.direccion) {
              setAddressError('Por favor, actualiza tu dirección en tu perfil antes de continuar con la compra.')
            }
          }
        }
      }
      
      setLoading(false)
    }
  }, [router])

  // Redirigir al perfil si no hay dirección
  const handleUpdateAddress = () => {
    router.push('/perfil')
  }

  const validateCardNumber = (number: string) => {
    // Eliminar espacios y guiones
    const cleanNumber = number.replace(/\s+/g, '').replace(/-/g, '')
    // Validar que solo contenga números
    if (!/^\d+$/.test(cleanNumber)) return "El número de tarjeta solo puede contener dígitos"
    // Validar longitud (generalmente entre 13 y 19 dígitos)
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return "Número de tarjeta inválido"
    return ""
  }

  const validateCardName = (name: string) => {
    if (!name.trim()) return "Este campo es obligatorio"
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) return "El nombre solo puede contener letras y espacios"
    return ""
  }

  const validateExpiryDate = (date: string) => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return "Formato inválido (MM/AA)"
    
    const [month, year] = date.split('/').map(Number)
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    if (month < 1 || month > 12) return "Mes inválido"
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "La tarjeta ha expirado"
    }
    
    return ""
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Formateo en tiempo real
    let formattedValue = value
    
    if (name === 'cardNumber') {
      // Formatear como XXXX XXXX XXXX XXXX
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim()
        .slice(0, 19)
      
      // Validar el número de tarjeta
      const error = validateCardNumber(value)
      setValidationErrors(prev => ({ ...prev, cardNumber: error }))
    } 
    else if (name === 'cardName') {
      // Validar el nombre en tiempo real
      const error = validateCardName(value)
      setValidationErrors(prev => ({ ...prev, cardName: error }))
    }
    else if (name === 'cardExpiry') {
      // Formatear como MM/AA
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d{0,4})/, '$1/$2')
        .slice(0, 5)
      
      // Validar la fecha de expiración
      const error = validateExpiryDate(formattedValue)
      setValidationErrors(prev => ({ ...prev, cardExpiry: error }))
    }
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const validateStep2 = () => {
    const errors = {
      cardNumber: formData.paymentMethod === 'card' ? validateCardNumber(formData.cardNumber) : "",
      cardName: formData.paymentMethod === 'card' ? validateCardName(formData.cardName) : "",
      cardExpiry: formData.paymentMethod === 'card' ? validateExpiryDate(formData.cardExpiry) : ""
    }
    
    setValidationErrors(errors)
    
    // Verificar si hay algún error
    return !Object.values(errors).some(error => error !== "")
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.address) {
        toast({
          title: "Error",
          description: "Por favor, completa todos los campos obligatorios",
          variant: "destructive",
        })
        return
      }
      
      // Validar que la dirección no esté vacía
      if (!formData.address.trim()) {
        toast({
          title: "Error",
          description: "Por favor, ingresa una dirección de envío válida",
          variant: "destructive",
        })
        return
      }
      
      // Actualizar la dirección del usuario en localStorage
      const currentUser = getCurrentUser()
      if (currentUser) {
        const storedUsers = localStorage.getItem('saturn-users')
        if (storedUsers) {
          const users = JSON.parse(storedUsers)
          const userIndex = users.findIndex((u: any) => u.id === currentUser.id)
          
          if (userIndex !== -1) {
            users[userIndex].direccion = formData.address
            localStorage.setItem('saturn-users', JSON.stringify(users))
            setAddressError('') // Limpiar el mensaje de error si existía
          }
        }
      }
      
      setStep(2)
    } else if (step === 2) {
      if (formData.paymentMethod === 'card' && !validateStep2()) {
        return
      }
      setStep(3)
    }
  }

  const handlePreviousStep = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const generateOrderId = () => {
    return Date.now().toString()
  }

  const generateOrderCode = () => {
    const prefix = 'SB'
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    return `${prefix}-${randomNum}`
  }

  const saveOrderToJson = async (orderData: any) => {
    try {
      // Leer el archivo orders.json actual
      const response = await fetch('/data/orders.json')
      const data = await response.json()
      
      // Agregar el nuevo pedido
      data.orders.push(orderData)
      
      // Guardar de vuelta al archivo (esto solo funciona en un entorno con acceso al sistema de archivos)
      // En producción, necesitarías una API para manejar esto
      console.log('Nuevo pedido creado:', orderData)
      
      // También guardar en localStorage para consistencia
      localStorage.setItem('saturn-orders', JSON.stringify(data.orders))
      
    } catch (error) {
      console.error('Error al guardar el pedido:', error)
      // En caso de error, solo guardar en localStorage
      const orders = JSON.parse(localStorage.getItem('saturn-orders') || '[]')
      orders.push(orderData)
      localStorage.setItem('saturn-orders', JSON.stringify(orders))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.paymentMethod) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un método de pago",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Obtener datos del usuario actual
      const currentUser = getCurrentUser()
      if (!currentUser) {
        throw new Error('No se pudo obtener la información del usuario')
      }

      // Crear el objeto de pedido
      const orderId = generateOrderId()
      const orderCode = generateOrderCode()
      
      const orderData = {
        id: orderId,
        code: orderCode,
        userId: currentUser.id,
        userName: currentUser.name || formData.name,
        date: new Date().toISOString(),
        status: 'en proceso', // Estado por defecto
        total: totalPrice,
        products: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: formData.address,
        paymentMethod: formData.paymentMethod,
        paymentDetails: {
          cardLastFour: formData.cardNumber.slice(-4),
          cardBrand: '' // Podrías detectar la marca de la tarjeta si lo deseas
        }
      }

      // Guardar el pedido
      await saveOrderToJson(orderData)
      
      // Guardar el total antes de limpiar el carrito
      setOrderTotal(totalPrice)
      
      // Actualizar el estado
      setOrderNumber(orderCode)
      
      // Limpiar carrito después de la compra exitosa
      clearCart()
      
      // Navegar al paso de confirmación
      setStep(4)
      
      toast({
        title: "¡Compra realizada con éxito!",
        description: `Tu pedido #${orderCode} ha sido registrado.`,
      })
      
    } catch (error) {
      console.error('Error al procesar el pedido:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar tu pedido. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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

  // Mostrar cargando mientras se verifican los datos del usuario
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mint-green mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus datos...</p>
        </div>
      </div>
    )
  }

  // Si hay error de dirección, mostrar mensaje y botón para actualizar
  if (addressError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 mr-2" />
            <p className="font-medium">Dirección de envío requerida</p>
          </div>
          <p className="mt-2">{addressError}</p>
          <div className="mt-4">
            <Button 
              onClick={handleUpdateAddress}
              className="bg-mint-green hover:bg-accent-green hover:text-mint-green"
            >
              Actualizar dirección en mi perfil
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 font-playfair">Checkout</h1>

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
  
                        required
                        className="font-poppins"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="font-poppins">
                      Dirección de envío *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={(e) => {
                        handleChange(e)
                        // Limpiar el error si el usuario empieza a escribir
                        if (addressError) setAddressError('')
                      }}
                      required
                      className={`font-poppins ${addressError ? 'border-red-500' : ''}`}
                    />
                    {addressError && (
                      <div className="flex items-center text-red-500 text-sm mt-1">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        <span>{addressError}</span>
                      </div>
                    )}
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
                        required
                        className={`font-poppins ${validationErrors.cardNumber ? 'border-red-500' : ''}`}
                        maxLength={19}
                      />
                      {validationErrors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          <AlertCircle className="inline h-3 w-3 mr-1" />
                          {validationErrors.cardNumber}
                        </p>
                      )}
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
                        required
                        className={`font-poppins ${validationErrors.cardName ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.cardName && (
                        <p className="text-red-500 text-xs mt-1">
                          <AlertCircle className="inline h-3 w-3 mr-1" />
                          {validationErrors.cardName}
                        </p>
                      )}
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
                          required
                          className={`font-poppins ${validationErrors.cardExpiry ? 'border-red-500' : ''}`}
                          maxLength={5}
                        />
                        {validationErrors.cardExpiry && (
                          <p className="text-red-500 text-xs mt-1">
                            <AlertCircle className="inline h-3 w-3 mr-1" />
                            {validationErrors.cardExpiry}
                          </p>
                        )}
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
                  <div className="bg-gray-50 p-4 rounded-md font-poppins space-y-1">
                    <p className="font-medium">{formData.name}</p>
                    <p className="text-gray-600">{formData.email}</p>
                    <p className="text-gray-600">{formData.address}</p>
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
                      Gracias por tu compra. Tu pedido ha sido registrado exitosamente.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-md mb-6 text-left font-poppins w-full">
                      <p className="font-medium mb-2 text-base">Resumen del pedido</p>
                      <div className="space-y-1">
                        <p className="text-sm flex justify-between">
                          <span className="font-medium">Número de pedido:</span>
                          <span>{orderNumber}</span>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span className="font-medium">Fecha:</span>
                          <span>{new Date().toLocaleDateString()}</span>
                        </p>
                        <div className="pt-2 mt-2 border-t border-gray-200">
                          <p className="text-base font-semibold flex justify-between">
                            <span>Total:</span>
                            <span className="text-mint-green">${orderTotal.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
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
