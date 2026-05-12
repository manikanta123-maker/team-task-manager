import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, getUserFromRequest, jsonResponse } from '@/lib/auth'

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)
    
    // In App Router, params must be awaited if they might be dynamic, but since we destructure it here, we should await params if Next.js 15 requires it. Next 15 requires `await params`. Let's just do it directly.
    const projectId = params.id;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        tasks: { include: { assignee: { select: { id: true, name: true } }, creator: { select: { id: true, name: true } } } }
      }
    })

    if (!project) return errorResponse('Project not found', 404)

    // Check access
    if (user.role !== 'ADMIN' && !project.members.some(m => m.userId === user.id)) {
      return errorResponse('Forbidden', 403)
    }

    return jsonResponse(project)
  } catch (error) {
    console.error('Project GET error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'ADMIN') return errorResponse('Forbidden', 403)

    const projectId = params.id
    const { name, description } = await req.json()

    const project = await prisma.project.update({
      where: { id: projectId },
      data: { name, description }
    })

    return jsonResponse(project)
  } catch (error) {
    console.error('Project PUT error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'ADMIN') return errorResponse('Forbidden', 403)

    const projectId = params.id
    await prisma.project.delete({ where: { id: projectId } })

    return jsonResponse({ message: 'Project deleted' })
  } catch (error) {
    console.error('Project DELETE error:', error)
    return errorResponse('Internal server error', 500)
  }
}
