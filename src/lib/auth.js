import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { strapiAuth, strapiUsers } from '@/lib/strapi'

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Permite confiar en el host actual (útil en previews/proxies)
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials")
          return null
        }

        try {
          console.log("🔄 Attempting login with Strapi...")
          console.log("📧 Email:", credentials.email)
          
          // Primero intentar login normal con Strapi
          const response = await strapiAuth.login({
            identifier: credentials.email,
            password: credentials.password,
          })

          console.log("📊 Response status:", response.status)
          console.log("📊 Response ok:", response.ok)
          
          const data = await response.json()
          console.log("📦 Response data:", data)

          if (response.ok && data.user) {
            console.log("✅ Authentication successful")
            
            // Verificar si el usuario está confirmado/verificado
            if (!data.user.confirmed) {
              console.log("⚠️ User email not verified")
              // Retornamos un objeto especial para indicar que el usuario no está verificado
              return {
                id: data.user.id.toString(),
                email: data.user.email,
                name: data.user.username,
                strapiToken: data.jwt,
                emailVerified: false, // Indicador de que el email no está verificado
              }
            }
            
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.username,
              strapiToken: data.jwt,
              emailVerified: true, // Email verificado
            }
          }

          // Si el login falló, verificar si es porque el usuario no está confirmado
          if (response.status === 400) {
            // Verificar si es el mensaje específico de cuenta no confirmada
            if (data.error?.message === "Your account email is not confirmed") {
              console.log("⚠️ User account email is not confirmed")
              console.log("🚫 Preventing authentication for unconfirmed user")
              
              // NO autenticar al usuario, solo retornar null
              // Esto evitará que se cree una sesión
              return null
            }
            // También verificar el mensaje anterior por si acaso
            else if (data.error?.message === "Invalid identifier or password") {
              console.log("🔍 Checking if user exists but is unconfirmed...")
              
              // Buscar el usuario por email para verificar si existe y no está confirmado
              const userCheckResponse = await strapiUsers.findByEmail(credentials.email)

              if (userCheckResponse.ok) {
                const userData = await userCheckResponse.json()
                
                if (userData.length > 0) {
                  const user = userData[0]
                  console.log("👤 User found:", user.email, user.confirmed)
                  
                  if (!user.confirmed) {
                    console.log("⚠️ User exists but email not verified")
                    console.log("🚫 Preventing authentication for unconfirmed user")
                    // NO autenticar al usuario, solo retornar null
                    return null
                  }
                }
              }
            }
          }

          console.log("❌ Authentication failed - Invalid credentials or user not found")
          return null
        } catch (error) {
          console.error("❌ Authentication error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.strapiToken = user.strapiToken
        token.strapiUserId = user.id
        token.emailVerified = user.emailVerified
      }
      return token
    },
    async session({ session, token }) {
      session.strapiToken = token.strapiToken
      session.user.strapiUserId = token.strapiUserId
      session.user.emailVerified = token.emailVerified
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/register",
  },
  session: {
    strategy: "jwt",
  },
})

// Helper function to register new users with Strapi
export async function registerUser(userData) {
  try {
    console.log("🔄 Attempting registration with Strapi...")
    console.log("📧 Email:", userData.email)
    console.log("👤 Username:", userData.username)

    const response = await strapiAuth.register({
      username: userData.username,
      email: userData.email,
      password: userData.password,
    })

    console.log("📊 Registration response status:", response.status)
    console.log("📊 Registration response ok:", response.ok)

    const data = await response.json()
    console.log("📦 Registration response data:", data)

    if (response.ok) {
      console.log("✅ Registration successful")
      return { success: true, user: data.user, jwt: data.jwt }
    } else {
      console.error("❌ Registration failed:", data)
      
      // Handle specific Strapi error formats
      let errorMessage = "Error en el registro. Por favor, intenta de nuevo."
      
      if (data.error) {
        if (typeof data.error === 'string') {
          errorMessage = data.error
        } else if (data.error.message) {
          errorMessage = data.error.message
        } else if (data.error.details) {
          // Handle validation errors
          const details = data.error.details
          if (details.errors && details.errors.length > 0) {
            const firstError = details.errors[0]
            if (firstError.path && firstError.path.includes('email')) {
              errorMessage = "Este email ya está registrado"
            } else if (firstError.path && firstError.path.includes('username')) {
              errorMessage = "Este nombre de usuario ya está en uso"
            } else {
              errorMessage = firstError.message || errorMessage
            }
          }
        }
      }
      
      return { success: false, error: { message: errorMessage } }
    }
  } catch (error) {
    console.error("❌ Registration network error:", error)
    return { success: false, error: { message: "Error de conexión. Por favor, verifica tu conexión a internet." } }
  }
}