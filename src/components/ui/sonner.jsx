"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster(props) {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-center"
      {...props}
    />
  )
}
