-- SQLite Schema for K1 Flow
-- Converted from MySQL schema for testing purposes
-- This schema is used by PHPUnit tests with RefreshDatabase trait

PRAGMA foreign_keys = ON;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS ob_adjustments;
DROP TABLE IF EXISTS outside_basis;
DROP TABLE IF EXISTS loss_carryforwards;
DROP TABLE IF EXISTS loss_limitations;
DROP TABLE IF EXISTS k1_f461_worksheets;
DROP TABLE IF EXISTS k1_income_sources;
DROP TABLE IF EXISTS k1_forms;
DROP TABLE IF EXISTS ownership_interests;
DROP TABLE IF EXISTS k1_companies;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS cache_locks;
DROP TABLE IF EXISTS cache;
DROP TABLE IF EXISTS migrations;

-- Cache table
CREATE TABLE cache (
    key TEXT NOT NULL PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

-- Cache locks table
CREATE TABLE cache_locks (
    key TEXT NOT NULL PRIMARY KEY,
    owner TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

-- Jobs table
CREATE TABLE jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    attempts INTEGER NOT NULL,
    reserved_at INTEGER,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
CREATE INDEX jobs_queue_index ON jobs (queue);

-- K1 Companies table
CREATE TABLE k1_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    ein TEXT,
    entity_type TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME
);

-- Ownership Interests table
CREATE TABLE ownership_interests (
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
    FOREIGN KEY (owned_company_id) REFERENCES k1_companies (id) ON DELETE CASCADE,
    FOREIGN KEY (owner_company_id) REFERENCES k1_companies (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX unique_ownership_interest ON ownership_interests (owner_company_id, owned_company_id, effective_from);

-- K1 Forms table
CREATE TABLE k1_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    tax_year INTEGER NOT NULL,
    form_file_path TEXT,
    form_file_name TEXT,
    partnership_name TEXT,
    partnership_address TEXT,
    partnership_ein TEXT,
    partnership_tax_year_begin DATE,
    partnership_tax_year_end DATE,
    irs_center TEXT,
    is_publicly_traded INTEGER NOT NULL DEFAULT 0,
    partner_ssn_ein TEXT,
    partner_name TEXT,
    partner_address TEXT,
    is_general_partner INTEGER,
    is_limited_partner INTEGER,
    is_domestic_partner INTEGER,
    is_foreign_partner INTEGER,
    is_disregarded_entity INTEGER,
    entity_type_code TEXT,
    is_retirement_plan INTEGER,
    share_of_profit_beginning REAL,
    share_of_profit_ending REAL,
    share_of_loss_beginning REAL,
    share_of_loss_ending REAL,
    share_of_capital_beginning REAL,
    share_of_capital_ending REAL,
    nonrecourse_liabilities REAL,
    qualified_nonrecourse_financing REAL,
    recourse_liabilities REAL,
    total_liabilities REAL,
    beginning_capital_account REAL,
    capital_contributed REAL,
    current_year_income_loss REAL,
    withdrawals_distributions REAL,
    other_increase_decrease REAL,
    ending_capital_account REAL,
    capital_account_tax_basis INTEGER,
    capital_account_gaap INTEGER,
    capital_account_section_704b INTEGER,
    capital_account_other INTEGER,
    capital_account_other_description TEXT,
    box_1_ordinary_income REAL,
    box_2_net_rental_real_estate REAL,
    box_3_other_net_rental REAL,
    box_4a_guaranteed_payments_services REAL,
    box_4b_guaranteed_payments_capital REAL,
    box_4c_guaranteed_payments_total REAL,
    box_5_interest_income REAL,
    box_6a_ordinary_dividends REAL,
    box_6b_qualified_dividends REAL,
    box_6c_dividend_equivalents REAL,
    box_7_royalties REAL,
    box_8_net_short_term_capital_gain REAL,
    box_9a_net_long_term_capital_gain REAL,
    box_9b_collectibles_gain REAL,
    box_9c_unrecaptured_1250_gain REAL,
    box_10_net_section_1231_gain REAL,
    box_11_other_income TEXT,
    box_12_section_179_deduction REAL,
    box_13_other_deductions TEXT,
    box_14_self_employment_earnings REAL,
    box_15_credits TEXT,
    box_16_foreign_transactions TEXT,
    box_17_amt_items TEXT,
    box_18_tax_exempt_income TEXT,
    box_19_distributions TEXT,
    box_20_other_info TEXT,
    box_21_foreign_taxes_paid TEXT,
    box_22_more_info TEXT,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (company_id) REFERENCES k1_companies (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX k1_forms_company_id_tax_year_unique ON k1_forms (company_id, tax_year);

-- K1 Income Sources table
CREATE TABLE k1_income_sources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    k1_form_id INTEGER NOT NULL,
    income_type TEXT NOT NULL CHECK (income_type IN ('passive', 'non_passive', 'capital', 'trade_or_business_461l')),
    description TEXT,
    amount REAL NOT NULL,
    k1_box_reference TEXT,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (k1_form_id) REFERENCES k1_forms (id) ON DELETE CASCADE
);
CREATE INDEX k1_income_sources_k1_form_id_foreign ON k1_income_sources (k1_form_id);

-- K1 F461 Worksheets table
CREATE TABLE k1_f461_worksheets (
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
    FOREIGN KEY (ownership_interest_id) REFERENCES ownership_interests (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX f461_interest_year_unique ON k1_f461_worksheets (ownership_interest_id, tax_year);

-- Loss Carryforwards table
CREATE TABLE loss_carryforwards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownership_interest_id INTEGER NOT NULL,
    origin_year INTEGER NOT NULL,
    carryforward_type TEXT NOT NULL CHECK (carryforward_type IN ('at_risk', 'passive', 'excess_business_loss')),
    source_ebl_year INTEGER,
    loss_character TEXT,
    original_amount REAL NOT NULL,
    remaining_amount REAL NOT NULL,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (ownership_interest_id) REFERENCES ownership_interests (id) ON DELETE CASCADE
);
CREATE INDEX loss_carryforwards_ownership_interest_id_foreign ON loss_carryforwards (ownership_interest_id);

-- Loss Limitations table
CREATE TABLE loss_limitations (
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
    FOREIGN KEY (ownership_interest_id) REFERENCES ownership_interests (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX unique_loss_limit_per_year ON loss_limitations (ownership_interest_id, tax_year);

-- Outside Basis table
CREATE TABLE outside_basis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ownership_interest_id INTEGER NOT NULL,
    tax_year INTEGER NOT NULL,
    beginning_ob REAL,
    ending_ob REAL,
    notes TEXT,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (ownership_interest_id) REFERENCES ownership_interests (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX unique_ob_per_year ON outside_basis (ownership_interest_id, tax_year);

-- OB Adjustments table
CREATE TABLE ob_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    outside_basis_id INTEGER NOT NULL,
    adjustment_category TEXT NOT NULL CHECK (adjustment_category IN ('increase', 'decrease')),
    adjustment_type_code TEXT,
    adjustment_type TEXT,
    amount REAL,
    description TEXT,
    document_path TEXT,
    document_name TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (outside_basis_id) REFERENCES outside_basis (id) ON DELETE CASCADE
);
CREATE INDEX ob_adjustments_outside_basis_id_foreign ON ob_adjustments (outside_basis_id);

-- Sessions table
CREATE TABLE sessions (
    id TEXT NOT NULL PRIMARY KEY,
    user_id INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);
CREATE INDEX sessions_user_id_index ON sessions (user_id);
CREATE INDEX sessions_last_activity_index ON sessions (last_activity);

-- Migrations table (tracks which migrations have been run)
CREATE TABLE migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration TEXT NOT NULL,
    batch INTEGER NOT NULL
);

-- Insert migration records to indicate schema is up to date
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_185841_create_sessions_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190213_create_k1_companies_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190218_create_k1_forms_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190218_create_k1_income_sources_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190219_create_k1_loss_carryforwards_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190219_create_k1_loss_limitations_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190219_create_k1_outside_basis_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190219_create_k1_ownership_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_190220_create_k1_ob_adjustments_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_28_191943_create_cache_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_31_192705_restructure_ownership_and_basis_tables', 1);
INSERT INTO migrations (migration, batch) VALUES ('2025_12_31_210052_move_inception_basis_to_ownership_interests', 1);
INSERT INTO migrations (migration, batch) VALUES ('2026_01_05_000000_add_structured_adjustment_types', 1);
INSERT INTO migrations (migration, batch) VALUES ('2026_01_10_185650_enhance_inception_basis_fields', 1);
INSERT INTO migrations (migration, batch) VALUES ('2026_01_11_222423_create_k1_f461_worksheets_table', 1);
INSERT INTO migrations (migration, batch) VALUES ('2026_01_14_064216_create_jobs_table', 2);
