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

export type Fragment = {
  metadata: FragmentMetadata
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
  gallery?: {
    description?: string
    image: string
  }[]
  slug: string
}

export type FragmentMetadata = {
  title?: string
  image?: string
  location?: string
  publishedAt?: string
  slug: string
}


export async function getContentBySlug(slug: string, directory: string = 'posts'): Promise<Post | null> {
  try {
    const filePath = path.join(rootDirectory, directory, `${slug}.md`)
    const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
    const { data, content } = matter(fileContent)
    return { metadata: { ...data, slug }, content }
  } catch {
    return null
  }
}

export async function getContent(limit?: number, directory: string = 'posts'): Promise<PostMetadata[] | ProjectMetadata[] | FragmentMetadata[]> {
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

export function getContentMetadata(filepath: string, directory: string = 'posts'): PostMetadata | ProjectMetadata | FragmentMetadata {
  const slug = filepath.replace(/\.md$/, '')
  const filePath = path.join(rootDirectory, directory, filepath)
  const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })
  const { data } = matter(fileContent)
  return { ...data, slug }
}

export async function getRandomFragments(limit: number = 4): Promise<FragmentMetadata[]> {
  const allFragments = await getContent(undefined, 'fragments') as FragmentMetadata[]
  
  // Shuffle the array using Fisher-Yates algorithm
  const shuffled = [...allFragments]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled.slice(0, limit)
}