import { NextRequest, NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/types/order';
import { orderService } from '@/app/services/orderService';
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CreateOrderSchema.parse(body);

        const order = await orderService.createOrder(validatedData);
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("ORDER API ERROR Validation failed: ", error);
            return NextResponse.json(
                { error: 'Validation failed', details: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}