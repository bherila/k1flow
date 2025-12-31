// K1 Company
export interface K1Company {
  id: number;
  name: string;
  ein: string | null;
  entity_type: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  k1_forms_count?: number;
  k1_forms?: K1Form[];
}

// K1 Form (Schedule K-1)
export interface K1Form {
  id: number;
  company_id: number;
  tax_year: number;
  form_file_path: string | null;
  form_file_name: string | null;
  
  // Part I - Partnership Info
  partnership_name: string | null;
  partnership_address: string | null;
  partnership_ein: string | null;
  partnership_tax_year_begin: string | null;
  partnership_tax_year_end: string | null;
  irs_center: string | null;
  is_publicly_traded: boolean;
  
  // Part II - Partner Info
  partner_ssn_ein: string | null;
  partner_name: string | null;
  partner_address: string | null;
  is_general_partner: boolean | null;
  is_limited_partner: boolean | null;
  is_domestic_partner: boolean | null;
  is_foreign_partner: boolean | null;
  is_disregarded_entity: boolean | null;
  entity_type_code: string | null;
  is_retirement_plan: boolean | null;
  
  // Share percentages (Box J)
  share_of_profit_beginning: string | null;
  share_of_profit_ending: string | null;
  share_of_loss_beginning: string | null;
  share_of_loss_ending: string | null;
  share_of_capital_beginning: string | null;
  share_of_capital_ending: string | null;
  
  // Liabilities (Box K)
  nonrecourse_liabilities: string | null;
  qualified_nonrecourse_financing: string | null;
  recourse_liabilities: string | null;
  total_liabilities: string | null;
  
  // Capital Account (Box L)
  beginning_capital_account: string | null;
  capital_contributed: string | null;
  current_year_income_loss: string | null;
  withdrawals_distributions: string | null;
  other_increase_decrease: string | null;
  ending_capital_account: string | null;
  capital_account_tax_basis: boolean | null;
  capital_account_gaap: boolean | null;
  capital_account_section_704b: boolean | null;
  capital_account_other: boolean | null;
  capital_account_other_description: string | null;
  
  // Part III boxes
  box_1_ordinary_income: string | null;
  box_2_net_rental_real_estate: string | null;
  box_3_other_net_rental: string | null;
  box_4a_guaranteed_payments_services: string | null;
  box_4b_guaranteed_payments_capital: string | null;
  box_4c_guaranteed_payments_total: string | null;
  box_5_interest_income: string | null;
  box_6a_ordinary_dividends: string | null;
  box_6b_qualified_dividends: string | null;
  box_6c_dividend_equivalents: string | null;
  box_7_royalties: string | null;
  box_8_net_short_term_capital_gain: string | null;
  box_9a_net_long_term_capital_gain: string | null;
  box_9b_collectibles_gain: string | null;
  box_9c_unrecaptured_1250_gain: string | null;
  box_10_net_section_1231_gain: string | null;
  box_11_other_income: string | null;
  box_12_section_179_deduction: string | null;
  box_13_other_deductions: string | null;
  box_14_self_employment_earnings: string | null;
  box_15_credits: string | null;
  box_16_foreign_transactions: string | null;
  box_17_amt_items: string | null;
  box_18_tax_exempt_income: string | null;
  box_19_distributions: string | null;
  box_20_other_info: string | null;
  box_21_foreign_taxes_paid: string | null;
  box_22_more_info: string | null;
  
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  company?: K1Company;
  income_sources?: K1IncomeSource[];
}

// Income Source types
export type IncomeType = 'passive' | 'non_passive' | 'capital' | 'trade_or_business_461l';

export interface K1IncomeSource {
  id: number;
  k1_form_id: number;
  income_type: IncomeType;
  description: string | null;
  amount: string;
  k1_box_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Ownership Interest - represents ownership in a partnership/S-corp
export interface OwnershipInterest {
  id: number;
  owner_company_id: number | null;
  owned_company_id: number;
  ownership_percentage: string;
  effective_from: string | null;
  effective_to: string | null;
  ownership_class: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  owner_company?: K1Company;
  owned_company?: K1Company;
  outside_basis?: OutsideBasis[];
  loss_limitations?: LossLimitation[];
  loss_carryforwards?: LossCarryforward[];
}

// Outside Basis - now linked to OwnershipInterest + tax_year
export interface OutsideBasis {
  id: number;
  ownership_interest_id: number;
  tax_year: number;
  contributed_cash_property: string | null;
  purchase_price: string | null;
  gift_inheritance: string | null;
  taxable_compensation: string | null;
  inception_basis_total: string | null;
  beginning_ob: string | null;
  ending_ob: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  adjustments?: ObAdjustment[];
}

// OB Adjustment
export type AdjustmentCategory = 'increase' | 'decrease';

export interface ObAdjustment {
  id: number;
  outside_basis_id: number;
  adjustment_category: AdjustmentCategory;
  adjustment_type: string | null;
  amount: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Loss Limitations - now linked to OwnershipInterest + tax_year
export interface LossLimitation {
  id: number;
  ownership_interest_id: number;
  tax_year: number;
  capital_at_risk: string | null;
  at_risk_deductible: string | null;
  at_risk_carryover: string | null;
  passive_activity_loss: string | null;
  passive_loss_allowed: string | null;
  passive_loss_carryover: string | null;
  excess_business_loss: string | null;
  excess_business_loss_carryover: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Loss Carryforward types
export type CarryforwardType = 'at_risk' | 'passive' | 'excess_business_loss';

export interface LossCarryforward {
  id: number;
  ownership_interest_id: number;
  origin_year: number;
  carryforward_type: CarryforwardType;
  loss_character: string | null;
  original_amount: string;
  remaining_amount: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
