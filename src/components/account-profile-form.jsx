"use client"

import { useState } from 'react'
import { toast } from 'sonner'

export default function AccountProfileForm({ initialName = '', initialPhone = '' }) {
  const [name, setName] = useState(initialName || '')
  const [phone, setPhone] = useState(initialPhone || '')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/account/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'No se pudo actualizar el perfil')
      } else {
        toast.success('Perfil actualizado correctamente')
      }
    } catch (err) {
      toast.error('Error de red al actualizar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2"
          placeholder="Tu nombre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Teléfono</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2"
          placeholder="Tu teléfono"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Guardando…' : 'Guardar cambios'}
      </button>
    </form>
  )
}