"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    
    try {
      const result = await register({
        name: registerData.name,
        email: registerData.email,
        username: registerData.username, // Use the username from the form
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
      });

      if (result.success) {
        toast({
          title: "¡Registro exitoso!",
          description: result.message,
        });
        
        // Redirect based on user role (default is 'user' for new registrations)
        router.push("/");
      } else {
        toast({
          title: "Error en el registro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al registrar el usuario. Por favor, inténtalo de nuevo.",
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
                <Label htmlFor="register-name">Nombre completo</Label>
                <Input
                  id="register-name"
                  name="name"
                  type="text"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Correo electrónico</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-username">Nombre de usuario</Label>
                <Input
                  id="register-username"
                  name="username"
                  type="text"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <PasswordInput
                  id="register-password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirmar Contraseña</Label>
                <PasswordInput
                  id="register-confirm-password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-10 bg-mint-green hover:bg-accent-green hover:text-mint-green-dark text-mint-green-dark font-poppins"
                disabled={isLoading}
              >
                {isLoading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>
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
