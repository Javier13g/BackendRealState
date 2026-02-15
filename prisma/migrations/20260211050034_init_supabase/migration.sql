-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "roleId" TEXT,
    "statusId" TEXT,
    "numberAttempts" INTEGER NOT NULL,
    "userImg" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusUser" (
    "id" TEXT NOT NULL,
    "statusName" TEXT NOT NULL,

    CONSTRAINT "StatusUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RevokedToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RevokedToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cardId_key" ON "User"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "RevokedToken_token_key" ON "RevokedToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_email_key" ON "PasswordReset"("email");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "StatusUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
