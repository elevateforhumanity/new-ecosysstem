-- Add Stripe Events Table
CREATE TABLE IF NOT EXISTS "StripeEvent" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StripeEvent_eventId_key" ON "StripeEvent"("eventId");
CREATE INDEX "StripeEvent_type_idx" ON "StripeEvent"("type");
CREATE INDEX "StripeEvent_processed_idx" ON "StripeEvent"("processed");
