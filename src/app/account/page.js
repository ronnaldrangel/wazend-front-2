import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/lib/auth"
import { buildStrapiUrl } from "@/lib/strapi"
import { redirect } from "next/navigation"

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
                {error && (
                  <div className="rounded-md bg-destructive/15 text-destructive p-4 mt-4">
                    {error}
                  </div>
                )}
                {me && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Nombre</span>
                      <span className="font-medium">{me.username || me.name || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{me.email || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Proveedor</span>
                      <span className="font-medium">{me.provider || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Verificado</span>
                      <span className="font-medium">{String(me.confirmed ?? true)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Creado</span>
                      <span className="font-medium">{me.createdAt ? new Date(me.createdAt).toLocaleString() : '-'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}