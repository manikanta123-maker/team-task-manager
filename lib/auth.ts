import { SignJWT, jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-change-in-production'
const key = new TextEncoder().encode(JWT_SECRET)

export interface UserPayload {
  id: string
  email: string
  role: string
}

export async function signToken(payload: UserPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key)
    return payload as unknown as UserPayload
  } catch (error) {
    return null
  }
}

export async function getUserFromRequest(req: NextRequest): Promise<UserPayload | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.split(' ')[1]
  return await verifyToken(token)
}

export function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, { status })
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
