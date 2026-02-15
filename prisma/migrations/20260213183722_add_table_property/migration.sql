-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'COMMERCIAL', 'LAND', 'OFFICE', 'WAREHOUSE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RENTED', 'RESERVED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "zipCode" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'DOP',
    "area" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "parking" INTEGER NOT NULL DEFAULT 0,
    "type" "PropertyType" NOT NULL DEFAULT 'APARTMENT',
    "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "listingType" "ListingType" NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PropertyImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feature" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FeatureToProperty" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FeatureToProperty_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feature_name_key" ON "Feature"("name");

-- CreateIndex
CREATE INDEX "_FeatureToProperty_B_index" ON "_FeatureToProperty"("B");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyImage" ADD CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToProperty" ADD CONSTRAINT "_FeatureToProperty_A_fkey" FOREIGN KEY ("A") REFERENCES "Feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FeatureToProperty" ADD CONSTRAINT "_FeatureToProperty_B_fkey" FOREIGN KEY ("B") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
