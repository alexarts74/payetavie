'use client'

import { useState } from 'react'
import { addBookmark, removeBookmark } from '@/app/actions/bookmarks'
import type { Bookmark } from '@/types'
import { Link2, ExternalLink, Heart, ChevronRight } from 'lucide-react'

interface BookmarksSectionProps {
  topicSlug: string
  initialBookmarks: Bookmark[]
  resources: Array<{ name: string; url: string }>
}

export default function BookmarksSection({ topicSlug, initialBookmarks, resources }: BookmarksSectionProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const bookmarkUrls = new Set(bookmarks.map(b => b.resource_url))

  const handleToggleBookmark = async (resourceName: string, resourceUrl: string) => {
    const existingBookmark = bookmarks.find(b => b.resource_url === resourceUrl)

    if (existingBookmark) {
      const result = await removeBookmark(existingBookmark.id)
      if (result.success) {
        setBookmarks(bookmarks.filter(b => b.id !== existingBookmark.id))
      }
    } else {
      const result = await addBookmark(topicSlug, resourceName, resourceUrl)
      if (result.data) {
        setBookmarks([...bookmarks, result.data])
      }
    }
  }

  return (
    <div className="bg-white rounded-[2rem] border border-blue-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md">
          <Link2 className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-900">Ressources officielles</h2>
      </div>

      {bookmarks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-700 mb-3">Mes favoris</h3>
          <div className="flex flex-wrap gap-3">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border border-indigo-200 bg-indigo-50"
              >
                <a
                  href={bookmark.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-indigo-700 font-medium text-sm group-hover:text-indigo-800 transition-colors">
                    {bookmark.resource_name}
                  </span>
                </a>
                <button
                  onClick={() => handleToggleBookmark(bookmark.resource_name, bookmark.resource_url)}
                  className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-all"
                  title="Retirer des favoris"
                >
                  <Heart className="w-4 h-4" fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {resources.map((resource, index) => {
          const isBookmarked = bookmarkUrls.has(resource.url)
          return (
            <div
              key={index}
              className="group relative flex items-center gap-3 px-4 py-3 rounded-[1.25rem] border border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 flex-1"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  {resource.name}
                </span>
                <ChevronRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </a>
              <button
                onClick={() => handleToggleBookmark(resource.name, resource.url)}
                className={`p-2 rounded-lg transition-all ${
                  isBookmarked
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'hover:bg-blue-100 text-blue-400 hover:text-blue-600'
                }`}
                title={isBookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

