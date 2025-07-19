import Link from 'next/link'

import { PostMetadata } from '@/lib/content'
import { formatDate } from '@/lib/utils'

export default function Posts({ posts }: { posts: PostMetadata[] }) {
  return (
    <ul className='flex flex-col gap-2'>
      {posts.map(post => (
        <li key={post.slug} className="group">
          <Link
            href={`/posts/${post.slug}`}
            className={`
              flex flex-col justify-between gap-x-4 gap-y-1 sm:flex-row
              rounded-xl bg-background shadow p-6
              transition-all duration-300
              border border-transparent
              group-hover:shadow-2xl
              group-hover:border-primary/40
              group-hover:-translate-y-1
              group-hover:bg-accent/40
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
            `}
            style={{
              boxShadow:
                '0 2px 8px 0 rgba(0,0,0,0.04), 0 1.5px 6px 0 rgba(0,0,0,0.03)',
            }}
          >
            <div className='max-w-lg'>
              <p className='text-lg font-semibold group-hover:text-primary transition-colors duration-300'>{post.title}</p>
              <p className='mt-1 line-clamp-2 text-sm font-light text-muted-foreground'>
                {post.summary}
              </p>
            </div>
            {post.publishedAt && (
              <p className='mt-1 text-sm font-light text-muted-foreground group-hover:text-primary/80 transition-colors duration-300'>
                {formatDate(post.publishedAt)}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}