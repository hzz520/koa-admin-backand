-- AlterTable
ALTER TABLE `role` MODIFY `code` VARCHAR(100) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `category` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL DEFAULT '',
    `name` VARCHAR(100) NOT NULL DEFAULT '',
    `createAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updateAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `form` (
    `id` VARCHAR(150) NOT NULL DEFAULT '',
    `name` VARCHAR(100) NOT NULL,
    `config` TEXT NOT NULL,
    `extConfig` TEXT NULL,
    `authorId` INTEGER UNSIGNED NOT NULL,
    `categoryId` INTEGER NULL,
    `createAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updateAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `versionId` VARCHAR(100) NOT NULL DEFAULT '',

    UNIQUE INDEX `versionId`(`versionId`),
    INDEX `form_authorId_idx`(`authorId`),
    INDEX `form_categoryId_idx`(`categoryId`),
    INDEX `uid`(`id`),
    PRIMARY KEY (`versionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
