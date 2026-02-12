CREATE TABLE cache(
  key TEXT NOT NULL PRIMARY KEY,
  value TEXT NOT NULL,
  expiration INTEGER NOT NULL
);
CREATE TABLE cache_locks(
  key TEXT NOT NULL PRIMARY KEY,
  owner TEXT NOT NULL,
  expiration INTEGER NOT NULL
);
CREATE TABLE company_user(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(company_id) REFERENCES k1_companies(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(company_id, user_id)
);
CREATE TABLE jobs(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL,
  reserved_at INTEGER,
  available_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX jobs_queue_index ON jobs(queue);
CREATE TABLE k1_companies(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id INTEGER,
  name TEXT NOT NULL,
  ein TEXT,
  entity_type TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(owner_user_id) REFERENCES users(id) ON DELETE RESTRICT
);
CREATE TABLE company_user(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(company_id) REFERENCES k1_companies(id) ON DELETE CASCADE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX company_user_company_id_user_id_unique ON company_user(
  company_id,
  user_id
);
CREATE INDEX company_user_company_id_foreign ON company_user(company_id);
CREATE INDEX company_user_user_id_foreign ON company_user(user_id);
CREATE TABLE ownership_interests(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_company_id INTEGER,
  owned_company_id INTEGER NOT NULL,
  ownership_percentage REAL NOT NULL,
  effective_from DATE,
  effective_to DATE,
  ownership_class TEXT,
  inception_date DATE,
  method_of_acquisition TEXT,
  inheritance_date DATE,
  cost_basis_inherited REAL,
  gift_date DATE,
  gift_donor_basis REAL,
  gift_fmv_at_transfer REAL,
  inception_basis_year INTEGER,
  contributed_cash_property REAL,
  purchase_price REAL,
  gift_inheritance REAL,
  taxable_compensation REAL,
  inception_basis_total REAL,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(owned_company_id) REFERENCES k1_companies(id) ON DELETE CASCADE,
  FOREIGN KEY(owner_company_id) REFERENCES k1_companies(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX unique_ownership_interest ON ownership_interests(
  owner_company_id,
  owned_company_id,
  effective_from
);
CREATE TABLE k1_income_sources(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  k1_form_id INTEGER NOT NULL,
  income_type TEXT NOT NULL CHECK(income_type IN('passive', 'non_passive', 'capital', 'trade_or_business_461l')),
  description TEXT,
  amount REAL NOT NULL,
  k1_box_reference TEXT,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(k1_form_id) REFERENCES k1_forms(id) ON DELETE CASCADE
);
CREATE INDEX k1_income_sources_k1_form_id_foreign ON k1_income_sources(
  k1_form_id
);
CREATE TABLE k1_f461_worksheets(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownership_interest_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,
  line_2 REAL,
  line_3 REAL,
  line_4 REAL,
  line_5 REAL,
  line_6 REAL,
  line_8 REAL,
  line_10 REAL,
  line_11 REAL,
  line_15 REAL,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(ownership_interest_id) REFERENCES ownership_interests(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX f461_interest_year_unique ON k1_f461_worksheets(
  ownership_interest_id,
  tax_year
);
CREATE TABLE loss_carryforwards(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownership_interest_id INTEGER NOT NULL,
  origin_year INTEGER NOT NULL,
  carryforward_type TEXT NOT NULL CHECK(carryforward_type IN('at_risk', 'passive', 'excess_business_loss')),
  source_ebl_year INTEGER,
  loss_character TEXT,
  original_amount REAL NOT NULL,
  remaining_amount REAL NOT NULL,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(ownership_interest_id) REFERENCES ownership_interests(id) ON DELETE CASCADE
);
CREATE INDEX loss_carryforwards_ownership_interest_id_foreign ON loss_carryforwards(
  ownership_interest_id
);
CREATE TABLE loss_limitations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownership_interest_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,
  capital_at_risk REAL,
  at_risk_deductible REAL,
  at_risk_carryover REAL,
  passive_activity_loss REAL,
  passive_loss_allowed REAL,
  passive_loss_carryover REAL,
  excess_business_loss REAL,
  excess_business_loss_carryover REAL,
  nol_deduction_used REAL,
  nol_carryforward REAL,
  nol_80_percent_limit REAL,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(ownership_interest_id) REFERENCES ownership_interests(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX unique_loss_limit_per_year ON loss_limitations(
  ownership_interest_id,
  tax_year
);
CREATE TABLE outside_basis(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ownership_interest_id INTEGER NOT NULL,
  tax_year INTEGER NOT NULL,
  beginning_ob REAL,
  ending_ob REAL,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(ownership_interest_id) REFERENCES ownership_interests(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX unique_ob_per_year ON outside_basis(
  ownership_interest_id,
  tax_year
);
CREATE TABLE ob_adjustments(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  outside_basis_id INTEGER NOT NULL,
  adjustment_category TEXT NOT NULL CHECK(adjustment_category IN('increase', 'decrease')),
  adjustment_type_code TEXT,
  adjustment_type TEXT,
  amount REAL,
  description TEXT,
  document_path TEXT,
  document_name TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY(outside_basis_id) REFERENCES outside_basis(id) ON DELETE CASCADE
);
CREATE INDEX ob_adjustments_outside_basis_id_foreign ON ob_adjustments(
  outside_basis_id
);
CREATE TABLE sessions(
  id TEXT NOT NULL PRIMARY KEY,
  user_id INTEGER,
  ip_address TEXT,
  user_agent TEXT,
  payload TEXT NOT NULL,
  last_activity INTEGER NOT NULL
);
CREATE INDEX sessions_user_id_index ON sessions(user_id);
CREATE INDEX sessions_last_activity_index ON sessions(last_activity);
CREATE TABLE migrations(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration TEXT NOT NULL,
  batch INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "k1_forms"(
  "id" integer primary key autoincrement,
  "tax_year" integer not null,
  "form_file_path" text,
  "form_file_name" text,
  "partnership_name" text,
  "partnership_address" text,
  "partnership_ein" text,
  "partnership_tax_year_begin" date,
  "partnership_tax_year_end" date,
  "irs_center" text,
  "is_publicly_traded" integer not null default(0),
  "partner_ssn_ein" text,
  "partner_name" text,
  "partner_address" text,
  "is_general_partner" integer,
  "is_limited_partner" integer,
  "is_domestic_partner" integer,
  "is_foreign_partner" integer,
  "is_disregarded_entity" integer,
  "entity_type_code" text,
  "is_retirement_plan" integer,
  "share_of_profit_beginning" real,
  "share_of_profit_ending" real,
  "share_of_loss_beginning" real,
  "share_of_loss_ending" real,
  "share_of_capital_beginning" real,
  "share_of_capital_ending" real,
  "nonrecourse_liabilities" real,
  "qualified_nonrecourse_financing" real,
  "recourse_liabilities" real,
  "total_liabilities" real,
  "beginning_capital_account" real,
  "capital_contributed" real,
  "current_year_income_loss" real,
  "withdrawals_distributions" real,
  "other_increase_decrease" real,
  "ending_capital_account" real,
  "capital_account_tax_basis" integer,
  "capital_account_gaap" integer,
  "capital_account_section_704b" integer,
  "capital_account_other" integer,
  "capital_account_other_description" text,
  "box_1_ordinary_income" real,
  "box_2_net_rental_real_estate" real,
  "box_3_other_net_rental" real,
  "box_4a_guaranteed_payments_services" real,
  "box_4b_guaranteed_payments_capital" real,
  "box_4c_guaranteed_payments_total" real,
  "box_5_interest_income" real,
  "box_6a_ordinary_dividends" real,
  "box_6b_qualified_dividends" real,
  "box_6c_dividend_equivalents" real,
  "box_7_royalties" real,
  "box_8_net_short_term_capital_gain" real,
  "box_9a_net_long_term_capital_gain" real,
  "box_9b_collectibles_gain" real,
  "box_9c_unrecaptured_1250_gain" real,
  "box_10_net_section_1231_gain" real,
  "box_11_other_income" text,
  "box_12_section_179_deduction" real,
  "box_13_other_deductions" text,
  "box_14_self_employment_earnings" real,
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
  "ownership_interest_id" integer,
  foreign key("ownership_interest_id") references ownership_interests("id") on delete cascade on update no action
);
CREATE UNIQUE INDEX "k1_forms_ownership_interest_id_tax_year_unique" on "k1_forms"(
  "ownership_interest_id",
  "tax_year"
);
CREATE TABLE IF NOT EXISTS "user_audit_logs"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "acting_user_id" integer,
  "event_name" varchar check("event_name" in('create', 'update', 'sign-in', 'reset-password', 'reset-password-request', 'reset-password-complete', 'email-change-request', 'email-change-complete', 'email-verify', 'sign-out', 'admin-lock', 'admin-unlock')) not null,
  "is_successful" tinyint(1) not null default '1',
  "message" text,
  "ip" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete restrict,
  foreign key("acting_user_id") references "users"("id") on delete set null
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "pending_email" varchar,
  "is_admin" tinyint(1) not null default '0',
  "is_disabled" tinyint(1) not null default '0',
  "force_change_pw" tinyint(1) not null default '0',
  "last_login_at" datetime,
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  "deleted_at" datetime
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);

INSERT INTO migrations VALUES(1,'2025_12_28_185841_create_sessions_table',1);
INSERT INTO migrations VALUES(2,'2025_12_28_190213_create_k1_companies_table',1);
INSERT INTO migrations VALUES(3,'2025_12_28_190218_create_k1_forms_table',1);
INSERT INTO migrations VALUES(4,'2025_12_28_190218_create_k1_income_sources_table',1);
INSERT INTO migrations VALUES(5,'2025_12_28_190219_create_k1_loss_carryforwards_table',1);
INSERT INTO migrations VALUES(6,'2025_12_28_190219_create_k1_loss_limitations_table',1);
INSERT INTO migrations VALUES(7,'2025_12_28_190219_create_k1_outside_basis_table',1);
INSERT INTO migrations VALUES(8,'2025_12_28_190219_create_k1_ownership_table',1);
INSERT INTO migrations VALUES(9,'2025_12_28_190220_create_k1_ob_adjustments_table',1);
INSERT INTO migrations VALUES(10,'2025_12_28_191943_create_cache_table',1);
INSERT INTO migrations VALUES(11,'2025_12_31_192705_restructure_ownership_and_basis_tables',1);
INSERT INTO migrations VALUES(12,'2025_12_31_210052_move_inception_basis_to_ownership_interests',1);
INSERT INTO migrations VALUES(13,'2026_01_05_000000_add_structured_adjustment_types',1);
INSERT INTO migrations VALUES(14,'2026_01_10_185650_enhance_inception_basis_fields',1);
INSERT INTO migrations VALUES(15,'2026_01_11_222423_create_k1_f461_worksheets_table',1);
INSERT INTO migrations VALUES(16,'2026_01_14_064216_create_jobs_table',2);
INSERT INTO migrations VALUES(17,'2026_01_21_174128_restructure_k1_forms_table',3);
INSERT INTO migrations VALUES(21,'2026_02_12_012222_create_users_table',4);
INSERT INTO migrations VALUES(23,'2026_02_12_012223_create_user_audit_logs_table',5);
INSERT INTO migrations VALUES(24,'2026_02_12_021227_add_owner_user_id_to_k1_companies_table',6);
INSERT INTO migrations VALUES(25,'2026_02_12_021227_create_company_user_table',6);
