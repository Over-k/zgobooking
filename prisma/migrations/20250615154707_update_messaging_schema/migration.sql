/*
  Warnings:

  - You are about to drop the column `lastMessageAt` on the `message_threads` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageText` on the `message_threads` table. All the data in the column will be lost.
  - Changed the type of `type` on the `message_attachments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "attachment_types" AS ENUM ('IMAGE', 'DOCUMENT', 'LOCATION', 'AUDIO', 'VIDEO');

-- AlterTable
ALTER TABLE "message_attachments" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "mimeType" TEXT,
DROP COLUMN "type",
ADD COLUMN     "type" "attachment_types" NOT NULL;

-- AlterTable
ALTER TABLE "message_thread_participants" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastReadAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "message_threads" DROP COLUMN "lastMessageAt",
DROP COLUMN "lastMessageText";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "messages_threadId_createdAt_idx" ON "messages"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_recipientId_isRead_idx" ON "messages"("recipientId", "isRead");

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_lastMessageId_fkey" FOREIGN KEY ("lastMessageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
