import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

// PUT /api/admin/host-requests/:id
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!isAdmin(session)) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        const { id } = await params;

        const { action } = await request.json()
        if (!action || !['approve', 'reject'].includes(action)) {
            return new NextResponse('Invalid action', { status: 400 })
        }

        const hostRequest = await prisma.hostRequest.update({
            where: {
                id: id
            },
            data: {
                status: action === 'approve' ? 'approved' : 'rejected',
                updatedAt: new Date()
            }
        })

        return NextResponse.json({ request: hostRequest })
    } catch (error) {
        console.error('Failed to update host request:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
} 