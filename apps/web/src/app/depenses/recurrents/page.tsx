import { getRecurringExpenses } from '@/app/actions/recurring-expenses'
import { getExpenseCategories } from '@/app/actions/expense-categories'
import RecurringExpensesPageContent from '@/components/RecurringExpenseCard'

export default async function RecurrentsPage() {
  const [{ data: recurringExpenses }, { data: categories }] = await Promise.all([
    getRecurringExpenses(),
    getExpenseCategories(),
  ])

  return (
    <RecurringExpensesPageContent
      initialRecurringExpenses={recurringExpenses}
      categories={categories}
    />
  )
}
