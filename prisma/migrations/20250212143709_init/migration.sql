-- DropForeignKey
ALTER TABLE `article` DROP FOREIGN KEY `article_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `user_roleId_fkey`;

-- AlterTable
ALTER TABLE `article` ADD COLUMN `createAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updateAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `role` ADD COLUMN `createAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updateAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `updateAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- RenameIndex
ALTER TABLE `article` RENAME INDEX `article_authorId_fkey` TO `article_authorId_idx`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `user_roleId_fkey` TO `user_roleId_idx`;
