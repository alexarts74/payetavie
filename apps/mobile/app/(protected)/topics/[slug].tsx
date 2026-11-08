import { useEffect, useState } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, RefreshControl,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import * as DocumentPicker from 'expo-document-picker'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { getTopicTitle, getTopicIcon, getTopicChecklist } from '@payetavie/shared'
import type { Reminder, Bookmark, Document } from '@payetavie/shared'

type RecurrenceOption = 'annuel' | 'mensuel' | null

interface ReminderForm {
  title: string
  description: string
  due_date: string
  recurrence: RecurrenceOption
}

interface BookmarkForm {
  resource_name: string
  resource_url: string
}

interface DocumentUploadForm {
  name: string
  expires_at: string
  employer_name: string
}

interface PickedFile {
  uri: string
  name: string
  size: number | null
  mimeType: string | null
}

export default function TopicDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { user } = useAuth()
  const navigation = useNavigation()

  const [reminders, setReminders] = useState<Reminder[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  // Reminder modal
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [reminderForm, setReminderForm] = useState<ReminderForm>({ title: '', description: '', due_date: '', recurrence: null })
  const [savingReminder, setSavingReminder] = useState(false)

  // Bookmark modal
  const [showBookmarkModal, setShowBookmarkModal] = useState(false)
  const [bookmarkForm, setBookmarkForm] = useState<BookmarkForm>({ resource_name: '', resource_url: '' })
  const [savingBookmark, setSavingBookmark] = useState(false)

  // Document upload modal
  const [showDocModal, setShowDocModal] = useState(false)
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null)
  const [docForm, setDocForm] = useState<DocumentUploadForm>({ name: '', expires_at: '', employer_name: '' })
  const [uploadingDoc, setUploadingDoc] = useState(false)

  const checklistItems = getTopicChecklist(slug ?? '')

  useEffect(() => {
    if (slug) navigation.setOptions({ title: getTopicTitle(slug) })
  }, [slug])

  async function loadData() {
    if (!user || !slug) return
    const [rem, docs, bkm, check] = await Promise.all([
      supabase.from('reminders').select('*').eq('user_id', user.id).eq('topic_slug', slug).order('due_date', { ascending: true, nullsFirst: false }),
      supabase.from('documents').select('*').eq('user_id', user.id).eq('topic_slug', slug).order('created_at', { ascending: false }),
      supabase.from('bookmarks').select('*').eq('user_id', user.id).eq('topic_slug', slug).order('created_at', { ascending: false }),
      supabase.from('checklist_progress').select('item_index').eq('user_id', user.id).eq('topic_slug', slug).eq('completed', true),
    ])
    setReminders(rem.data ?? [])
    setDocuments(docs.data ?? [])
    setBookmarks(bkm.data ?? [])
    setCompletedItems(new Set((check.data ?? []).map((r) => r.item_index)))
  }

  useEffect(() => { loadData() }, [user, slug])

  // ── Checklist ──────────────────────────────────────────────────────────────

  async function toggleChecklistItem(index: number) {
    if (!user || !slug) return
    const wasCompleted = completedItems.has(index)
    setCompletedItems((prev) => {
      const next = new Set(prev)
      wasCompleted ? next.delete(index) : next.add(index)
      return next
    })
    const { data: existing } = await supabase
      .from('checklist_progress').select('id, completed')
      .eq('user_id', user.id).eq('topic_slug', slug).eq('item_index', index).single()
    if (existing) {
      await supabase.from('checklist_progress').update({ completed: !wasCompleted, completed_at: !wasCompleted ? new Date().toISOString() : null }).eq('id', existing.id)
    } else {
      await supabase.from('checklist_progress').insert({ user_id: user.id, topic_slug: slug, item_index: index, completed: true, completed_at: new Date().toISOString() })
    }
  }

  // ── Reminders ──────────────────────────────────────────────────────────────

  async function toggleReminder(id: string, completed: boolean) {
    if (!user) return
    await supabase.from('reminders').update({ completed: !completed }).eq('id', id).eq('user_id', user.id)
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, completed: !completed } : r))
  }

  function openCreateReminder() {
    setEditingReminder(null)
    setReminderForm({ title: '', description: '', due_date: '', recurrence: null })
    setShowReminderModal(true)
  }

  function openEditReminder(reminder: Reminder) {
    setEditingReminder(reminder)
    setReminderForm({ title: reminder.title, description: reminder.description ?? '', due_date: reminder.due_date ?? '', recurrence: reminder.recurrence })
    setShowReminderModal(true)
  }

  async function saveReminder() {
    if (!user || !slug) return
    if (!reminderForm.title.trim()) { Alert.alert('Erreur', 'Le titre est requis'); return }
    setSavingReminder(true)
    const payload = {
      title: reminderForm.title.trim(),
      description: reminderForm.description.trim() || null,
      due_date: reminderForm.due_date.trim() || null,
      recurrence: reminderForm.recurrence,
    }
    if (editingReminder) {
      const { error } = await supabase.from('reminders').update(payload).eq('id', editingReminder.id).eq('user_id', user.id)
      if (error) { Alert.alert('Erreur', error.message); setSavingReminder(false); return }
      setReminders((prev) => prev.map((r) => r.id === editingReminder.id ? { ...r, ...payload } : r))
    } else {
      const { data, error } = await supabase.from('reminders').insert({ user_id: user.id, topic_slug: slug, ...payload }).select().single()
      if (error) { Alert.alert('Erreur', error.message); setSavingReminder(false); return }
      setReminders((prev) => [...prev, data as Reminder])
    }
    setSavingReminder(false)
    setShowReminderModal(false)
  }

  function confirmDeleteReminder(id: string) {
    Alert.alert('Supprimer ce rappel ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteReminder(id) },
    ])
  }

  async function deleteReminder(id: string) {
    if (!user) return
    await supabase.from('reminders').delete().eq('id', id).eq('user_id', user.id)
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  // ── Bookmarks ──────────────────────────────────────────────────────────────

  function openCreateBookmark() {
    setBookmarkForm({ resource_name: '', resource_url: '' })
    setShowBookmarkModal(true)
  }

  async function saveBookmark() {
    if (!user || !slug) return
    if (!bookmarkForm.resource_name.trim() || !bookmarkForm.resource_url.trim()) {
      Alert.alert('Erreur', "Le nom et l'URL sont requis")
      return
    }
    setSavingBookmark(true)
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ user_id: user.id, topic_slug: slug, resource_name: bookmarkForm.resource_name.trim(), resource_url: bookmarkForm.resource_url.trim() })
      .select().single()
    if (error) { Alert.alert('Erreur', error.message); setSavingBookmark(false); return }
    setBookmarks((prev) => [data as Bookmark, ...prev])
    setSavingBookmark(false)
    setShowBookmarkModal(false)
  }

  function confirmDeleteBookmark(id: string) {
    Alert.alert('Supprimer ce favori ?', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteBookmark(id) },
    ])
  }

  async function deleteBookmark(id: string) {
    if (!user) return
    await supabase.from('bookmarks').delete().eq('id', id).eq('user_id', user.id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  // ── Documents ──────────────────────────────────────────────────────────────

  async function pickDocument() {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true })
    if (result.canceled) return
    const file = result.assets[0]
    setPickedFile({ uri: file.uri, name: file.name, size: file.size ?? null, mimeType: file.mimeType ?? null })
    setDocForm({ name: file.name, expires_at: '', employer_name: '' })
    setShowDocModal(true)
  }

  async function uploadDocument() {
    if (!user || !slug || !pickedFile) return
    setUploadingDoc(true)
    try {
      const ext = pickedFile.name.split('.').pop() ?? 'bin'
      const filePath = `documents/${user.id}/${slug}/${Date.now()}.${ext}`

      const response = await fetch(pickedFile.uri)
      const blob = await response.blob()

      const { error: storageError } = await supabase.storage
        .from('Documents')
        .upload(filePath, blob, { contentType: pickedFile.mimeType ?? 'application/octet-stream' })

      if (storageError) { Alert.alert('Erreur upload', storageError.message); setUploadingDoc(false); return }

      const { data, error: dbError } = await supabase.from('documents').insert({
        user_id: user.id,
        topic_slug: slug,
        name: docForm.name.trim() || pickedFile.name,
        file_path: filePath,
        file_size: pickedFile.size,
        file_type: pickedFile.mimeType,
        expires_at: docForm.expires_at.trim() || null,
        employer_name: docForm.employer_name.trim() || null,
      }).select().single()

      if (dbError) { Alert.alert('Erreur', dbError.message); setUploadingDoc(false); return }

      setDocuments((prev) => [data as Document, ...prev])
      setUploadingDoc(false)
      setShowDocModal(false)
      setPickedFile(null)
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de télécharger le fichier')
      setUploadingDoc(false)
    }
  }

  function confirmDeleteDocument(doc: Document) {
    Alert.alert('Supprimer ce document ?', `"${doc.name}" sera supprimé définitivement.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => deleteDocument(doc) },
    ])
  }

  async function deleteDocument(doc: Document) {
    if (!user) return
    await supabase.storage.from('Documents').remove([doc.file_path])
    await supabase.from('documents').delete().eq('id', doc.id).eq('user_id', user.id)
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const checklistTotal = checklistItems.length
  const checklistDone = checklistTotal > 0 ? completedItems.size : 0
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0

  return (
    <>
      <ScrollView
        className="flex-1 bg-[#F5E9AF]"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await loadData(); setRefreshing(false) }} />}
      >
        <View className="px-4 py-6 pb-28 gap-6">

          {/* Header */}
          <View className="items-center py-4">
            <View className="w-16 h-16 bg-violet-50 rounded-2xl items-center justify-center mb-2">
              <Ionicons name="folder-open-outline" size={28} color="#235037" />
            </View>
            <Text className="text-2xl font-bold text-gray-900">{getTopicTitle(slug ?? '')}</Text>
          </View>

          {/* Checklist */}
          {checklistItems.length > 0 && (
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-semibold text-gray-900">Checklist</Text>
                <Text className="text-sm text-gray-500">{checklistDone}/{checklistTotal}</Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full mb-3">
                <View className="h-2 bg-violet-500 rounded-full" style={{ width: `${checklistPct}%` }} />
              </View>
              <View className="gap-2">
                {checklistItems.map((item, index) => {
                  const done = completedItems.has(index)
                  return (
                    <TouchableOpacity
                      key={index}
                      className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
                      onPress={() => toggleChecklistItem(index)}
                    >
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center flex-shrink-0 ${done ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                        {done && <Ionicons name="checkmark" size={14} color="white" />}
                      </View>
                      <Text className={`flex-1 text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          )}

          {/* Rappels */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">Rappels</Text>
              <TouchableOpacity className="w-8 h-8 bg-violet-600 rounded-full items-center justify-center" onPress={openCreateReminder}>
                <Text className="text-white text-xl font-bold leading-none">+</Text>
              </TouchableOpacity>
            </View>
            {reminders.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center">
                <Text className="text-gray-500">Aucun rappel pour ce topic</Text>
              </View>
            ) : (
              <View className="gap-2">
                {reminders.map((reminder) => (
                  <TouchableOpacity
                    key={reminder.id}
                    className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm"
                    onPress={() => toggleReminder(reminder.id, reminder.completed)}
                    onLongPress={() => openEditReminder(reminder)}
                  >
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center flex-shrink-0 ${reminder.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                      {reminder.completed && <Ionicons name="checkmark" size={14} color="white" />}
                    </View>
                    <View className="flex-1">
                      <Text className={`font-medium ${reminder.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{reminder.title}</Text>
                      {reminder.due_date && (
                        <Text className="text-sm text-gray-500">
                          {new Date(reminder.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          {reminder.recurrence ? ` · ${reminder.recurrence}` : ''}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => confirmDeleteReminder(reminder.id)} className="p-1">
                      <Ionicons name="close" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Favoris */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">Favoris</Text>
              <TouchableOpacity className="w-8 h-8 bg-violet-600 rounded-full items-center justify-center" onPress={openCreateBookmark}>
                <Text className="text-white text-xl font-bold leading-none">+</Text>
              </TouchableOpacity>
            </View>
            {bookmarks.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center">
                <Text className="text-gray-500">Aucun favori pour ce topic</Text>
              </View>
            ) : (
              <View className="gap-2">
                {bookmarks.map((bookmark) => (
                  <View key={bookmark.id} className="bg-white rounded-2xl p-4 flex-row items-center gap-3 shadow-sm">
                    <View className="w-8 h-8 bg-violet-100 rounded-lg items-center justify-center flex-shrink-0">
                      <Ionicons name="link-outline" size={15} color="#235037" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">{bookmark.resource_name}</Text>
                      <Text className="text-sm text-violet-600" numberOfLines={1}>{bookmark.resource_url}</Text>
                    </View>
                    <TouchableOpacity onPress={() => confirmDeleteBookmark(bookmark.id)} className="p-1">
                      <Ionicons name="close" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Documents */}
          <View>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900">Documents</Text>
              <TouchableOpacity className="w-8 h-8 bg-violet-600 rounded-full items-center justify-center" onPress={pickDocument}>
                <Text className="text-white text-xl font-bold leading-none">+</Text>
              </TouchableOpacity>
            </View>
            {documents.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center">
                <Text className="text-gray-500">Aucun document pour ce topic</Text>
              </View>
            ) : (
              <View className="gap-2">
                {documents.map((doc) => (
                  <View key={doc.id} className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center gap-3">
                    <View className="w-8 h-8 bg-orange-100 rounded-lg items-center justify-center flex-shrink-0">
                      <Ionicons name="document-text-outline" size={15} color="#f97316" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900">{doc.name}</Text>
                      {doc.expires_at && (
                        <Text className="text-sm text-orange-600 mt-0.5">
                          Expire le {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                        </Text>
                      )}
                      {doc.employer_name && (
                        <Text className="text-sm text-gray-500 mt-0.5">{doc.employer_name}</Text>
                      )}
                    </View>
                    <TouchableOpacity onPress={() => confirmDeleteDocument(doc)} className="p-1">
                      <Ionicons name="close" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Modal — Rappel */}
      <Modal visible={showReminderModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowReminderModal(false)}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
            <View className="px-4 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900">{editingReminder ? 'Modifier le rappel' : 'Nouveau rappel'}</Text>
                <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                  <Text className="text-gray-500 text-base">Annuler</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Titre *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : Déclarer mes impôts"
                    value={reminderForm.title}
                    onChangeText={(v) => setReminderForm((f) => ({ ...f, title: v }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Description</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Détails optionnels..."
                    value={reminderForm.description}
                    onChangeText={(v) => setReminderForm((f) => ({ ...f, description: v }))}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Date d'échéance</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="AAAA-MM-JJ"
                    value={reminderForm.due_date}
                    onChangeText={(v) => setReminderForm((f) => ({ ...f, due_date: v }))}
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Récurrence</Text>
                  <View className="flex-row gap-2">
                    {([null, 'mensuel', 'annuel'] as RecurrenceOption[]).map((opt) => (
                      <TouchableOpacity
                        key={String(opt)}
                        className={`flex-1 py-2.5 rounded-xl border items-center ${reminderForm.recurrence === opt ? 'bg-[#EBA7CB] border-[#EBA7CB]' : 'bg-white border-gray-300'}`}
                        onPress={() => setReminderForm((f) => ({ ...f, recurrence: opt }))}
                      >
                        <Text className={`text-sm font-medium ${reminderForm.recurrence === opt ? 'text-[#235037]' : 'text-gray-700'}`}>
                          {opt === null ? 'Aucune' : opt === 'mensuel' ? 'Mensuelle' : 'Annuelle'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  className={`rounded-xl py-3.5 items-center mt-2 ${savingReminder ? 'bg-violet-400' : 'bg-violet-600'}`}
                  onPress={saveReminder}
                  disabled={savingReminder}
                >
                  {savingReminder
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-semibold text-base">{editingReminder ? 'Enregistrer' : 'Créer le rappel'}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal — Favori */}
      <Modal visible={showBookmarkModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowBookmarkModal(false)}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
            <View className="px-4 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900">Nouveau favori</Text>
                <TouchableOpacity onPress={() => setShowBookmarkModal(false)}>
                  <Text className="text-gray-500 text-base">Annuler</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Nom *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : Site officiel des impôts"
                    value={bookmarkForm.resource_name}
                    onChangeText={(v) => setBookmarkForm((f) => ({ ...f, resource_name: v }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">URL *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="https://..."
                    value={bookmarkForm.resource_url}
                    onChangeText={(v) => setBookmarkForm((f) => ({ ...f, resource_url: v }))}
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <TouchableOpacity
                  className={`rounded-xl py-3.5 items-center mt-2 ${savingBookmark ? 'bg-violet-400' : 'bg-violet-600'}`}
                  onPress={saveBookmark}
                  disabled={savingBookmark}
                >
                  {savingBookmark
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-semibold text-base">Ajouter le favori</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal — Upload document */}
      <Modal visible={showDocModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowDocModal(false)}>
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView className="flex-1 bg-white" keyboardShouldPersistTaps="handled">
            <View className="px-4 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="text-xl font-bold text-gray-900">Ajouter un document</Text>
                <TouchableOpacity onPress={() => { setShowDocModal(false); setPickedFile(null) }}>
                  <Text className="text-gray-500 text-base">Annuler</Text>
                </TouchableOpacity>
              </View>

              {pickedFile && (
                <View className="bg-gray-50 rounded-xl p-3 mb-4 flex-row items-center gap-3">
                  <Ionicons name="document-text-outline" size={22} color="#6b7280" />
                  <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>{pickedFile.name}</Text>
                  {pickedFile.size && <Text className="text-xs text-gray-400">{(pickedFile.size / 1024).toFixed(0)} Ko</Text>}
                </View>
              )}

              <View className="gap-4">
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Nom du document *</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : Fiche de paie janvier"
                    value={docForm.name}
                    onChangeText={(v) => setDocForm((f) => ({ ...f, name: v }))}
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Date d'expiration (optionnel)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="AAAA-MM-JJ"
                    value={docForm.expires_at}
                    onChangeText={(v) => setDocForm((f) => ({ ...f, expires_at: v }))}
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-1">Employeur / Émetteur (optionnel)</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50"
                    placeholder="Ex : Société XYZ"
                    value={docForm.employer_name}
                    onChangeText={(v) => setDocForm((f) => ({ ...f, employer_name: v }))}
                  />
                </View>

                <TouchableOpacity
                  className={`rounded-xl py-3.5 items-center mt-2 ${uploadingDoc ? 'bg-violet-400' : 'bg-violet-600'}`}
                  onPress={uploadDocument}
                  disabled={uploadingDoc}
                >
                  {uploadingDoc
                    ? <ActivityIndicator color="white" />
                    : <Text className="text-white font-semibold text-base">Télécharger le document</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}
