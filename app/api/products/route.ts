import { NextRequest, NextResponse } from 'next/server';
import { CreateProductSchema } from '@/types/product';
import { productService } from '@/app/services/productService';
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = CreateProductSchema.parse(body);

        const product = await productService.createWithOptions(validatedData);
        return NextResponse.json(product, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
          console.error("PRODUCT API ERROR Validation failed: ", error);
          return NextResponse.json(
            { error: 'Validation failed', details: error.message },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to create product' },
          { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const productList = await productService.getProducts();
        return NextResponse.json(productList, { status: 200 });
    } catch (error) {
        console.error("PRODUCT API ERROR: Failed to get products", error);
        return NextResponse.json({ error: 'Failed to get products' }, { status: 500 });
    }
}