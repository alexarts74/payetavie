import { getUserPreferences } from '@/app/actions/preferences'
import AnnuaireGlobal from '@/components/AnnuaireGlobal'

export default async function AnnuairePage() {
  const { data: preferences } = await getUserPreferences()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold gradient-text mb-1">Annuaire des administrations</h1>
        <p className="text-[#5A6B61]  text-sm">
          Trouvez vos administrations proches par code postal
        </p>
      </div>
      <AnnuaireGlobal initialPostalCode={preferences?.postal_code ?? null} />
    </div>
  )
}
