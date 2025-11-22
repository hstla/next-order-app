export type PaymentResult = {
    success: boolean;
    transactionId?: string;
    errorMessage?: string;
};

export const paymentService = {
    /**
     * 외부 결제 API 호출 (Mock)
     */
    async processPayment(orderId: number, amount: number): Promise<PaymentResult> {
        console.log(`[Payment API] 결제 시작: orderId=${orderId}, amount=${amount}`);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 90% 확률로 성공
        const success = Math.random() > 0.1;
        
        if (success) {
            const transactionId = `TXN-${Date.now()}-${orderId}`;
            console.log(`[Payment API] 결제 성공: ${transactionId}`);
            return {
                success: true,
                transactionId,
            };
        } else {
            console.log(`[Payment API] 결제 실패: 카드 한도 초과`);
            return {
                success: false,
                errorMessage: "카드 한도 초과",
            };
        }
    },
};