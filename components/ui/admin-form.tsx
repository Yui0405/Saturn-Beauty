"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { LuArrowLeft, LuSave } from "react-icons/lu";

interface AdminFormProps {
  title: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  backUrl: string;
}

export function AdminForm({
  title,
  children,
  onSubmit,
  isLoading = false,
  backUrl,
}: AdminFormProps) {
  const router = useRouter();

  return (
    <Card className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(backUrl)}
          className="mb-4"
        >
          <LuArrowLeft className="mr-2" />
          Volver
        </Button>{" "}
        <h1 className="text-2xl font-semibold text-mint-green-dark font-playfair">
          {title}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 font-poppins">
        {children}

        <div className="flex justify-end space-x-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backUrl)}
            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
          >
            Cancelar
          </Button>{" "}
          <Button
            type="submit"
            className="bg-mint-green text-white hover:bg-accent-green hover:text-mint-green transition-colors"
            disabled={isLoading}
          >
            <LuSave className="mr-2" />
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
