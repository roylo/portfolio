import { getContent } from '@/lib/content'
import PostsWithSearch from '@/components/posts-with-search'

export default async function PostsPage() {
  const posts = await getContent(undefined, 'posts')

  return (
    <section className='pb-24 pt-30'>
      <div className='container max-w-3xl'>
        <h1 className='title mb-12'>Posts</h1>

        <PostsWithSearch posts={posts} />
      </div>
    </section>
  )
}