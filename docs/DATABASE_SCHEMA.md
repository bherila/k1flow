# K-1 Flow Database Schema

## Overview

K1 Flow uses a relational database to track Schedule K-1 forms and related tax information. This document describes the database schema and relationships.

## Entity Relationship Diagram

```
┌─────────────────┐
│  k1_companies   │
│─────────────────│
│ id (PK)         │
│ name            │
│ ein             │
│ entity_type     │
│ address         │
│ city, state, zip│
└────────┬────────┘
         │
         │ 1:many
         ▼
┌─────────────────┐      ┌──────────────────────┐
│    k1_forms     │      │    k1_ownership      │
│─────────────────│      │──────────────────────│
│ id (PK)         │      │ id (PK)              │
│ company_id (FK) │      │ owner_company_id (FK)│
│ tax_year        │      │ owned_company_id (FK)│
│ [K-1 fields]    │      │ ownership_percentage │
└───────┬─────────┘      │ effective_from/to    │
        │                └──────────────────────┘
        │ 1:many
        ▼
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  ┌──────────────────┐  ┌──────────────────────┐           │
│  │k1_income_sources │  │ k1_loss_carryforwards│           │
│  │──────────────────│  │──────────────────────│           │
│  │ k1_form_id (FK)  │  │ k1_form_id (FK)      │           │
│  │ income_type      │  │ loss_type            │           │
│  │ amount           │  │ amount               │           │
│  └──────────────────┘  └──────────────────────┘           │
│                                                           │
│  ┌──────────────────┐  ┌──────────────────────┐           │
│  │ k1_outside_basis │  │ k1_loss_limitations  │           │
│  │──────────────────│  │──────────────────────│           │
│  │ k1_form_id (FK)  │  │ k1_form_id (FK)      │           │
│  │ beginning_ob     │  │ capital_at_risk      │           │
│  │ ending_ob        │  │ passive_loss_...     │           │
│  └────────┬─────────┘  └──────────────────────┘           │
│           │                                               │
│           │ 1:many                                        │
│           ▼                                               │
│  ┌──────────────────┐                                     │
│  │k1_ob_adjustments │                                     │
│  │──────────────────│                                     │
│  │outside_basis_id  │                                     │
│  │adjustment_cat    │                                     │
│  │[adjustment fields]│                                    │
│  └──────────────────┘                                     │
└───────────────────────────────────────────────────────────┘
```

## Tables

### k1_companies
Stores information about partnerships, S-corps, and other pass-through entities that issue K-1 forms.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| name | varchar(255) | Company name |
| ein | varchar(20) | Employer Identification Number |
| entity_type | varchar(50) | e.g., Partnership, S-Corp, LLC |
| address | varchar(255) | Street address |
| city | varchar(100) | City |
| state | varchar(2) | State code |
| zip | varchar(20) | ZIP code |
| notes | text | Additional notes |

### k1_forms
Stores Schedule K-1 forms with all IRS-defined fields from Parts I, II, and III.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| company_id | bigint | FK to k1_companies |
| tax_year | int | Tax year (e.g., 2024) |
| form_file_path | varchar | Path to uploaded PDF |
| form_file_name | varchar | Original filename |
| partnership_* | various | Part I fields |
| partner_* | various | Part II fields |
| share_of_* | decimal(8,4) | Ownership percentages |
| *_liabilities | decimal(16,2) | Box K liability amounts |
| *_capital_account | decimal(16,2) | Box L capital account |
| box_1 through box_22 | various | Part III income/deduction items |

### k1_income_sources
Categorizes income by type for loss limitation purposes.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| k1_form_id | bigint | FK to k1_forms |
| income_type | enum | passive, non_passive, capital, trade_or_business_461l |
| description | varchar | Description |
| amount | decimal(16,2) | Amount |
| k1_box_reference | varchar | Reference to K-1 box (e.g., "Box 1") |

### k1_outside_basis
Tracks partner's outside basis in the partnership interest.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| k1_form_id | bigint | FK to k1_forms |
| contributed_cash_property | decimal(16,2) | Initial contribution |
| purchase_price | decimal(16,2) | Purchase price if acquired |
| gift_inheritance | decimal(16,2) | Basis from gift/inheritance |
| taxable_compensation | decimal(16,2) | Compensatory interest |
| inception_basis_total | decimal(16,2) | Total inception basis |
| beginning_ob | decimal(16,2) | Beginning of year OB |
| ending_ob | decimal(16,2) | End of year OB |

### k1_ob_adjustments
CPA work product for annual basis adjustments.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| outside_basis_id | bigint | FK to k1_outside_basis |
| adjustment_category | enum | increase, decrease |
| contributed_cash_property | decimal(16,2) | Cash/property contributions |
| increase_share_liabilities | decimal(16,2) | Liability increases |
| share_income_gain | decimal(16,2) | Share of income/gain |
| excess_depletion | decimal(16,2) | Excess depletion (oil/gas) |
| distributions | decimal(16,2) | Cash/property distributions |
| losses | decimal(16,2) | Share of losses |
| decrease_share_liabilities | decimal(16,2) | Liability decreases |

### k1_loss_limitations
Tracks loss limitation calculations under IRS rules.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| k1_form_id | bigint | FK to k1_forms |
| capital_at_risk | decimal(16,2) | Form 6198 at-risk amount |
| at_risk_deductible | decimal(16,2) | Deductible at-risk loss |
| at_risk_carryover | decimal(16,2) | Suspended at-risk loss |
| passive_activity_loss | decimal(16,2) | Form 8582 passive loss |
| passive_loss_allowed | decimal(16,2) | Allowed passive loss |
| passive_loss_carryover | decimal(16,2) | Suspended passive loss |
| excess_business_loss | decimal(16,2) | Section 461(l) EBL |
| excess_business_loss_carryover | decimal(16,2) | Suspended EBL |

### k1_loss_carryforwards
Tracks suspended losses by type and character.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| k1_form_id | bigint | FK to k1_forms |
| loss_type | enum | ordinary, capital_short_term, capital_long_term, section_1231, passive, at_risk, excess_business_loss, other |
| character | varchar | Additional characterization |
| amount | decimal(16,2) | Original loss amount |
| origination_year | int | Year loss originated |
| utilized_current_year | decimal(16,2) | Amount used this year |
| remaining_carryforward | decimal(16,2) | Remaining suspended amount |

### k1_ownership
Tracks ownership relationships for tiered structures.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| owner_company_id | bigint | FK to k1_companies (owner) |
| owned_company_id | bigint | FK to k1_companies (owned entity) |
| ownership_percentage | decimal(8,4) | Percentage ownership |
| effective_from | date | Start of ownership period |
| effective_to | date | End of ownership period (null = current) |
| ownership_class | varchar | e.g., Class A, Common, Preferred |

## Foreign Key Relationships

All child tables cascade on delete from their parent:
- k1_forms → k1_companies
- k1_income_sources → k1_forms
- k1_outside_basis → k1_forms
- k1_ob_adjustments → k1_outside_basis
- k1_loss_limitations → k1_forms
- k1_loss_carryforwards → k1_forms
- k1_ownership → k1_companies (both owner and owned)

## Money Field Convention

All monetary amounts use `DECIMAL(16,2)` for precision:
- 16 total digits, 2 decimal places
- Supports values up to $99,999,999,999,999.99
- Negative values allowed for losses
