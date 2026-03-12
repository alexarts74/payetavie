import { getExpenseCategories, initializeDefaultCategories } from '@/app/actions/expense-categories'
import { getExpenses, getExpenseSummary } from '@/app/actions/expenses'
import { getBudgets } from '@/app/actions/budgets'
import ExpensesPageContent from '@/components/ExpensesPageContent'

export default async function DepensesPage() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  // Initialize default categories if needed
  await initializeDefaultCategories()

  const [{ data: categories }, { data: expenses }, { data: summary }, { data: budgets }] =
    await Promise.all([
      getExpenseCategories(),
      getExpenses(month, year),
      getExpenseSummary(month, year),
      getBudgets(month, year),
    ])

  return (
    <ExpensesPageContent
      initialCategories={categories}
      initialExpenses={expenses}
      initialSummary={summary}
      initialBudgets={budgets}
      initialMonth={month}
      initialYear={year}
    />
  )
}
