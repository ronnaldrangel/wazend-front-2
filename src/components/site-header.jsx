"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const pathname = usePathname() || "/"
  const map = {
    "/dashboard": "Dashboard",
    "/apps": "Aplicaciones",
    "/virtual-servers": "Servidores virtuales",
    "/products": "Todos los productos",
    "/account": "Mi Cuenta",
    "/billing": "Facturacion",
    "/": "Inicio",
  }
  const pageTitle = map[pathname] || pathname.split("/").filter(Boolean).slice(-1)[0]?.replace(/-/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) || "Página"

  return (
    <header
      className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
    </header>
  );
}
