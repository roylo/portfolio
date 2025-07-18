import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const rootDirectory = path.join(process.cwd(), 'content')

export type Post = {
  metadata: PostMetadata
  content: string
}

export type Project = {
  metadata: ProjectMetadata
  content: string
}

export type PostMetadata = {
  title?: string
  summary?: string
  image?: string
  author?: string
  publishedAt?: string
  slug: string
}

export type ProjectMetadata = {
  title?: string
  summary?: string
  image?: string
  author?: string
  url?: string
  publishedAt?: string
  skill?: string[]
  techStack?: string[]
  duration: string[]
  slug: string
}


export async function getContentBySlug(slug: string, directory: string = 'posts'): Promise<Post | null> {
  try {
    const filePath = path.join(rootDirectory, directory, `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
    const { data, content } = matter(fileContent)
    return { metadata: { ...data, slug }, content }
  } catch (error) {
    return null
  }
}

export async function getContent(limit?: number, directory: string = 'posts'): Promise<PostMetadata[] | ProjectMetadata[]> {
  const files = fs.readdirSync(path.join(rootDirectory, directory))

  const content = files
    .map(file => getContentMetadata(file, directory))
    .sort((a, b) => {
      if (new Date(a.publishedAt ?? '') < new Date(b.publishedAt ?? '')) {
        return 1
      } else {
        return -1
      }
    })

  if (limit) {
    return content.slice(0, limit)
  }

  return content
}

export function getContentMetadata(filepath: string, directory: string = 'posts'): PostMetadata | ProjectMetadata {
  const slug = filepath.replace(/\.md$/, '')
  const filePath = path.join(rootDirectory, directory, filepath)
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
  const { data } = matter(fileContent)
  return { ...data, slug }
}