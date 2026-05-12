import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, jsonResponse, signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return errorResponse('Missing required fields')
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return errorResponse('User already exists', 409)
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER'

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    })

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
    }, 201)
  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse('Internal server error', 500)
  }
}
