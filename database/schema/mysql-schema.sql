/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `k1_companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `k1_companies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `ein` varchar(255) DEFAULT NULL,
  `entity_type` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `zip` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `k1_f461_worksheets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `k1_f461_worksheets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ownership_interest_id` bigint(20) unsigned NOT NULL,
  `tax_year` int(11) NOT NULL,
  `line_2` decimal(16,2) DEFAULT NULL,
  `line_3` decimal(16,2) DEFAULT NULL,
  `line_4` decimal(16,2) DEFAULT NULL,
  `line_5` decimal(16,2) DEFAULT NULL,
  `line_6` decimal(16,2) DEFAULT NULL,
  `line_8` decimal(16,2) DEFAULT NULL,
  `line_10` decimal(16,2) DEFAULT NULL,
  `line_11` decimal(16,2) DEFAULT NULL,
  `line_15` decimal(16,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `f461_interest_year_unique` (`ownership_interest_id`,`tax_year`),
  CONSTRAINT `k1_f461_worksheets_ownership_interest_id_foreign` FOREIGN KEY (`ownership_interest_id`) REFERENCES `ownership_interests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `k1_forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `k1_forms` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ownership_interest_id` bigint(20) unsigned DEFAULT NULL,
  `tax_year` int(11) NOT NULL,
  `form_file_path` varchar(255) DEFAULT NULL,
  `form_file_name` varchar(255) DEFAULT NULL,
  `partnership_name` varchar(255) DEFAULT NULL,
  `partnership_address` varchar(255) DEFAULT NULL,
  `partnership_ein` varchar(255) DEFAULT NULL,
  `partnership_tax_year_begin` date DEFAULT NULL,
  `partnership_tax_year_end` date DEFAULT NULL,
  `irs_center` varchar(255) DEFAULT NULL,
  `is_publicly_traded` tinyint(1) NOT NULL DEFAULT 0,
  `partner_ssn_ein` varchar(255) DEFAULT NULL,
  `partner_name` varchar(255) DEFAULT NULL,
  `partner_address` varchar(255) DEFAULT NULL,
  `is_general_partner` tinyint(1) DEFAULT NULL,
  `is_limited_partner` tinyint(1) DEFAULT NULL,
  `is_domestic_partner` tinyint(1) DEFAULT NULL,
  `is_foreign_partner` tinyint(1) DEFAULT NULL,
  `is_disregarded_entity` tinyint(1) DEFAULT NULL,
  `entity_type_code` varchar(255) DEFAULT NULL,
  `is_retirement_plan` tinyint(1) DEFAULT NULL,
  `share_of_profit_beginning` decimal(8,4) DEFAULT NULL,
  `share_of_profit_ending` decimal(8,4) DEFAULT NULL,
  `share_of_loss_beginning` decimal(8,4) DEFAULT NULL,
  `share_of_loss_ending` decimal(8,4) DEFAULT NULL,
  `share_of_capital_beginning` decimal(8,4) DEFAULT NULL,
  `share_of_capital_ending` decimal(8,4) DEFAULT NULL,
  `nonrecourse_liabilities` decimal(16,2) DEFAULT NULL,
  `qualified_nonrecourse_financing` decimal(16,2) DEFAULT NULL,
  `recourse_liabilities` decimal(16,2) DEFAULT NULL,
  `total_liabilities` decimal(16,2) DEFAULT NULL,
  `beginning_capital_account` decimal(16,2) DEFAULT NULL,
  `capital_contributed` decimal(16,2) DEFAULT NULL,
  `current_year_income_loss` decimal(16,2) DEFAULT NULL,
  `withdrawals_distributions` decimal(16,2) DEFAULT NULL,
  `other_increase_decrease` decimal(16,2) DEFAULT NULL,
  `ending_capital_account` decimal(16,2) DEFAULT NULL,
  `capital_account_tax_basis` tinyint(1) DEFAULT NULL,
  `capital_account_gaap` tinyint(1) DEFAULT NULL,
  `capital_account_section_704b` tinyint(1) DEFAULT NULL,
  `capital_account_other` tinyint(1) DEFAULT NULL,
  `capital_account_other_description` varchar(255) DEFAULT NULL,
  `box_1_ordinary_income` decimal(16,2) DEFAULT NULL,
  `box_2_net_rental_real_estate` decimal(16,2) DEFAULT NULL,
  `box_3_other_net_rental` decimal(16,2) DEFAULT NULL,
  `box_4a_guaranteed_payments_services` decimal(16,2) DEFAULT NULL,
  `box_4b_guaranteed_payments_capital` decimal(16,2) DEFAULT NULL,
  `box_4c_guaranteed_payments_total` decimal(16,2) DEFAULT NULL,
  `box_5_interest_income` decimal(16,2) DEFAULT NULL,
  `box_6a_ordinary_dividends` decimal(16,2) DEFAULT NULL,
  `box_6b_qualified_dividends` decimal(16,2) DEFAULT NULL,
  `box_6c_dividend_equivalents` decimal(16,2) DEFAULT NULL,
  `box_7_royalties` decimal(16,2) DEFAULT NULL,
  `box_8_net_short_term_capital_gain` decimal(16,2) DEFAULT NULL,
  `box_9a_net_long_term_capital_gain` decimal(16,2) DEFAULT NULL,
  `box_9b_collectibles_gain` decimal(16,2) DEFAULT NULL,
  `box_9c_unrecaptured_1250_gain` decimal(16,2) DEFAULT NULL,
  `box_10_net_section_1231_gain` decimal(16,2) DEFAULT NULL,
  `box_11_other_income` text DEFAULT NULL,
  `box_12_section_179_deduction` decimal(16,2) DEFAULT NULL,
  `box_13_other_deductions` text DEFAULT NULL,
  `box_14_self_employment_earnings` decimal(16,2) DEFAULT NULL,
  `box_15_credits` text DEFAULT NULL,
  `box_16_foreign_transactions` text DEFAULT NULL,
  `box_17_amt_items` text DEFAULT NULL,
  `box_18_tax_exempt_income` text DEFAULT NULL,
  `box_19_distributions` text DEFAULT NULL,
  `box_20_other_info` text DEFAULT NULL,
  `box_21_foreign_taxes_paid` text DEFAULT NULL,
  `box_22_more_info` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `k1_forms_ownership_interest_id_tax_year_unique` (`ownership_interest_id`,`tax_year`),
  CONSTRAINT `k1_forms_ownership_interest_id_foreign` FOREIGN KEY (`ownership_interest_id`) REFERENCES `ownership_interests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `k1_income_sources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `k1_income_sources` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `k1_form_id` bigint(20) unsigned NOT NULL,
  `income_type` enum('passive','non_passive','capital','trade_or_business_461l') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `amount` decimal(16,2) NOT NULL,
  `k1_box_reference` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `k1_income_sources_k1_form_id_foreign` (`k1_form_id`),
  CONSTRAINT `k1_income_sources_k1_form_id_foreign` FOREIGN KEY (`k1_form_id`) REFERENCES `k1_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `loss_carryforwards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loss_carryforwards` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ownership_interest_id` bigint(20) unsigned NOT NULL,
  `origin_year` int(11) NOT NULL,
  `carryforward_type` enum('at_risk','passive','excess_business_loss') NOT NULL,
  `source_ebl_year` int(11) DEFAULT NULL,
  `loss_character` varchar(255) DEFAULT NULL,
  `original_amount` decimal(16,2) NOT NULL,
  `remaining_amount` decimal(16,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `loss_carryforwards_ownership_interest_id_foreign` (`ownership_interest_id`),
  CONSTRAINT `loss_carryforwards_ownership_interest_id_foreign` FOREIGN KEY (`ownership_interest_id`) REFERENCES `ownership_interests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `loss_limitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loss_limitations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ownership_interest_id` bigint(20) unsigned NOT NULL,
  `tax_year` int(11) NOT NULL,
  `capital_at_risk` decimal(16,2) DEFAULT NULL,
  `at_risk_deductible` decimal(16,2) DEFAULT NULL,
  `at_risk_carryover` decimal(16,2) DEFAULT NULL,
  `passive_activity_loss` decimal(16,2) DEFAULT NULL,
  `passive_loss_allowed` decimal(16,2) DEFAULT NULL,
  `passive_loss_carryover` decimal(16,2) DEFAULT NULL,
  `excess_business_loss` decimal(16,2) DEFAULT NULL,
  `excess_business_loss_carryover` decimal(16,2) DEFAULT NULL,
  `nol_deduction_used` decimal(16,2) DEFAULT NULL,
  `nol_carryforward` decimal(16,2) DEFAULT NULL,
  `nol_80_percent_limit` decimal(16,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_loss_limit_per_year` (`ownership_interest_id`,`tax_year`),
  CONSTRAINT `loss_limitations_ownership_interest_id_foreign` FOREIGN KEY (`ownership_interest_id`) REFERENCES `ownership_interests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ob_adjustments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ob_adjustments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `outside_basis_id` bigint(20) unsigned NOT NULL,
  `adjustment_category` enum('increase','decrease') NOT NULL,
  `adjustment_type_code` varchar(50) DEFAULT NULL,
  `adjustment_type` varchar(255) DEFAULT NULL,
  `amount` decimal(16,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `document_name` varchar(255) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ob_adjustments_outside_basis_id_foreign` (`outside_basis_id`),
  CONSTRAINT `ob_adjustments_outside_basis_id_foreign` FOREIGN KEY (`outside_basis_id`) REFERENCES `outside_basis` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `outside_basis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `outside_basis` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ownership_interest_id` bigint(20) unsigned NOT NULL,
  `tax_year` int(11) NOT NULL,
  `beginning_ob` decimal(16,2) DEFAULT NULL,
  `ending_ob` decimal(16,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ob_per_year` (`ownership_interest_id`,`tax_year`),
  CONSTRAINT `outside_basis_ownership_interest_id_foreign` FOREIGN KEY (`ownership_interest_id`) REFERENCES `ownership_interests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `ownership_interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ownership_interests` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `owner_company_id` bigint(20) unsigned DEFAULT NULL,
  `owned_company_id` bigint(20) unsigned NOT NULL,
  `ownership_percentage` decimal(14,11) NOT NULL,
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `ownership_class` varchar(255) DEFAULT NULL,
  `inception_date` date DEFAULT NULL,
  `method_of_acquisition` varchar(50) DEFAULT NULL,
  `inheritance_date` date DEFAULT NULL,
  `cost_basis_inherited` decimal(16,2) DEFAULT NULL,
  `gift_date` date DEFAULT NULL,
  `gift_donor_basis` decimal(16,2) DEFAULT NULL,
  `gift_fmv_at_transfer` decimal(16,2) DEFAULT NULL,
  `inception_basis_year` int(11) DEFAULT NULL,
  `contributed_cash_property` decimal(16,2) DEFAULT NULL,
  `purchase_price` decimal(16,2) DEFAULT NULL,
  `gift_inheritance` decimal(16,2) DEFAULT NULL,
  `taxable_compensation` decimal(16,2) DEFAULT NULL,
  `inception_basis_total` decimal(16,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ownership_interest` (`owner_company_id`,`owned_company_id`,`effective_from`),
  KEY `ownership_interests_owned_company_id_foreign` (`owned_company_id`),
  CONSTRAINT `ownership_interests_owned_company_id_foreign` FOREIGN KEY (`owned_company_id`) REFERENCES `k1_companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ownership_interests_owner_company_id_foreign` FOREIGN KEY (`owner_company_id`) REFERENCES `k1_companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 5.5.5-10.6.25-MariaDB.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'2025_12_28_185841_create_sessions_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'2025_12_28_190213_create_k1_companies_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'2025_12_28_190218_create_k1_forms_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2025_12_28_190218_create_k1_income_sources_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2025_12_28_190219_create_k1_loss_carryforwards_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2025_12_28_190219_create_k1_loss_limitations_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2025_12_28_190219_create_k1_outside_basis_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2025_12_28_190219_create_k1_ownership_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2025_12_28_190220_create_k1_ob_adjustments_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2025_12_28_191943_create_cache_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2025_12_31_192705_restructure_ownership_and_basis_tables',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2025_12_31_210052_move_inception_basis_to_ownership_interests',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2026_01_05_000000_add_structured_adjustment_types',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2026_01_10_185650_enhance_inception_basis_fields',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2026_01_11_222423_create_k1_f461_worksheets_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2026_01_14_064216_create_jobs_table',2);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2026_01_21_174128_restructure_k1_forms_table',3);
