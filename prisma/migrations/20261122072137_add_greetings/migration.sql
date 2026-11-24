-- CreateTable
CREATE TABLE "greetings" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "greetings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "greetings_created_at_idx" ON "greetings"("created_at" DESC);
