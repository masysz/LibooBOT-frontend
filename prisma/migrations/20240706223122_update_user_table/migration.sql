-- AlterTable
ALTER TABLE `users` ADD COLUMN `telegramTaskDone` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `twitterTaskDone` BOOLEAN NOT NULL DEFAULT false;
