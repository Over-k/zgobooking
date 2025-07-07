-- AlterTable
ALTER TABLE "message_threads" ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "lastMessageText" TEXT;
