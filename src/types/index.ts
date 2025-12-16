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

