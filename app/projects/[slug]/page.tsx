import { getContentBySlug, getContent, ProjectMetadata } from "@/lib/content"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"
import Image from "next/image"
import MDXContent from "@/components/mdx-content"

export async function generateStaticParams() {
  const projects = await getContent(undefined, 'projects')
  const slugs = projects.map(project => ({ slug: project.slug }))

  return slugs
}

export default async function Project({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getContentBySlug(slug, 'projects')

  if (!project) {
    return notFound()
  }

  const { metadata, content } = project
  // Cast metadata to ProjectMetadata for type safety
  const { title, image, author, techStack, skill, duration } = metadata as ProjectMetadata

  return (
    <section className='pb-24 pt-32'>
      <div className='container max-w-3xl'>
        <Link
          href='/projects'
          className='mb-8 inline-flex items-center gap-2 text-sm font-light text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeftIcon className='h-5 w-5' />
          <span>Back to projects</span>
        </Link>

        {image && (
          <div className='relative mb-6 h-96 w-full overflow-hidden rounded-lg'>
            <Image
              src={image}
              alt={title || ''}
              className='object-cover'
              fill
            />
          </div>
        )}

        <header>
          <h1 className='title'>{title}</h1>
          <h2 className='mt-3 text-sm font-medium'>
            {author}
            {Array.isArray(duration) && duration.length > 0 && (
              <>
                {" / "}
                {duration[0]}
                {duration[1] && ` ~ ${duration[1]}`}
              </>
            )}
          </h2>
        </header>

        {/* Project meta labels */}
        <div className="flex flex-col gap-2 mt-6">
          {/* Tech stack labels */}
          {Array.isArray(techStack) && techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {techStack.map((tech: string) => (
                <span
                  key={tech}
                  className="
                    inline-block px-2.5 py-1 rounded-xl text-xs font-medium
                    bg-blue-100 text-blue-800 border border-blue-200
                    dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700
                    shadow-sm
                  "
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
          {/* PM skill labels */}
          {Array.isArray(skill) && skill.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {skill.map((s: string) => (
                <span
                  key={s}
                  className="
                    inline-block px-2.5 py-1 rounded-xl text-xs font-medium
                    bg-green-100 text-green-800 border border-green-200
                    dark:bg-green-900 dark:text-green-200 dark:border-green-700
                    shadow-sm
                  "
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <main className='prose mt-16 dark:prose-invert'>
          <MDXContent source={content} />
        </main>

      </div>
    </section>
  )
}