import { getContentBySlug, getContent } from "@/lib/content"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import Image from "next/image"
import { formatDate } from "@/lib/utils"
import MDXContent from "@/components/mdx-content"

export async function generateStaticParams() {
  const posts = await getContent(undefined, 'posts')
  const slugs = posts.map(post => ({ slug: post.slug }))

  return slugs
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getContentBySlug(slug, 'posts')

  if (!post) {
    return notFound()
  }

  const { metadata, content } = post
  const { title, image, author, publishedAt } = metadata

  return (
    <section className='pb-24 pt-32'>
      <div className='container max-w-4xl'>
        <Link
          href='/posts'
          className='mb-8 inline-flex items-center gap-2 text-sm font-light text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeftIcon className='h-5 w-5' />
          <span>Back to posts</span>
        </Link>

        {image && (
          <div className='mb-10 w-full flex justify-center'>
            <Image
              src={image}
              alt={title || ''}
              width={1200}
              height={600}
              className='rounded-lg bg-neutral-100 object-contain'
              style={{ maxHeight: 600, width: '100%', height: 'auto', maxWidth: '100%' }}
              priority
            />
          </div>
        )}

        <header>
          <h1 className='title'>{title}</h1>
          <p className='mt-3 text-xs text-muted-foreground'>
            {author} / {formatDate(publishedAt ?? '')}
          </p>
        </header>

        <main className='prose mt-16 dark:prose-invert'>
          <MDXContent source={content} />
        </main>

      </div>
    </section>
  )
}