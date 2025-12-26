'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadDocument(
  topicSlug: string,
  file: File,
  name: string,
  description?: string,
  expiresAt?: string,
  employerName?: string,
  documentType?: string
) {
  console.log('📤 [UPLOAD] Début de l\'upload')
  console.log('📤 [UPLOAD] Paramètres:', { topicSlug, fileName: file.name, fileSize: file.size, fileType: file.type, name })

  const supabase = await createClient()
  console.log('📤 [UPLOAD] Client Supabase créé')

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  console.log('📤 [UPLOAD] User:', user ? { id: user.id, email: user.email } : 'null')
  if (userError) {
    console.error('📤 [UPLOAD] Erreur getUser:', userError)
  }

  if (!user) {
    console.error('📤 [UPLOAD] ❌ Utilisateur non authentifié')
    return { error: 'Non authentifié' }
  }

  // Générer un nom de fichier unique
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${topicSlug}/${Date.now()}.${fileExt}`
  const filePath = `documents/${fileName}`
  console.log('📤 [UPLOAD] Chemin du fichier généré:', filePath)

  // Upload du fichier dans Supabase Storage
  console.log('📤 [UPLOAD] Début upload vers Storage...')
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('Documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  console.log('📤 [UPLOAD] Résultat upload:', { uploadData, uploadError })
  
  if (uploadError) {
    console.error('📤 [UPLOAD] ❌ Erreur upload Storage:', uploadError)
    console.error('📤 [UPLOAD] Détails erreur:', {
      message: uploadError.message,
      name: uploadError.name,
      error: uploadError
    })
    return { error: uploadError.message }
  }

  console.log('📤 [UPLOAD] ✅ Fichier uploadé avec succès')

  // Récupérer l'URL publique du fichier
  const { data: { publicUrl } } = supabase.storage
    .from('Documents')
    .getPublicUrl(filePath)
  console.log('📤 [UPLOAD] URL publique générée:', publicUrl)

  // Vérifier auth.uid() avant l'insertion
  const { data: { user: authUser } } = await supabase.auth.getUser()
  console.log('📤 [UPLOAD] Auth user ID:', authUser?.id)
  console.log('📤 [UPLOAD] User ID à insérer:', user.id)
  console.log('📤 [UPLOAD] Match?', authUser?.id === user.id)

  // Enregistrer les métadonnées dans la table documents
  const insertData = {
    user_id: user.id,
    topic_slug: topicSlug,
    name,
    file_path: filePath,
    file_size: file.size,
    file_type: file.type,
    description: description || null,
    expires_at: expiresAt || null,
    employer_name: employerName || null,
    document_type: documentType || null,
  }
  console.log('📤 [UPLOAD] Données à insérer en DB:', insertData)

  // Vérifier que la table existe
  const { data: tableCheck, error: tableError } = await supabase
    .from('documents')
    .select('id')
    .limit(0)

  console.log('📤 [UPLOAD] Vérification table documents:', { tableCheck, tableError })

  const { data, error } = await supabase
    .from('documents')
    .insert(insertData)
    .select()
    .single()

  console.log('📤 [UPLOAD] Résultat insertion DB:', { data, error })

  if (error) {
    console.error('📤 [UPLOAD] ❌ Erreur insertion DB:', error)
    console.error('📤 [UPLOAD] Détails erreur DB:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    // Si l'insertion échoue, supprimer le fichier uploadé
    console.log('📤 [UPLOAD] Tentative de suppression du fichier uploadé...')
    const { error: deleteError } = await supabase.storage.from('Documents').remove([filePath])
    if (deleteError) {
      console.error('📤 [UPLOAD] Erreur lors de la suppression du fichier:', deleteError)
    }
    return { error: error.message }
  }

  console.log('📤 [UPLOAD] ✅ Document créé avec succès:', data)
  revalidatePath(`/topics/${topicSlug}`)
  return { data: { ...data, public_url: publicUrl } }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  // Récupérer le document pour obtenir le file_path et topic_slug
  const { data: document } = await supabase
    .from('documents')
    .select('file_path, topic_slug')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single()

  if (!document) {
    return { error: 'Document non trouvé' }
  }

  // Supprimer le fichier du storage
  const { error: storageError } = await supabase.storage
    .from('Documents')
    .remove([document.file_path])

  if (storageError) {
    console.error('Erreur lors de la suppression du fichier:', storageError)
  }

  // Supprimer l'enregistrement de la base de données
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/topics/${document.topic_slug}`)
  return { success: true }
}

export async function getDocuments(topicSlug: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*, document_type')
    .eq('user_id', user.id)
    .eq('topic_slug', topicSlug)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  // Ajouter les URLs publiques pour chaque document
  const documentsWithUrls = (data || []).map(doc => {
    const { data: { publicUrl } } = supabase.storage
      .from('Documents')
      .getPublicUrl(doc.file_path)
    return { ...doc, public_url: publicUrl }
  })

  return { data: documentsWithUrls, error: null }
}

export async function updateDocument(
  documentId: string,
  updates: {
    name?: string
    description?: string
    expiresAt?: string | null
    employerName?: string | null
    documentType?: string | null
  }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non authentifié' }
  }

  const updateData: any = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.description !== undefined) updateData.description = updates.description
  if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt
  if (updates.employerName !== undefined) updateData.employer_name = updates.employerName
  if (updates.documentType !== undefined) updateData.document_type = updates.documentType

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/topics/${data.topic_slug}`)
  return { data }
}

