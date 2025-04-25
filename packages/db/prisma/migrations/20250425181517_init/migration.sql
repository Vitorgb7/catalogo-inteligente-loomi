-- CreateTable
CREATE TABLE "Tinta" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "superficie" TEXT NOT NULL,
    "ambiente" TEXT NOT NULL,
    "acabamento" TEXT NOT NULL,
    "features" TEXT[],
    "linha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tinta_pkey" PRIMARY KEY ("id")
);
