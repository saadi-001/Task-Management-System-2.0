-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: Task_Management_System_v2
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('2a8186b5-2bc3-4391-96ee-bab2b680c81e','2150d3829b58de6f32fda033351646a95d32ea65c47ca8b85b6e9f2cd933f0b0','2026-08-24 10:43:00.607','20260824104259_add_rbac_tables',NULL,NULL,'2026-08-24 10:42:59.063',1),('86f37456-c495-421b-ba4f-9ef806cf7166','ebcff3a3a00240b4040d8870ac12d912bfaa156e8821f66d5c84f1af1b715b76','2026-08-24 10:27:03.728','20260810101948_init',NULL,NULL,'2026-08-24 10:27:00.612',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activityhistory`
--

DROP TABLE IF EXISTS `activityhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activityhistory` (
  `ActivityID` int NOT NULL AUTO_INCREMENT,
  `Action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TaskID` int NOT NULL,
  `UserID` int NOT NULL,
  PRIMARY KEY (`ActivityID`),
  KEY `ActivityHistory_TaskID_fkey` (`TaskID`),
  KEY `ActivityHistory_UserID_fkey` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activityhistory`
--

LOCK TABLES `activityhistory` WRITE;
/*!40000 ALTER TABLE `activityhistory` DISABLE KEYS */;
/*!40000 ALTER TABLE `activityhistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachment`
--

DROP TABLE IF EXISTS `attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachment` (
  `AttachmentID` int NOT NULL AUTO_INCREMENT,
  `FileName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `FileUrl` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TaskID` int NOT NULL,
  PRIMARY KEY (`AttachmentID`),
  KEY `Attachment_TaskID_fkey` (`TaskID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachment`
--

LOCK TABLES `attachment` WRITE;
/*!40000 ALTER TABLE `attachment` DISABLE KEYS */;
INSERT INTO `attachment` VALUES (1,'1787578085128-634160003.jpg','http://localhost:9000/task-management/1787578085128-634160003.jpg',1);
/*!40000 ALTER TABLE `attachment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `CommentID` int NOT NULL AUTO_INCREMENT,
  `Message` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `TaskID` int NOT NULL,
  `UserID` int NOT NULL,
  PRIMARY KEY (`CommentID`),
  KEY `Comment_TaskID_fkey` (`TaskID`),
  KEY `Comment_UserID_fkey` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization`
--

DROP TABLE IF EXISTS `organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organization` (
  `OrganizationID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ContactNo` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Logo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Theme` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OwnerID` int DEFAULT NULL,
  PRIMARY KEY (`OrganizationID`),
  UNIQUE KEY `Organization_Email_key` (`Email`),
  KEY `Organization_OwnerID_fkey` (`OwnerID`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization`
--

LOCK TABLES `organization` WRITE;
/*!40000 ALTER TABLE `organization` DISABLE KEYS */;
INSERT INTO `organization` VALUES (2,'RBAC Authorized Test','rbac-authorized@test.com','03001112233',NULL,'default',1),(3,'Task Management','task@gmail.com','03001234567','logo.png','dark',2),(4,'Task Management','teeth@gmail.com','03001234567','logo.png','dark',2),(5,'Task Management','tast1@gmail.com','03001234567','logo.png','dark',3),(6,'Task Management','tast11@gmail.com','03001234567','logo.png','dark',3),(7,'Task Management','task11@gmail.com','03001234567','logo.png','dark',5);
/*!40000 ALTER TABLE `organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizationmembers`
--

DROP TABLE IF EXISTS `organizationmembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organizationmembers` (
  `OrganizationMemberID` int NOT NULL AUTO_INCREMENT,
  `OrganizationID` int NOT NULL,
  `UserID` int NOT NULL,
  `Role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`OrganizationMemberID`),
  KEY `OrganizationMembers_OrganizationID_fkey` (`OrganizationID`),
  KEY `OrganizationMembers_UserID_fkey` (`UserID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizationmembers`
--

LOCK TABLES `organizationmembers` WRITE;
/*!40000 ALTER TABLE `organizationmembers` DISABLE KEYS */;
INSERT INTO `organizationmembers` VALUES (2,4,1,'Docker-Admin');
/*!40000 ALTER TABLE `organizationmembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permission`
--

DROP TABLE IF EXISTS `permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permission` (
  `PermissionID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`PermissionID`),
  UNIQUE KEY `Permission_Name_key` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permission`
--

LOCK TABLES `permission` WRITE;
/*!40000 ALTER TABLE `permission` DISABLE KEYS */;
INSERT INTO `permission` VALUES (4,'ASSIGN_USER'),(2,'CREATE_ORGANIZATION'),(7,'DELETE_ORGANIZATION'),(1,'Docker Test'),(5,'REMOVE_USER'),(6,'TRANSFER_OWNER'),(3,'UPDATE_ORGANIZATION');
/*!40000 ALTER TABLE `permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `ProjectID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `OrganizationID` int NOT NULL,
  `OwnerID` int NOT NULL,
  PRIMARY KEY (`ProjectID`),
  KEY `Project_OrganizationID_fkey` (`OrganizationID`),
  KEY `Project_OwnerID_fkey` (`OwnerID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--

LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES (1,'Docker MinIO Testing','Project for testing Docker and MinIO integration',1,1),(3,'Task Management System','Task management system website project',4,2);
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projectmembers`
--

DROP TABLE IF EXISTS `projectmembers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projectmembers` (
  `ProjectMemberID` int NOT NULL AUTO_INCREMENT,
  `ProjectID` int NOT NULL,
  `UserID` int NOT NULL,
  `Role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ProjectMemberID`),
  KEY `ProjectMembers_ProjectID_fkey` (`ProjectID`),
  KEY `ProjectMembers_UserID_fkey` (`UserID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projectmembers`
--

LOCK TABLES `projectmembers` WRITE;
/*!40000 ALTER TABLE `projectmembers` DISABLE KEYS */;
/*!40000 ALTER TABLE `projectmembers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `Role_Name_key` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (3,'Developer'),(1,'Docker Admin'),(2,'Manager'),(4,'Member'),(5,'QA Tester');
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rolepermission`
--

DROP TABLE IF EXISTS `rolepermission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rolepermission` (
  `RolePermissionID` int NOT NULL AUTO_INCREMENT,
  `RoleID` int NOT NULL,
  `PermissionID` int NOT NULL,
  PRIMARY KEY (`RolePermissionID`),
  UNIQUE KEY `RolePermission_RoleID_PermissionID_key` (`RoleID`,`PermissionID`),
  KEY `RolePermission_PermissionID_fkey` (`PermissionID`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rolepermission`
--

LOCK TABLES `rolepermission` WRITE;
/*!40000 ALTER TABLE `rolepermission` DISABLE KEYS */;
INSERT INTO `rolepermission` VALUES (1,1,1),(3,1,2),(4,1,3),(5,1,4),(6,1,5),(7,1,6),(8,1,7),(9,2,2),(10,2,3),(11,2,4),(12,2,5),(13,2,6);
/*!40000 ALTER TABLE `rolepermission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task`
--

DROP TABLE IF EXISTS `task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task` (
  `TaskID` int NOT NULL AUTO_INCREMENT,
  `Title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Priority` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ProjectID` int NOT NULL,
  `AssignedTo` int NOT NULL,
  PRIMARY KEY (`TaskID`),
  KEY `Task_AssignedTo_fkey` (`AssignedTo`),
  KEY `Task_ProjectID_fkey` (`ProjectID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task`
--

LOCK TABLES `task` WRITE;
/*!40000 ALTER TABLE `task` DISABLE KEYS */;
INSERT INTO `task` VALUES (1,'Docker MinIO Attachment Test','Testing ticket attachment upload through Docker and MinIO','Ready to Do','High',1,1),(3,'Workflow Testing Ticket','Testing ticket workflow','Ready to Do','High',23,2),(4,'Workflow Testing Ticket','Testing ticket workflow','Ready to Do','High',3,2);
/*!40000 ALTER TABLE `task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `DateOfBirth` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `User_Email_key` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Docker User','docker@test.com','$2b$10$LMuI9hvePiXbW5TwLqYbIu2oyEftBNxfGRohRPeYSemHl9i70doni',NULL),(2,'Muhammad Saad','saad@gmail.com','$2b$10$zmR4564xiDZZiHqZvg02QuwYt05NLd4PkGbp4EqIDk08I/Bt6LOWa',NULL),(3,'Muhammad Saad','saadi@gmail.com','$2b$10$3sFCLr5elC6oN1zxR6BcRuvw/qX7RMBBjEm7/75aMXkvin0oUeX9G',NULL),(4,'Shazad','Shazad@gmail.com','$2b$10$ekrLFf/H3HQldLBgDaV7nuMiI1NCTXkR5/6m1./AoY41eTVhqn12G',NULL),(5,'Muhammad Ali','Ali@gmail.com','$2b$10$F3OqucBce4ritN88Ln/b/OspkJ0G3RPqcbVV8Gk5yLh5BTate.hbm',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userrole`
--

DROP TABLE IF EXISTS `userrole`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userrole` (
  `UserRoleID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `RoleID` int NOT NULL,
  PRIMARY KEY (`UserRoleID`),
  UNIQUE KEY `UserRole_UserID_RoleID_key` (`UserID`,`RoleID`),
  KEY `UserRole_RoleID_fkey` (`RoleID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userrole`
--

LOCK TABLES `userrole` WRITE;
/*!40000 ALTER TABLE `userrole` DISABLE KEYS */;
INSERT INTO `userrole` VALUES (1,1,1),(3,2,1),(2,2,2),(4,3,1);
/*!40000 ALTER TABLE `userrole` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-28  8:03:36
