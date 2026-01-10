CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "k1_companies"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "ein" varchar,
  "entity_type" varchar,
  "address" varchar,
  "city" varchar,
  "state" varchar,
  "zip" varchar,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "k1_forms"(
  "id" integer primary key autoincrement not null,
  "company_id" integer not null,
  "tax_year" integer not null,
  "form_file_path" varchar,
  "form_file_name" varchar,
  "partnership_name" varchar,
  "partnership_address" varchar,
  "partnership_ein" varchar,
  "partnership_tax_year_begin" date,
  "partnership_tax_year_end" date,
  "irs_center" varchar,
  "is_publicly_traded" tinyint(1) not null default '0',
  "partner_ssn_ein" varchar,
  "partner_name" varchar,
  "partner_address" varchar,
  "is_general_partner" tinyint(1),
  "is_limited_partner" tinyint(1),
  "is_domestic_partner" tinyint(1),
  "is_foreign_partner" tinyint(1),
  "is_disregarded_entity" tinyint(1),
  "entity_type_code" varchar,
  "is_retirement_plan" tinyint(1),
  "share_of_profit_beginning" numeric,
  "share_of_profit_ending" numeric,
  "share_of_loss_beginning" numeric,
  "share_of_loss_ending" numeric,
  "share_of_capital_beginning" numeric,
  "share_of_capital_ending" numeric,
  "nonrecourse_liabilities" numeric,
  "qualified_nonrecourse_financing" numeric,
  "recourse_liabilities" numeric,
  "total_liabilities" numeric,
  "beginning_capital_account" numeric,
  "capital_contributed" numeric,
  "current_year_income_loss" numeric,
  "withdrawals_distributions" numeric,
  "other_increase_decrease" numeric,
  "ending_capital_account" numeric,
  "capital_account_tax_basis" tinyint(1),
  "capital_account_gaap" tinyint(1),
  "capital_account_section_704b" tinyint(1),
  "capital_account_other" tinyint(1),
  "capital_account_other_description" varchar,
  "box_1_ordinary_income" numeric,
  "box_2_net_rental_real_estate" numeric,
  "box_3_other_net_rental" numeric,
  "box_4a_guaranteed_payments_services" numeric,
  "box_4b_guaranteed_payments_capital" numeric,
  "box_4c_guaranteed_payments_total" numeric,
  "box_5_interest_income" numeric,
  "box_6a_ordinary_dividends" numeric,
  "box_6b_qualified_dividends" numeric,
  "box_6c_dividend_equivalents" numeric,
  "box_7_royalties" numeric,
  "box_8_net_short_term_capital_gain" numeric,
  "box_9a_net_long_term_capital_gain" numeric,
  "box_9b_collectibles_gain" numeric,
  "box_9c_unrecaptured_1250_gain" numeric,
  "box_10_net_section_1231_gain" numeric,
  "box_11_other_income" text,
  "box_12_section_179_deduction" numeric,
  "box_13_other_deductions" text,
  "box_14_self_employment_earnings" numeric,
  "box_15_credits" text,
  "box_16_foreign_transactions" text,
  "box_17_amt_items" text,
  "box_18_tax_exempt_income" text,
  "box_19_distributions" text,
  "box_20_other_info" text,
  "box_21_foreign_taxes_paid" text,
  "box_22_more_info" text,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("company_id") references "k1_companies"("id") on delete cascade
);
CREATE UNIQUE INDEX "k1_forms_company_id_tax_year_unique" on "k1_forms"(
  "company_id",
  "tax_year"
);
CREATE TABLE IF NOT EXISTS "k1_income_sources"(
  "id" integer primary key autoincrement not null,
  "k1_form_id" integer not null,
  "income_type" varchar check("income_type" in('passive', 'non_passive', 'capital', 'trade_or_business_461l')) not null,
  "description" varchar,
  "amount" numeric not null,
  "k1_box_reference" varchar,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("k1_form_id") references "k1_forms"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE TABLE IF NOT EXISTS "ownership_interests"(
  "id" integer primary key autoincrement not null,
  "owner_company_id" integer,
  "owned_company_id" integer not null,
  "ownership_percentage" numeric not null,
  "effective_from" date,
  "effective_to" date,
  "ownership_class" varchar,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  "inception_basis_year" integer,
  "contributed_cash_property" numeric,
  "purchase_price" numeric,
  "gift_inheritance" numeric,
  "taxable_compensation" numeric,
  "inception_basis_total" numeric,
  "inception_date" date,
  "method_of_acquisition" varchar,
  "inheritance_date" date,
  "cost_basis_inherited" numeric,
  "gift_date" date,
  "gift_donor_basis" numeric,
  "gift_fmv_at_transfer" numeric,
  foreign key("owner_company_id") references "k1_companies"("id") on delete cascade,
  foreign key("owned_company_id") references "k1_companies"("id") on delete cascade
);
CREATE UNIQUE INDEX "unique_ownership_interest" on "ownership_interests"(
  "owner_company_id",
  "owned_company_id",
  "effective_from"
);
CREATE TABLE IF NOT EXISTS "outside_basis"(
  "id" integer primary key autoincrement not null,
  "ownership_interest_id" integer not null,
  "tax_year" integer not null,
  "beginning_ob" numeric,
  "ending_ob" numeric,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("ownership_interest_id") references "ownership_interests"("id") on delete cascade
);
CREATE UNIQUE INDEX "unique_ob_per_year" on "outside_basis"(
  "ownership_interest_id",
  "tax_year"
);
CREATE TABLE IF NOT EXISTS "ob_adjustments"(
  "id" integer primary key autoincrement not null,
  "outside_basis_id" integer not null,
  "adjustment_category" varchar check("adjustment_category" in('increase', 'decrease')) not null,
  "adjustment_type" varchar,
  "amount" numeric,
  "description" text,
  "sort_order" integer not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  "adjustment_type_code" varchar,
  "document_path" varchar,
  "document_name" varchar,
  foreign key("outside_basis_id") references "outside_basis"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "loss_limitations"(
  "id" integer primary key autoincrement not null,
  "ownership_interest_id" integer not null,
  "tax_year" integer not null,
  "capital_at_risk" numeric,
  "at_risk_deductible" numeric,
  "at_risk_carryover" numeric,
  "passive_activity_loss" numeric,
  "passive_loss_allowed" numeric,
  "passive_loss_carryover" numeric,
  "excess_business_loss" numeric,
  "excess_business_loss_carryover" numeric,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  "nol_deduction_used" numeric,
  "nol_carryforward" numeric,
  "nol_80_percent_limit" numeric,
  foreign key("ownership_interest_id") references "ownership_interests"("id") on delete cascade
);
CREATE UNIQUE INDEX "unique_loss_limit_per_year" on "loss_limitations"(
  "ownership_interest_id",
  "tax_year"
);
CREATE TABLE IF NOT EXISTS "loss_carryforwards"(
  "id" integer primary key autoincrement not null,
  "ownership_interest_id" integer not null,
  "origin_year" integer not null,
  "carryforward_type" varchar check("carryforward_type" in('at_risk', 'passive', 'excess_business_loss')) not null,
  "loss_character" varchar,
  "original_amount" numeric not null,
  "remaining_amount" numeric not null,
  "notes" text,
  "created_at" datetime,
  "updated_at" datetime,
  "source_ebl_year" integer,
  foreign key("ownership_interest_id") references "ownership_interests"("id") on delete cascade
);

INSERT INTO migrations VALUES(1,'2025_12_28_185841_create_sessions_table',1);
INSERT INTO migrations VALUES(2,'2025_12_28_190213_create_k1_companies_table',1);
INSERT INTO migrations VALUES(3,'2025_12_28_190218_create_k1_forms_table',1);
INSERT INTO migrations VALUES(4,'2025_12_28_190218_create_k1_income_sources_table',1);
INSERT INTO migrations VALUES(5,'2025_12_28_190219_create_k1_loss_carryforwards_table',1);
INSERT INTO migrations VALUES(6,'2025_12_28_190219_create_k1_loss_limitations_table',1);
INSERT INTO migrations VALUES(7,'2025_12_28_190219_create_k1_ob_adjustments_table',1);
INSERT INTO migrations VALUES(8,'2025_12_28_190219_create_k1_outside_basis_table',1);
INSERT INTO migrations VALUES(9,'2025_12_28_190219_create_k1_ownership_table',1);
INSERT INTO migrations VALUES(10,'2025_12_28_191943_create_cache_table',1);
INSERT INTO migrations VALUES(11,'2025_12_31_192705_restructure_ownership_and_basis_tables',1);
INSERT INTO migrations VALUES(12,'2025_12_31_210052_move_inception_basis_to_ownership_interests',2);
INSERT INTO migrations VALUES(13,'2026_01_05_000000_add_structured_adjustment_types',3);
INSERT INTO migrations VALUES(14,'2026_01_10_185650_enhance_inception_basis_fields',4);
