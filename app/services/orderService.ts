import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@/app/generated/prisma/client";
import { CreateOrderDto, FindOrderDto, OrderStatus } from "@/types/order";
import { productOptionService } from "./productOptionService";
import { paymentService } from "./paymentService";

const MAX_RETRIES = 3;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const orderService = {
    async createOrder(data: CreateOrderDto) {
        let lastError: Error | undefined;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                const orderCreated = await prisma.$transaction(async (tx) => {
                    // 1. 주문 생성
                    const order = await tx.order.create({
                        data: { status: "pending" },
                    });

                    let totalAmount = 0;

                    // 2. 상품 옵션 처리
                    for (const detail of data.details) {
                        const decreasedOption = await productOptionService.decreaseStock(
                            tx as PrismaClient,
                            detail.productOptionId,
                            detail.qty
                        );

                        await tx.orderDetail.create({
                            data: {
                                orderId: order.id,
                                productOptionId: decreasedOption.productOptionId,
                                qty: decreasedOption.qty,
                                unitPrice: decreasedOption.unitPrice,
                            },
                        });
                        totalAmount += decreasedOption.unitPrice * decreasedOption.qty;
                    }
                    return { order, totalAmount };
                });
                console.log(`주문 생성 성공: orderId=${orderCreated.order.id}`);

                const paymentResult = await paymentService.processPayment(
                    orderCreated.order.id, 
                    orderCreated.totalAmount
                );

                if (paymentResult.success) {
                    await prisma.order.update({
                        where: { id: orderCreated.order.id },
                        data: { status: "completed" }
                    });

                    return {
                        ...orderCreated.order,
                        status: "completed" as OrderStatus
                    };
                } else {
                    await this.cancelOrder(orderCreated.order.id, data.details);
                    throw new Error(`결제 실패: ${paymentResult.errorMessage}`);
                }

            } catch (error) {
                lastError = error as Error;
                // 동시성 충돌이 아닌 에러면 즉시 throw
                if (!lastError.message.includes("동시성 충돌")) {
                    throw lastError;
                }

                // 마지막 시도
                if (attempt === MAX_RETRIES) {
                    throw new Error(
                        `동시성 충돌로 주문 생성 실패 (${MAX_RETRIES}회 재시도 완료)`
                    );
                }

                const delay = Math.pow(2, attempt - 1) * 50;
                console.log(
                    `동시성 충돌 발생, ${attempt}회 재시도 후 대기... (${delay}ms)`
                );
                await sleep(delay);
            }
        }
        throw lastError ?? new Error("주문 생성 실패 (예상하지 못한 오류)");
    },

    // 주문 취소 + 재고 복구
    async cancelOrder(
        orderId: number,
        details: Array<{ productOptionId: number; qty: number }>
    ) {
        await prisma.$transaction(async (tx) => {
            // 주문 상태를 failed로 변경
            await tx.order.update({
                where: { id: orderId },
                data: { status: "failed" },
            });

            // 재고 복구 (보상 트랜잭션)
            for (const detail of details) {
                await tx.productOption.update({
                    where: { id: detail.productOptionId },
                    data: {
                        stock: { increment: detail.qty },
                    },
                });
            }

            console.log(`[Order] 주문 취소 및 재고 복구 완료: orderId=${orderId}`);
        });
    },

    async findOrderById(id: number): Promise<FindOrderDto> {
        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new Error(`주문 없음: ${id}`);
        }

        const details = await prisma.orderDetail.findMany({
            where: { orderId: id },
        });

        return {
            id: order.id,
            status: order.status as OrderStatus,
            details: details.map(detail => ({
                id: detail.id,
                orderId: detail.orderId,
                productOptionId: detail.productOptionId,
                qty: detail.qty,
                unitPrice: detail.unitPrice,
            })),
        }
    }
};