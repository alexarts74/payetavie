export interface Document {
  id: string
  user_id: string
  topic_slug: string
  name: string
  file_path: string
  file_size: number | null
  file_type: string | null
  description: string | null
  expires_at: string | null
  employer_name: string | null
  document_type: string | null
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  topic_slug: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Bookmark {
  id: string
  user_id: string
  topic_slug: string
  resource_name: string
  resource_url: string
  created_at: string
}

export type ProfileType = 'etudiant' | 'salarie' | 'independant' | 'recherche_emploi' | 'autre'

export type HousingSituation = 'locataire' | 'proprietaire' | 'parents' | 'residence_etudiante' | 'heberge'

export interface UserPreferences {
  id: string
  user_id: string
  profile_type: ProfileType
  selected_topics: string[]
  onboarding_completed: boolean
  birth_date: string | null
  postal_code: string | null
  housing_situation: HousingSituation | null
  calendar_token: string | null
  global_monthly_budget: number | null
}

export interface ProfilePageData {
  email: string
  displayName: string | null
  profileType: ProfileType
  selectedTopics: string[]
  createdAt: string
  lastSignInAt: string | null
}

// Expense types
export interface ExpenseCategory {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string
  topic_slug: string | null
  monthly_budget: number | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string | null
  title: string
  amount: number
  expense_date: string
  notes: string | null
  is_recurring: boolean
  recurring_id: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseWithCategory extends Expense {
  category?: ExpenseCategory | null
}

export interface MonthlyExpenseSummary {
  totalSpent: number
  totalBudget: number | null
  byCategory: {
    category: ExpenseCategory | null
    spent: number
    budget: number | null
    percentage: number | null
  }[]
  dailyTotals: { date: string; total: number }[]
}

// Invoicing types
export type InvoiceStatus = 'brouillon' | 'envoyee' | 'payee' | 'en_retard' | 'annulee'
export type QuotationStatus = 'brouillon' | 'envoye' | 'accepte' | 'refuse' | 'facture'
export type BillingDocumentType = 'invoice' | 'quotation'

export interface ProfessionalProfile {
  id: string
  user_id: string
  business_name: string | null
  siret: string | null
  address_line1: string | null
  address_line2: string | null
  postal_code: string | null
  city: string | null
  country: string
  tva_number: string | null
  iban: string | null
  bic: string | null
  hourly_rate: number | null
  is_micro_entrepreneur: boolean
  logo_path: string | null
  invoice_prefix: string
  quotation_prefix: string
  default_payment_terms_days: number
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  company_name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address_line1: string | null
  address_line2: string | null
  postal_code: string | null
  city: string | null
  country: string
  siret: string | null
  payment_terms_days: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BillingDocument {
  id: string
  user_id: string
  client_id: string
  type: BillingDocumentType
  document_number: string
  status: string
  document_date: string
  due_date: string | null
  expiry_date: string | null
  total_ht: number
  tva_rate: number
  tva_amount: number
  total_ttc: number
  notes: string | null
  source_document_id: string | null
  created_at: string
  updated_at: string
}

export interface BillingDocumentItem {
  id: string
  document_id: string
  description: string
  quantity: number
  unit_price: number
  tva_rate: number
  line_total: number
  sort_order: number
  created_at: string
}

export interface BillingDocumentWithItems extends BillingDocument {
  items: BillingDocumentItem[]
  client?: Client
}

// Aliases for backward compatibility in components
export type Invoice = BillingDocument & { type: 'invoice' }
export type Quotation = BillingDocument & { type: 'quotation' }
export type InvoiceItem = BillingDocumentItem
export type QuotationItem = BillingDocumentItem
export type InvoiceWithItems = BillingDocumentWithItems & { type: 'invoice' }
export type QuotationWithItems = BillingDocumentWithItems & { type: 'quotation' }

export interface InvoicingStats {
  totalRevenue: number
  totalUnpaid: number
  totalPending: number
  invoiceCount: number
  quotationCount: number
}

// Subscription types
export type PlanName = 'free' | 'essentiel' | 'pro'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string | null
  plan: PlanName
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export type RecurringFrequency = 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface RecurringExpense {
  id: string
  user_id: string
  category_id: string | null
  title: string
  amount: number
  frequency: RecurringFrequency
  day_of_month: number | null
  start_date: string
  end_date: string | null
  is_active: boolean
  last_generated_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  category?: ExpenseCategory | null
}

