import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { buildStrapiUrl } from "@/lib/strapi"
import { redirect } from "next/navigation"
import AccountProfileForm from "@/components/account-profile-form"
import AccountPasswordForm from "@/components/account-password-form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { User, Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import crypto from "crypto"

export default async function AccountPage() {
  const session = await auth()

  if (!session) {
    redirect('/auth/login?callbackUrl=/account')
  }

  console.log('🧪 /account: session.strapiToken (full)', session.strapiToken)
  console.log('🧪 /account: session.user.strapiUserId', session.user?.strapiUserId)

  let me = null
  let error = null

  try {
    const res = await fetch(buildStrapiUrl('/api/users/me'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.strapiToken}`,
      },
      cache: 'no-store',
    })

    console.log('📡 /account: status /api/users/me', res.status)
    if (!res.ok) {
      const details = await res.json().catch(() => ({}))
      console.log('📦 /account: error body', details)
      error = details?.error?.message || `No se pudo obtener la información de la cuenta (status ${res.status})`
    } else {
      me = await res.json()
      console.log('📦 /account: me body', me)
    }
  } catch (e) {
    error = 'Error al conectar con Strapi. Verifica tu conexión.'
  }

  const displayName = me?.name || me?.username || 'Usuario'
  const displayEmail = session?.user?.email || me?.email || ''
  const initials = displayName
    ? displayName
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'US'
  const providerLabel = me?.provider || 'local'
  const gravatarEmail = (session?.user?.email || me?.email || '').trim().toLowerCase()
  const gravatarUrl = gravatarEmail
    ? `https://www.gravatar.com/avatar/${crypto
        .createHash('md5')
        .update(gravatarEmail)
        .digest('hex')}?d=retro`
    : undefined

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <h1 className="text-2xl font-semibold">Mi Cuenta</h1>
                <p className="text-sm text-muted-foreground mt-2">Gestión de perfil y preferencias.</p>
              </div>
            </div>
            <div className="px-4 lg:px-6">
              <Tabs
                orientation="vertical"
                defaultValue="perfil"
                className="w-full flex flex-row items-start gap-4">
                <TabsList className="shrink-0 grid grid-cols-1 gap-1 p-0 bg-background">
                  <TabsTrigger
                    value="perfil"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground justify-start px-3 py-1.5">
                    <User className="h-5 w-5 me-2" /> Perfil
                  </TabsTrigger>
                  <TabsTrigger
                    value="seguridad"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground justify-start px-3 py-1.5">
                    <Shield className="h-5 w-5 me-2" /> Seguridad
                  </TabsTrigger>
                </TabsList>
                <div className="max-w-full w-full border rounded-md">
                  <TabsContent value="perfil" className="p-4">
                    <div className="mb-6 md:mb-8">
                      <div className="flex items-start gap-3">
                        <Avatar className="size-9">
                          <AvatarImage src={gravatarUrl} alt={displayEmail || displayName} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold tracking-tight leading-none">{displayName}</span>
                            <span className="text-xs rounded-md border px-2 py-0.5 text-muted-foreground">{providerLabel}</span>
                          </div>
                          <span className="leading-none text-sm text-muted-foreground">
                            {displayEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-lg font-semibold">Editar perfil</h2>
                    <p className="text-sm text-muted-foreground mb-4">Actualiza tu nombre y teléfono.</p>
                    <AccountProfileForm initialName={me?.name || me?.username || ''} initialPhone={me?.phone || ''} />
                  </TabsContent>
                  <TabsContent value="seguridad" className="p-4">
                    <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
                    <p className="text-sm text-muted-foreground mb-4">Introduce tu contraseña actual y la nueva.</p>
                    <AccountPasswordForm />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
export const metadata = {
  title: "Cuenta",
}