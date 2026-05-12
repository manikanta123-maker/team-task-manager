import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, getUserFromRequest, jsonResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)

    // Build the project filter
    const projectFilter = user.role === 'ADMIN' ? {} : {
      members: { some: { userId: user.id } }
    }

    const projects = await prisma.project.findMany({
      where: projectFilter,
      select: { id: true }
    })
    
    const projectIds = projects.map(p => p.id)

    // Get tasks for those projects
    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } }
    })

    const now = new Date()
    
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: tasks.filter(t => t.status === 'DONE').length,
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length,
      assignedToMe: tasks.filter(t => t.assigneeId === user.id).length
    }

    const recentTasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { project: { select: { name: true } }, assignee: { select: { name: true } } }
    })

    return jsonResponse({ stats, recentTasks })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return errorResponse('Internal server error', 500)
  }
}
