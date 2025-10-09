import AuthLayout from "../../../components/AuthLayout"
import LoginPageClient from "./LoginPageClient"

export const metadata = {
  title: "Iniciar sesión",
}

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginPageClient />
    </AuthLayout>
  )
}