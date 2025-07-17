import Link from 'next/link'
import { getContent } from '@/lib/content'
import Posts from '@/components/posts'

export default async function RecentPosts() {
  const posts = await getContent(4, 'posts')

  return (
    <section className='pb-24'>
      <div>
        <h2 className='title mb-12'>Recent posts</h2>
        <Posts posts={posts} />

        <Link
          href='/posts'
          className='mt-8 inline-flex items-center gap-2 text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
        >
          <span>All posts</span>
        </Link>
      </div>
    </section>
  )
}