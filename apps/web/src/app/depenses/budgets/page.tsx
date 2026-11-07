import { getExpenseCategories } from '@/app/actions/expense-categories'
import { getBudgets } from '@/app/actions/budgets'
import { getExpenseSummary } from '@/app/actions/expenses'
import BudgetPageContent from '@/components/BudgetProgressSection'

export default async function BudgetsPage() {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [{ data: categories }, { data: budgets }, { data: summary }] =
    await Promise.all([
      getExpenseCategories(),
      getBudgets(month, year),
      getExpenseSummary(month, year),
    ])

  return (
    <BudgetPageContent
      initialCategories={categories}
      initialBudgets={budgets}
      initialSummary={summary}
      initialMonth={month}
      initialYear={year}
    />
  )
}
