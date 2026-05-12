import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, getUserFromRequest, jsonResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)

    // Admin can see all projects, members see projects they are part of
    const projects = user.role === 'ADMIN' 
      ? await prisma.project.findMany({ include: { members: { include: { user: true } } } })
      : await prisma.project.findMany({
          where: {
            members: {
              some: { userId: user.id }
            }
          },
          include: { members: { include: { user: true } } }
        })

    return jsonResponse(projects)
  } catch (error) {
    console.error('Projects GET error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'ADMIN') return errorResponse('Forbidden: Only Admins can create projects', 403)

    const { name, description } = await req.json()
    if (!name) return errorResponse('Project name is required')

    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: user.id,
        members: {
          create: {
            userId: user.id
          }
        }
      },
      include: { members: true }
    })

    return jsonResponse(project, 201)
  } catch (error) {
    console.error('Projects POST error:', error)
    return errorResponse('Internal server error', 500)
  }
}
