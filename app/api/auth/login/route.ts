import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, jsonResponse, signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return errorResponse('Missing required fields')
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return errorResponse('Invalid email or password', 401)
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401)
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    return jsonResponse({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}
