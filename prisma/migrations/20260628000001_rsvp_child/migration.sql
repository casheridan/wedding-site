-- AlterTable
ALTER TABLE "RsvpGuest" ADD COLUMN     "isChild" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "customAnswers" JSONB;
