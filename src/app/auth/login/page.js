"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import AuthLayout from "../../../components/AuthLayout"
import { LoginForm } from "@/components/login-form"
import { toast } from "sonner"

export default function LoginPage() {
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateFormValues = (email, password) => {
    const newErrors = {}
    if (!email) {
      newErrors.email = "El email es requerido"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "El email no es válido"
    }
    if (!password) {
      newErrors.password = "La contraseña es requerida"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const email = form.get('email')?.toString() || ''
    const password = form.get('password')?.toString() || ''

    if (!validateFormValues(email, password)) return

    setIsLoading(true)
    setErrors({})

    try {
      // Primero verificar si el usuario existe
      const userCheckResponse = await fetch("/api/check-user-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const userCheckData = await userCheckResponse.json()

      if (!userCheckData.exists) {
        toast.error("No existe una cuenta con este email")
        setIsLoading(false)
        return
      }

      // Si el usuario existe pero no está verificado
      if (!userCheckData.confirmed) {
        // Redirigir a la página de verificación de email
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`
        return
      }

      // Proceder con el login usando NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Contraseña incorrecta")
        } else {
          toast.error("Error al iniciar sesión. Inténtalo de nuevo.")
        }
      } else if (result?.ok) {
        // Login exitoso, redirigir al dashboard
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error de conexión. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Error with Google sign in:", error)
      toast.error("Error al iniciar sesión con Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = () => {}

  return (
    <AuthLayout>
      <div className="w-full">
        <LoginForm onSubmit={handleSubmit} onGoogleClick={handleGoogleSignIn} submitting={isLoading} />
        {(errors.email || errors.password) && (
          <div className="text-destructive text-center mt-2 text-sm">
            {errors.email || errors.password}
          </div>
        )}
      </div>
    </AuthLayout>
  )
}