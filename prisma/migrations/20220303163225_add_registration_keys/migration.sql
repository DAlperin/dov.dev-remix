-- CreateTable
CREATE TABLE "registrationSecret" (
    "key" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "registrationSecret_key_key" ON "registrationSecret"("key");
