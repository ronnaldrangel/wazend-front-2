"use client"

import { useState } from 'react'
import { toast } from 'sonner'

export default function AccountPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, password, passwordConfirmation }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'No se pudo cambiar la contraseña')
      } else {
        toast.success('Contraseña cambiada correctamente')
        setCurrentPassword('')
        setPassword('')
        setPasswordConfirmation('')
      }
    } catch (err) {
      toast.error('Error de red al cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Contraseña actual</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2"
          placeholder="Tu contraseña actual"
          autoComplete="current-password"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Nueva contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2"
          placeholder="Nueva contraseña"
        	autoComplete="new-password"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Confirmar nueva contraseña</label>
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2"
          placeholder="Confirmar nueva contraseña"
          autoComplete="new-password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Guardando…' : 'Cambiar contraseña'}
      </button>
    </form>
  )
}