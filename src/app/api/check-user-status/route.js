import { NextResponse } from 'next/server'
import { strapiUsers } from '@/lib/strapi'

async function checkUserStatus(email) {
  // Validación de parámetros
  if (!email) {
    return NextResponse.json({ 
      error: 'El parámetro email es requerido' 
    }, { status: 400 })
  }

  console.log('👤 Checking user status for:', email)

  const response = await strapiUsers.findByEmail(email)

  // Si la respuesta no es exitosa
  if (!response.ok) {
    // Para este endpoint específico, devolver false en lugar de error
    // ya que es normal que un usuario no exista
    if (response.status === 404 || response.status === 400) {
      return NextResponse.json({ exists: false, confirmed: false }, { status: 200 })
    }

    // Para otros errores, devolver el error
    const errorData = await response.json().catch(() => ({}))
    return NextResponse.json({ 
      error: errorData.error?.message || 'Error al verificar el usuario'
    }, { status: response.status })
  }

  const userData = await response.json()

  if (userData.length === 0) {
    return NextResponse.json({ exists: false, confirmed: false }, { status: 200 })
  }

  const user = userData[0]
  return NextResponse.json({ 
    exists: true, 
    confirmed: user.confirmed 
  }, { status: 200 })
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    return await checkUserStatus(email)
  } catch (error) {
    console.error('❌ Error in check-user-status (GET):', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json()

    return await checkUserStatus(email)
  } catch (error) {
    console.error('❌ Error in check-user-status (POST):', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 })
  }
}