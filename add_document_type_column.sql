-- Ajouter la colonne document_type à la table documents
-- Pour catégoriser les documents par type (bail, assurance, charges, etc.)

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS document_type TEXT;

-- Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS documents_type_idx ON documents(document_type) WHERE document_type IS NOT NULL;

