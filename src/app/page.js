"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push("/auth/login")
  }, [router])

  return (
    <main className="min-h-screen grid place-items-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </div>
    </main>
  )
}
