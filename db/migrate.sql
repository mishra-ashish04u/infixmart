-- ============================================================
--  InfixMart – Incremental Migration  (MySQL 8.0+)
--  Run this on an EXISTING database that was set up before
--  the referral / wallet / tracking features were added.
--  Safe to run multiple times (IF NOT EXISTS / IGNORE).
-- ============================================================

SET NAMES utf8mb4;

-- ── Users: new columns ───────────────────────────────────────
ALTER TABLE `Users`
  ADD COLUMN IF NOT EXISTS `referralCode`  VARCHAR(20)   NULL         AFTER `rto_count`,
  ADD COLUMN IF NOT EXISTS `referredBy`    INT           NULL         AFTER `referralCode`,
  ADD COLUMN IF NOT EXISTS `walletBalance` DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `referredBy`;

-- Unique index on referralCode (safe to run if already exists)
CREATE UNIQUE INDEX IF NOT EXISTS `uq_users_referralCode` ON `Users` (`referralCode`);

-- ── Orders: tracking columns ─────────────────────────────────
ALTER TABLE `Orders`
  ADD COLUMN IF NOT EXISTS `trackingNumber` VARCHAR(100) NULL AFTER `status`,
  ADD COLUMN IF NOT EXISTS `courierName`    VARCHAR(100) NULL AFTER `trackingNumber`;

-- ── Products: sale & video columns ──────────────────────────
ALTER TABLE `Products`
  ADD COLUMN IF NOT EXISTS `videoUrl`   VARCHAR(500) NULL AFTER `productWeight`,
  ADD COLUMN IF NOT EXISTS `saleEndsAt` DATETIME     NULL AFTER `videoUrl`;

-- ── New tables (created automatically by the app on first use,
--    but listed here for completeness / manual pre-creation) ──

CREATE TABLE IF NOT EXISTS `ReferralLogs` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `referrerId` INT      NOT NULL,
  `refereeId`  INT      NOT NULL,
  `orderId`    INT          NULL,
  `credited`   TINYINT(1) NOT NULL DEFAULT 0,
  `creditedAt` DATETIME     NULL,
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_referee` (`refereeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AbandonedCartReminders` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `userId`    INT          NOT NULL,
  `email`     VARCHAR(255) NOT NULL,
  `name`      VARCHAR(255)     NULL,
  `cartValue` DECIMAL(10,2)    NULL,
  `sentAt`    DATETIME         NULL,
  `status`    VARCHAR(20)  NOT NULL DEFAULT 'pending',
  `createdAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_abandoned_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdminAuditLog` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `adminId`   INT              NULL,
  `action`    VARCHAR(100) NOT NULL,
  `entity`    VARCHAR(50)      NULL,
  `entityId`  INT              NULL,
  `detail`    TEXT             NULL,
  `createdAt` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductQA` (
  `id`         INT      NOT NULL AUTO_INCREMENT,
  `productId`  INT      NOT NULL,
  `userId`     INT          NULL,
  `question`   TEXT     NOT NULL,
  `answer`     TEXT         NULL,
  `answeredAt` DATETIME     NULL,
  `createdAt`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_qa_productId` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `PushSubscriptions` (
  `id`        INT      NOT NULL AUTO_INCREMENT,
  `userId`    INT          NULL,
  `endpoint`  TEXT     NOT NULL,
  `p256dh`    TEXT         NULL,
  `auth`      TEXT         NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Done.
SELECT 'Migration complete' AS status;
