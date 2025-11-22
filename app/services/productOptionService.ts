import { PrismaClient } from "@/app/generated/prisma/client";

export const productOptionService = {
    /**
     * 재고 차감 (낙관적 락)
     * @returns 차감된 상품 옵션 정보
     * @throws 상품 없음 / 재고 부족 / 동시성 충돌
     */
    async decreaseStock(
        tx: PrismaClient,
        productOptionId: number,
        qty: number
    ) {
        const option = await tx.productOption.findUnique({
            where: { id: productOptionId },
        });

        if (!option) {
            throw new Error(`상품 옵션 없음: ${productOptionId}`);
        }

        if (option.stock < qty) {
            throw new Error(
                `재고 부족: ${productOptionId} (요청: ${qty}, 재고: ${option.stock})`
            );
        }

        // 낙관적 락
        const updated = await tx.productOption.updateMany({
            where: {
                id: productOptionId,
                version: option.version,
            },
            data: {
                stock: { decrement: qty },
                version: { increment: 1 },
            },
        });

        if (updated.count === 0) {
            throw new Error("동시성 충돌");
        }

        return {
            productOptionId: option.id,
            unitPrice: option.price,
            qty,
        };
    },
};