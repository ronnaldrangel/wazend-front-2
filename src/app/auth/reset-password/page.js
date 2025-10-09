"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import AuthLayout from "../../../components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// Removed Card UI wrapper for the form
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </AuthLayout>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [code, setCode] = useState("")
  
  const searchParams = useSearchParams()

  useEffect(() => {
    const codeParam = searchParams.get("code")
    if (codeParam) {
      setCode(codeParam)
    } else {
      setError("Código de verificación no encontrado. Por favor, solicita un nuevo enlace de recuperación.")
    }
  }, [searchParams])

  const validateForm = () => {
    if (!password) {
      setError("La contraseña es requerida")
      return false
    }
    
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Contraseña actualizada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.")
        setMessage("")
        setPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || "Error al restablecer la contraseña")
        setError("")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold">Restablecer contraseña</h1>
          <p className="text-sm text-muted-foreground">Ingresa tu nueva contraseña</p>
        </div>

        <div className="space-y-6 mt-6">
          {/* Mensajes de éxito/error ahora se muestran con Sonner */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu nueva contraseña"
              />
            </div>

            <Button type="submit" disabled={isLoading || !code} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>

            <div className="text-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}