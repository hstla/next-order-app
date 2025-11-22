import { prisma } from "@/lib/prisma";
import { CreateProductDto } from "@/types/product";

export const productService = {
    async createWithOptions(data: CreateProductDto) {
        console.log("상품 생성 시작");
        return prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    name: data.name,
                },
            });
            
            const options = await Promise.all(
                data.options.map((option) => {
                    return tx.productOption.create({
                    data: {
                        productId: product.id,
                        price: option.price,
                        stock: option.stock,
                        version: 0,
                    },
                    });
                }),
              );
            return {
                ...product,
                options,
            };
        });
    },

    async getProducts() {
      console.log("상품 전체 조회 시작");
      return await prisma.product.findMany();
  },
};