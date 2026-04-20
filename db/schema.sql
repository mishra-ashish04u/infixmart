-- ============================================================
--  InfixMart – Full Database Schema  (MySQL 8.0+)
--  Run this on a FRESH database.
--  For existing databases run migrate.sql instead.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Users` (
  `id`                   INT            NOT NULL AUTO_INCREMENT,
  `name`                 VARCHAR(255)   NOT NULL,
  `email`                VARCHAR(255)   NOT NULL,
  `password`             VARCHAR(255)       NULL,
  `avatar`               VARCHAR(500)       NULL,
  `mobile`               VARCHAR(20)        NULL,
  `country`              VARCHAR(100)   NOT NULL DEFAULT '',
  `accessToken`          TEXT               NULL,
  `refreshToken`         TEXT               NULL,
  `verify_email`         TINYINT(1)     NOT NULL DEFAULT 0,
  `last_login_date`      DATETIME           NULL,
  `status`               VARCHAR(20)    NOT NULL DEFAULT 'active',
  `otp`                  VARCHAR(10)        NULL,
  `otp_expires`          DATETIME           NULL,
  `google_id`            VARCHAR(100)       NULL,
  `role`                 VARCHAR(20)    NOT NULL DEFAULT 'user',
  `is_member`            TINYINT(1)     NOT NULL DEFAULT 0,
  `membership_started_at` DATETIME          NULL,
  `rto_count`            INT            NOT NULL DEFAULT 0,
  `referralCode`         VARCHAR(20)        NULL,
  `referredBy`           INT                NULL,
  `walletBalance`        DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `createdAt`            DATETIME       NOT NULL,
  `updatedAt`            DATETIME       NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_referralCode` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Products` (
  `id`              INT            NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(255)   NOT NULL,
  `slug`            VARCHAR(255)       NULL,
  `sku`             VARCHAR(100)       NULL,
  `description`     LONGTEXT           NULL,
  `images`          JSON               NULL,
  `brand`           VARCHAR(100)       NULL,
  `price`           DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `oldprice`        DECIMAL(10,2)      NULL,
  `catName`         VARCHAR(100)       NULL,
  `catId`           INT                NULL,
  `subCatId`        INT                NULL,
  `subCat`          VARCHAR(100)       NULL,
  `thirdSubCatId`   INT                NULL,
  `thirdSubCat`     VARCHAR(100)       NULL,
  `countInStock`    INT            NOT NULL DEFAULT 0,
  `rating`          DECIMAL(3,1)   NOT NULL DEFAULT 0.0,
  `isFeatured`      TINYINT(1)     NOT NULL DEFAULT 0,
  `discount`        INT            NOT NULL DEFAULT 0,
  `productRam`      TEXT               NULL,
  `size`            TEXT               NULL,
  `productWeight`   TEXT               NULL,
  `videoUrl`        VARCHAR(500)       NULL,
  `saleEndsAt`      DATETIME           NULL,
  `createdAt`       DATETIME       NOT NULL,
  `updatedAt`       DATETIME       NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Categories ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Categories` (
  `id`            INT          NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(255) NOT NULL,
  `images`        JSON             NULL,
  `parentCatName` VARCHAR(100)     NULL,
  `parentCatId`   INT              NULL,
  `createdAt`     DATETIME     NOT NULL,
  `updatedAt`     DATETIME     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Orders` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `userId`          INT           NOT NULL,
  `items`           JSON          NOT NULL,
  `shippingAddress` JSON          NOT NULL,
  `paymentMethod`   VARCHAR(50)   NOT NULL DEFAULT 'COD',
  `paymentResult`   JSON              NULL,
  `itemsPrice`      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `shippingPrice`   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `gstAmount`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `totalPrice`      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `isPaid`          TINYINT(1)    NOT NULL DEFAULT 0,
  `paidAt`          DATETIME          NULL,
  `status`          VARCHAR(30)   NOT NULL DEFAULT 'pending',
  `trackingNumber`  VARCHAR(100)      NULL,
  `courierName`     VARCHAR(100)      NULL,
  `createdAt`       DATETIME      NOT NULL,
  `updatedAt`       DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_userId` (`userId`),
  KEY `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Addresses ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Addresses` (
  `id`          INT          NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(255) NOT NULL,
  `mobile`      VARCHAR(20)  NOT NULL,
  `pincode`     VARCHAR(10)  NOT NULL,
  `flatHouse`   VARCHAR(255) NOT NULL,
  `areaStreet`  VARCHAR(255) NOT NULL,
  `landmark`    VARCHAR(255)     NULL,
  `townCity`    VARCHAR(100) NOT NULL,
  `state`       VARCHAR(100) NOT NULL,
  `country`     VARCHAR(100) NOT NULL DEFAULT 'India',
  `status`      VARCHAR(20)  NOT NULL DEFAULT 'active',
  `isDefault`   TINYINT(1)   NOT NULL DEFAULT 0,
  `userId`      INT          NOT NULL,
  `createdAt`   DATETIME     NOT NULL,
  `updatedAt`   DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── CartProducts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `CartProducts` (
  `id`          INT      NOT NULL AUTO_INCREMENT,
  `productId`   INT      NOT NULL,
  `quantity`    INT      NOT NULL DEFAULT 1,
  `userId`      INT      NOT NULL,
  `createdAt`   DATETIME NOT NULL,
  `updatedAt`   DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cart_userId` (`userId`),
  UNIQUE KEY `uq_cart_user_product` (`userId`, `productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── MyLists (Wishlist) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `MyLists` (
  `id`           INT           NOT NULL AUTO_INCREMENT,
  `productId`    INT           NOT NULL,
  `userId`       INT           NOT NULL,
  `productTitle` VARCHAR(255)      NULL,
  `image`        VARCHAR(500)      NULL,
  `rating`       DECIMAL(3,1)      NULL,
  `price`        DECIMAL(10,2)     NULL,
  `oldPrice`     DECIMAL(10,2)     NULL,
  `discount`     INT               NULL,
  `brand`        VARCHAR(100)      NULL,
  `createdAt`    DATETIME      NOT NULL,
  `updatedAt`    DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_user_product` (`userId`, `productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Reviews ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Reviews` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `userId`    INT          NOT NULL,
  `productId` INT          NOT NULL,
  `rating`    TINYINT      NOT NULL DEFAULT 5,
  `title`     VARCHAR(255)     NULL,
  `comment`   TEXT             NULL,
  `verified`  TINYINT(1)   NOT NULL DEFAULT 0,
  `images`    JSON             NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_productId` (`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Blogs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Blogs` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `title`     VARCHAR(255) NOT NULL,
  `slug`      VARCHAR(255) NOT NULL,
  `excerpt`   TEXT             NULL,
  `content`   LONGTEXT         NULL,
  `image`     VARCHAR(500)     NULL,
  `author`    VARCHAR(100)     NULL,
  `published` TINYINT(1)   NOT NULL DEFAULT 0,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blogs_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Coupons ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Coupons` (
  `id`              INT           NOT NULL AUTO_INCREMENT,
  `code`            VARCHAR(50)   NOT NULL,
  `description`     VARCHAR(255)      NULL,
  `type`            VARCHAR(20)   NOT NULL DEFAULT 'flat',
  `value`           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `minOrderValue`   DECIMAL(10,2)     NULL,
  `maxDiscount`     DECIMAL(10,2)     NULL,
  `usageLimit`      INT               NULL,
  `usageCount`      INT           NOT NULL DEFAULT 0,
  `isActive`        TINYINT(1)    NOT NULL DEFAULT 1,
  `expiresAt`       DATETIME          NULL,
  `restrictionType` VARCHAR(30)       NULL,
  `restrictedEmail` VARCHAR(255)      NULL,
  `createdAt`       DATETIME      NOT NULL,
  `updatedAt`       DATETIME      NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupons_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── HomeSlides ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `HomeSlides` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `images`    JSON             NULL,
  `title`     VARCHAR(255)     NULL,
  `link`      VARCHAR(500)     NULL,
  `order`     INT          NOT NULL DEFAULT 0,
  `type`      VARCHAR(30)  NOT NULL DEFAULT 'hero',
  `isActive`  TINYINT(1)   NOT NULL DEFAULT 1,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── HomePageContents ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `HomePageContents` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `section`    VARCHAR(50)  NOT NULL,
  `key`        VARCHAR(50)  NOT NULL,
  `title`      VARCHAR(255)     NULL,
  `subtitle`   VARCHAR(255)     NULL,
  `image`      VARCHAR(500)     NULL,
  `link`       VARCHAR(500)     NULL,
  `badge`      VARCHAR(100)     NULL,
  `badgeColor` VARCHAR(30)      NULL,
  `bgColor`    VARCHAR(30)      NULL,
  `textColor`  VARCHAR(30)      NULL,
  `createdAt`  DATETIME     NOT NULL,
  `updatedAt`  DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_homepage_section_key` (`section`, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Returns ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Returns` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `orderId`   INT          NOT NULL,
  `userId`    INT          NOT NULL,
  `reason`    TEXT             NULL,
  `status`    VARCHAR(30)  NOT NULL DEFAULT 'pending',
  `adminNote` TEXT             NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_returns_orderId` (`orderId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── StoreSettings ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `StoreSettings` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `key`       VARCHAR(100) NOT NULL,
  `value`     TEXT             NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_settings_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── AttributeTypes ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `AttributeTypes` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(100) NOT NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attr_type_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── AttributeValues ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `AttributeValues` (
  `id`              INT          NOT NULL AUTO_INCREMENT,
  `attributeTypeId` INT          NOT NULL,
  `value`           VARCHAR(100) NOT NULL,
  `createdAt`       DATETIME     NOT NULL,
  `updatedAt`       DATETIME     NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_attr_values_typeId` (`attributeTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ProductRams / ProductSizes / ProductWeights ───────────────
CREATE TABLE IF NOT EXISTS `ProductRams` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(100) NOT NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductSizes` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(100) NOT NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductWeights` (
  `id`        INT          NOT NULL AUTO_INCREMENT,
  `name`      VARCHAR(100) NOT NULL,
  `createdAt` DATETIME     NOT NULL,
  `updatedAt` DATETIME     NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ReferralLogs (auto-created by app but included for completeness) ──
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

-- ── AbandonedCartReminders (auto-created by app) ─────────────
CREATE TABLE IF NOT EXISTS `AbandonedCartReminders` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `userId`     INT          NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `name`       VARCHAR(255)     NULL,
  `cartValue`  DECIMAL(10,2)    NULL,
  `sentAt`     DATETIME         NULL,
  `status`     VARCHAR(20)  NOT NULL DEFAULT 'pending',
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_abandoned_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── AdminAuditLog (auto-created by app) ──────────────────────
CREATE TABLE IF NOT EXISTS `AdminAuditLog` (
  `id`         INT          NOT NULL AUTO_INCREMENT,
  `adminId`    INT              NULL,
  `action`     VARCHAR(100) NOT NULL,
  `entity`     VARCHAR(50)      NULL,
  `entityId`   INT              NULL,
  `detail`     TEXT             NULL,
  `createdAt`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── ProductQA (auto-created by app) ──────────────────────────
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

-- ── PushSubscriptions (auto-created by app) ──────────────────
CREATE TABLE IF NOT EXISTS `PushSubscriptions` (
  `id`           INT          NOT NULL AUTO_INCREMENT,
  `userId`       INT              NULL,
  `endpoint`     TEXT         NOT NULL,
  `p256dh`       TEXT             NULL,
  `auth`         TEXT             NULL,
  `createdAt`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
