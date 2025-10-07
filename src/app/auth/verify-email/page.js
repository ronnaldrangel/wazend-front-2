"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AuthLayout from "../../../components/AuthLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function VerifyEmail() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [])

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Por favor, proporciona un email válido.")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Email de verificación reenviado exitosamente. Revisa tu bandeja de entrada.")
        setMessage("")
      } else {
        toast.error(data.error || "Error al reenviar el email de verificación.")
        setMessage("")
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-extrabold text-center">
            Verifica tu email
          </CardTitle>
          <CardDescription className="text-center">
            Hemos enviado un enlace de verificación a tu email
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {email && (
            <p className="text-center text-sm font-medium text-primary">{email}</p>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@ejemplo.com" />
            </div>

            <Button onClick={handleResendEmail} disabled={isLoading || !email} className="w-full" type="button">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                "Reenviar email de verificación"
              )}
            </Button>

            {/* Mensajes de éxito/error ahora se muestran con Sonner */}

            <div className="text-center space-y-2">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Volver al login
              </Link>
              <br />
              <Link href="/" className="text-sm text-muted-foreground hover:underline">
                Ir al inicio
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}