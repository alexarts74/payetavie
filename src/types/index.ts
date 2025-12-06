export interface Note {
  id: string
  user_id: string
  topic_slug: string
  content: string
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

