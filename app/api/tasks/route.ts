import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, getUserFromRequest, jsonResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const url = new URL(req.url)
    const projectId = url.searchParams.get('projectId')

    const whereClause: any = {}
    if (projectId) whereClause.projectId = projectId
    
    if (user.role !== 'ADMIN') {
      whereClause.project = {
        members: {
          some: { userId: user.id }
        }
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return jsonResponse(tasks)
  } catch (error) {
    console.error('Tasks GET error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const { title, description, projectId, assigneeId, dueDate, status } = await req.json()
    if (!title || !projectId) return errorResponse('Title and Project ID are required')

    // Verify user is part of the project or admin
    if (user.role !== 'ADMIN') {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: user.id } }
      })
      if (!isMember) return errorResponse('Forbidden: You are not part of this project', 403)
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null,
        creatorId: user.id
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    })

    return jsonResponse(task, 201)
  } catch (error) {
    console.error('Tasks POST error:', error)
    return errorResponse('Internal server error', 500)
  }
}
