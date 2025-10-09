import { NextResponse } from 'next/server'
import { strapiAuth } from '@/lib/strapi'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        data: null,
        error: {
          status: 400,
          name: 'ValidationError',
          message: 'Email y contraseña son requeridos',
          details: {},
        },
      }, { status: 400 })
    }

    const strapiResponse = await strapiAuth.login({
      identifier: email,
      password,
    })

    const body = await strapiResponse.json().catch(() => ({}))

    // Devuelve el cuerpo tal cual para que el cliente pueda leer error.message
    return NextResponse.json(body, { status: strapiResponse.status })
  } catch (error) {
    console.error('❌ Error interno en /api/auth/login:', error)
    return NextResponse.json({
      data: null,
      error: {
        status: 500,
        name: 'InternalServerError',
        message: 'Error interno del servidor',
        details: {},
      },
    }, { status: 500 })
  }
}