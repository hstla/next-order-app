import { z } from "zod";

export const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export const ProductOptionSchema = z.object({
    id: z.number(),
    productId: z.number(),
    price: z.number().min(1),
    stock: z.number().min(1),
    version: z.number(),
});

export const CreateProductOptionSchema = ProductOptionSchema.omit({
    id: true,
    productId: true,
    version: true,
});

export const CreateProductSchema = z.object({
    name: z.string().min(1).max(50),
    options: z.array(CreateProductOptionSchema),
});

export type CreateProductOptionDto = z.infer<typeof CreateProductOptionSchema>;
export type CreateProductDto = z.infer<typeof CreateProductSchema>;
export type ProductOption = z.infer<typeof ProductOptionSchema>;
export type Product = z.infer<typeof ProductSchema>;