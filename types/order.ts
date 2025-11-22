import { z } from "zod";

export const OrderStatusSchema = z.enum(["pending", "completed", "cancelled"]);

export const OrderSchema = z.object({
    id: z.number(),
    status: OrderStatusSchema,
});

export const OrderDetailSchema = z.object({
    id: z.number(),
    orderId: z.number(),
    productOptionId: z.number(),
    qty: z.number().min(0),
    unitPrice: z.number().min(0),
});

export const CreateOrderDetailSchema = z.object({
    productOptionId: z.number(),
    qty: z.number().min(0),
});

export const CreateOrderSchema = z.object({
    details: z.array(CreateOrderDetailSchema),
});

export const FindOrderDetailSchema = z.object({
    id: z.number(),
    orderId: z.number(),
    productOptionId: z.number(),
    qty: z.number().min(0),
    unitPrice: z.number().min(0),
  });

export const FindOrderSchema = z.object({
    id: z.number(),
    status: OrderStatusSchema,
    details: z.array(FindOrderDetailSchema),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderDetail = z.infer<typeof OrderDetailSchema>;
export type FindOrderDetail = z.infer<typeof FindOrderDetailSchema>;
export type FindOrderDto = z.infer<typeof FindOrderSchema>;
export type OrderStatus = z.infer<typeof OrderStatusSchema>;