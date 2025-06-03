"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.emailOrUsername || !loginData.password) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const user = await login(loginData.emailOrUsername, loginData.password);

      if (user) {
        if (user.role === "admin") {
          toast({
            title: `¡Bienvenido/a ${user.name}!`,
            description: "Accediendo al panel de administración.",
          });
          router.push("/admin");
        } else {
          toast({
            title: `¡Bienvenido/a ${user.name}!`,
            description: "Disfruta de tu experiencia en Saturn Beauty.",
          });
          router.push("/");
        }
      } else {
        toast({
          title: "Error",
          description: "Email/nombre de usuario o contraseña incorrectos.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al intentar iniciar sesión. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (!/^[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+(?:\s+[A-ZÁÉÍÓÚÜÑ][a-záéíóúüñ]+)*$/.test(value)) 
          return 'Cada nombre y apellido debe comenzar con mayúscula y solo contener letras';
        if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.length > 50) return 'El nombre no puede exceder los 50 caracteres';
        return '';
        
      case 'username':
        if (!value.trim()) return 'El nombre de usuario es obligatorio';
        if (!/^[a-z0-9_]+$/.test(value)) 
          return 'El usuario solo puede contener minúsculas, números y guiones bajos';
        if (value.length < 3) return 'El usuario debe tener al menos 3 caracteres';
        if (value.length > 20) return 'El usuario no puede exceder los 20 caracteres';
        return '';
        
      case 'email':
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) 
          return 'Ingrese un correo electrónico válido';
        return '';
        
      case 'password':
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s:])/.test(value))
          return 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial';
        return '';
        
      case 'confirmPassword':
        if (value !== registerData.password) 
          return 'Las contraseñas no coinciden';
        return '';
        
      default:
        return '';
    }
  };

  const [touched, setTouched] = useState({
    name: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, registerData[field as keyof typeof registerData]);
    setErrors({ ...errors, [field]: error });
  };

  const handleFieldChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'name') {
      if (value) {
        formattedValue = value
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    } else if (field === 'username') {
      formattedValue = value.toLowerCase();
    }
    
    setRegisterData(prev => ({ ...prev, [field]: formattedValue }));
    
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, formattedValue);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const allTouched = {
        name: true,
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
      };
      
      setTouched(allTouched);

      const fieldErrors = {} as Record<string, string>;
      let hasErrors = false;

      Object.keys(registerData).forEach(field => {
        if (field === 'confirmPassword') return;
        
        const error = validateField(field, registerData[field as keyof typeof registerData]);
        if (error) {
          fieldErrors[field] = error;
          hasErrors = true;
        }
      });

      if (registerData.password !== registerData.confirmPassword) {
        fieldErrors.confirmPassword = 'Las contraseñas no coinciden';
        hasErrors = true;
      }

      if (hasErrors) {
        setErrors(prev => ({
          ...prev,
          ...fieldErrors
        }));
        
        const firstErrorField = Object.keys(fieldErrors)[0];
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element?.focus();
          
          toast({
            title: "Error de validación",
            description: "Por favor corrige los errores en el formulario.",
            variant: "destructive",
          });
        }
        
        setIsLoading(false);
        return;
      }

      const storedUsers = localStorage.getItem('saturn-users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];

      let jsonUsers = [];
      try {
        const response = await fetch('/data/users.json');
        const data = await response.json();
        jsonUsers = data.users || [];
      } catch (error) {
        console.error('Error al cargar usuarios desde users.json:', error);
      }

      const allUsers = [...users, ...jsonUsers];

      const userExists = allUsers.some((user: any) => user.username === registerData.username);
      const emailExists = allUsers.some((user: any) => user.email === registerData.email);

      if (userExists) {
        toast({
          title: "Error",
          description: "El nombre de usuario ya está en uso",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (emailExists) {
        toast({
          title: "Error",
          description: "El correo electrónico ya está registrado",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        role: "user",
        bio: "Nuevo usuario de Saturn Beauty",
        telefono: "",
        direccion: "",
        avatar: "/images/placeholder.svg",
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const existingUsers = JSON.parse(localStorage.getItem('saturn-users') || '[]');
      
      const updatedUsers = [...existingUsers, newUser];
      
      localStorage.setItem('saturn-users', JSON.stringify(updatedUsers));
      
      window.dispatchEvent(new CustomEvent('usersUpdated', {
        detail: { users: updatedUsers }
      }));

      try {
        console.log('Nuevo usuario registrado:', newUser);
      } catch (error) {
        console.error('Error al guardar en la base de datos:', error);
      }

      setRegisterData({
        name: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
      });

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada correctamente. Por favor inicia sesión.",
      });

      const loginTab = document.querySelector('button[data-value="login"]') as HTMLButtonElement;
      if (loginTab) {
        loginTab.click();
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error en el registro:", error);
      toast({
        title: "Error",
        description: "No se pudo completar el registro. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <Link href="/" className="block">
          <h1 className="text-4xl font-bold text-lavender font-dancing-script mb-2">
            Saturn Beauty
          </h1>
        </Link>
        <CardDescription className="text-gray-600">Accede a tu cuenta o crea una nueva</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-mint-green-light p-1 rounded-md">
            <TabsTrigger 
              value="login"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-mint-green-dark font-medium"
            >
              Iniciar Sesión
            </TabsTrigger>
            <TabsTrigger 
              value="register"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-mint-green-dark font-medium"
            >
              Registrarse
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email o Nombre de Usuario</Label>
                <Input
                  id="login-email"
                  name="emailOrUsername"
                  type="text"
                  value={loginData.emailOrUsername}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Contraseña</Label>
                  <Link
                    href="/recuperar-contrasena"
                    className="text-xs text-lavender-dark hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <PasswordInput
                  id="login-password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  className="w-full font-poppins"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-mint-green hover:bg-accent-green hover:text-mint-green-dark text-mint-green-dark font-poppins"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={registerData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={errors.name && touched.name ? 'border-red-500' : ''}
                  required
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={registerData.username}
                  onChange={(e) => handleFieldChange('username', e.target.value)}
                  onBlur={() => handleBlur('username')}
                  className={errors.username && touched.username ? 'border-red-500' : ''}
                  required
                />
                {errors.username && touched.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={errors.email && touched.email ? 'border-red-500' : ''}
                  required
                />
                {errors.email && touched.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={registerData.password}
                  onChange={(e) => handleFieldChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full font-poppins ${errors.password && touched.password ? 'border-red-500' : ''}`}
                  required
                />
                {errors.password && touched.password ? (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                ) : registerData.password ? (
                  <p className="mt-1 text-xs text-green-600">La contraseña cumple con los requisitos</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full font-poppins ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}`}
                  required
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
                {!errors.confirmPassword && registerData.confirmPassword && registerData.password === registerData.confirmPassword && (
                  <p className="mt-1 text-xs text-green-600">Las contraseñas coinciden</p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-mint-green hover:bg-accent-green hover:text-mint-green-dark"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Registrarse
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-mint-green hover:underline">
                Inicia sesión
              </Link>
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Saturn Beauty. Todos los derechos
          reservados.
        </p>
      </CardFooter>
    </Card>
  );
}
