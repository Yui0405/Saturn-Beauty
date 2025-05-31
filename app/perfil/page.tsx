// Modificar para permitir la selección de tabs desde la URL
"use client"

import { useSearchParams } from "next/navigation"
import UserProfile from "@/components/user-profile"

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "account"

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-mint-green-dark font-playfair">Mi Perfil</h1>
        <UserProfile initialTab={tab} />
      </div>
    </div>
  )
}
