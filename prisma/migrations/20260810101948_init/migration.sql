-- CreateTable
CREATE TABLE `User` (
    `UserID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `Password` VARCHAR(191) NOT NULL,
    `DateOfBirth` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_Email_key`(`Email`),
    PRIMARY KEY (`UserID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Organization` (
    `OrganizationID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Email` VARCHAR(191) NOT NULL,
    `ContactNo` VARCHAR(191) NOT NULL,
    `Logo` VARCHAR(191) NULL,
    `Theme` VARCHAR(191) NULL,
    `OwnerID` INTEGER NULL,

    UNIQUE INDEX `Organization_Email_key`(`Email`),
    PRIMARY KEY (`OrganizationID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrganizationMembers` (
    `OrganizationMemberID` INTEGER NOT NULL AUTO_INCREMENT,
    `OrganizationID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,
    `Role` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`OrganizationMemberID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `ProjectID` INTEGER NOT NULL AUTO_INCREMENT,
    `Name` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NULL,
    `OrganizationID` INTEGER NOT NULL,
    `OwnerID` INTEGER NOT NULL,

    PRIMARY KEY (`ProjectID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectMembers` (
    `ProjectMemberID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProjectID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,
    `Role` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ProjectMemberID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Task` (
    `TaskID` INTEGER NOT NULL AUTO_INCREMENT,
    `Title` VARCHAR(191) NOT NULL,
    `Description` VARCHAR(191) NULL,
    `Status` VARCHAR(191) NOT NULL,
    `Priority` VARCHAR(191) NOT NULL,
    `ProjectID` INTEGER NOT NULL,
    `AssignedTo` INTEGER NOT NULL,

    PRIMARY KEY (`TaskID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `CommentID` INTEGER NOT NULL AUTO_INCREMENT,
    `Message` VARCHAR(191) NOT NULL,
    `TaskID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,

    PRIMARY KEY (`CommentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attachment` (
    `AttachmentID` INTEGER NOT NULL AUTO_INCREMENT,
    `FileName` VARCHAR(191) NOT NULL,
    `FileUrl` VARCHAR(191) NOT NULL,
    `TaskID` INTEGER NOT NULL,

    PRIMARY KEY (`AttachmentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityHistory` (
    `ActivityID` INTEGER NOT NULL AUTO_INCREMENT,
    `Action` VARCHAR(191) NOT NULL,
    `TaskID` INTEGER NOT NULL,
    `UserID` INTEGER NOT NULL,

    PRIMARY KEY (`ActivityID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Organization` ADD CONSTRAINT `Organization_OwnerID_fkey` FOREIGN KEY (`OwnerID`) REFERENCES `User`(`UserID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationMembers` ADD CONSTRAINT `OrganizationMembers_OrganizationID_fkey` FOREIGN KEY (`OrganizationID`) REFERENCES `Organization`(`OrganizationID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrganizationMembers` ADD CONSTRAINT `OrganizationMembers_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_OrganizationID_fkey` FOREIGN KEY (`OrganizationID`) REFERENCES `Organization`(`OrganizationID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_OwnerID_fkey` FOREIGN KEY (`OwnerID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMembers` ADD CONSTRAINT `ProjectMembers_ProjectID_fkey` FOREIGN KEY (`ProjectID`) REFERENCES `Project`(`ProjectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectMembers` ADD CONSTRAINT `ProjectMembers_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_ProjectID_fkey` FOREIGN KEY (`ProjectID`) REFERENCES `Project`(`ProjectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_AssignedTo_fkey` FOREIGN KEY (`AssignedTo`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_TaskID_fkey` FOREIGN KEY (`TaskID`) REFERENCES `Task`(`TaskID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attachment` ADD CONSTRAINT `Attachment_TaskID_fkey` FOREIGN KEY (`TaskID`) REFERENCES `Task`(`TaskID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityHistory` ADD CONSTRAINT `ActivityHistory_TaskID_fkey` FOREIGN KEY (`TaskID`) REFERENCES `Task`(`TaskID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityHistory` ADD CONSTRAINT `ActivityHistory_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`UserID`) ON DELETE RESTRICT ON UPDATE CASCADE;
