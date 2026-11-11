-- Ajout des champs activity_type et urssaf_frequency au profil professionnel
-- Nécessaires pour la jauge plafond ME et le calendrier fiscal automatique
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS activity_type TEXT NOT NULL DEFAULT 'services'
    CHECK (activity_type IN ('services', 'commerce', 'mixte')),
  ADD COLUMN IF NOT EXISTS urssaf_frequency TEXT NOT NULL DEFAULT 'trimestriel'
    CHECK (urssaf_frequency IN ('mensuel', 'trimestriel'));
