-- Switch payments from XPay to Razorpay: gateway-neutral column names.
ALTER TABLE "Order" RENAME COLUMN "xpayOrderId" TO "gatewayOrderId";
ALTER TABLE "Order" RENAME COLUMN "xpayPaymentId" TO "gatewayPaymentId";
ALTER TABLE "Order" RENAME COLUMN "xpaySignature" TO "gatewaySignature";
ALTER TABLE "Order" ALTER COLUMN "paymentProvider" SET DEFAULT 'razorpay';

-- Webhooks look orders up by the Razorpay order id.
CREATE INDEX "Order_gatewayOrderId_idx" ON "Order"("gatewayOrderId");
