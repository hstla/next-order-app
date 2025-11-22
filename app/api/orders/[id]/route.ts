import { NextRequest, NextResponse } from 'next/server';
import { orderService } from '@/app/services/orderService';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const orderId = Number(id);
        
        if (isNaN(orderId) || orderId <= 0) {
            return NextResponse.json(
                { error: 'Invalid order ID' },
                { status: 400 }
            );
        }

        const order = await orderService.findOrderById(orderId);
        
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order, { status: 200 });
        
    } catch (error) {
        console.error('GET /api/orders/[id] ERROR:', error);
        return NextResponse.json(
            { 
                error: 'Failed to find order',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}