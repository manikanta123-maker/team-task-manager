import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, getUserFromRequest, jsonResponse } from '@/lib/auth'

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const taskId = params.id
    const { title, description, status, dueDate, assigneeId } = await req.json()

    // check task existence and project access
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    })

    if (!existingTask) return errorResponse('Task not found', 404)

    if (user.role !== 'ADMIN' && !existingTask.project.members.some(m => m.userId === user.id)) {
      return errorResponse('Forbidden: Not a member of this project', 403)
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assigneeId
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    })

    return jsonResponse(updatedTask)
  } catch (error) {
    console.error('Task PUT error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)

    const taskId = params.id
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { include: { members: true } } }
    })

    if (!existingTask) return errorResponse('Task not found', 404)

    if (user.role !== 'ADMIN' && existingTask.creatorId !== user.id) {
      return errorResponse('Forbidden: Only admins or the task creator can delete tasks', 403)
    }

    await prisma.task.delete({ where: { id: taskId } })

    return jsonResponse({ message: 'Task deleted' })
  } catch (error) {
    console.error('Task DELETE error:', error)
    return errorResponse('Internal server error', 500)
  }
}
