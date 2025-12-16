-- ============================================
-- Politiques RLS pour le bucket Storage "Documents"
-- ============================================
-- Exécutez ce script dans le SQL Editor de Supabase
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- ============================================
-- Politique SELECT (lecture)
-- ============================================
-- Permet aux utilisateurs de lire leurs propres fichiers
-- Structure du chemin : documents/{user_id}/{topic_slug}/{filename}
-- storage.foldername(name) retourne un tableau des dossiers du chemin
-- Pour "documents/user_id/topic_slug/file.pdf", cela retourne ['documents', 'user_id', 'topic_slug']
-- Donc [2] est le user_id (index 1-based en SQL, donc [1] = 'documents', [2] = 'user_id')
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'Documents' 
  AND (string_to_array(name, '/'))[2] = auth.uid()::text
);

-- ============================================
-- Politique INSERT (upload)
-- ============================================
-- Permet aux utilisateurs d'uploader leurs propres fichiers
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'Documents' 
  AND (string_to_array(name, '/'))[2] = auth.uid()::text
);

-- ============================================
-- Politique DELETE (suppression)
-- ============================================
-- Permet aux utilisateurs de supprimer leurs propres fichiers
CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'Documents' 
  AND (string_to_array(name, '/'))[2] = auth.uid()::text
);

