-- CreateTable
CREATE TABLE "AdsPower" (
    "id" SERIAL NOT NULL,
    "endPoint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdsPower_pkey" PRIMARY KEY ("id")
);
