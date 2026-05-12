import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { errorResponse, getUserFromRequest, jsonResponse } from '@/lib/auth'

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'ADMIN') return errorResponse('Forbidden: Only Admins can add members', 403)

    const projectId = params.id
    const { email } = await req.json()
    if (!email) return errorResponse('User email is required')

    const targetUser = await prisma.user.findUnique({ where: { email } })
    if (!targetUser) return errorResponse('User not found', 404)

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUser.id
      },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    })

    return jsonResponse(member, 201)
  } catch (error: any) {
    if (error.code === 'P2002') return errorResponse('User is already a member of this project', 409)
    console.error('ProjectMember POST error:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const user = await getUserFromRequest(req)
    if (!user) return errorResponse('Unauthorized', 401)
    if (user.role !== 'ADMIN') return errorResponse('Forbidden: Only Admins can remove members', 403)

    const projectId = params.id
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    if (!userId) return errorResponse('User ID is required')

    await prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId }
      }
    })

    return jsonResponse({ message: 'Member removed' })
  } catch (error) {
    console.error('ProjectMember DELETE error:', error)
    return errorResponse('Internal server error', 500)
  }
}
