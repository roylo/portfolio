import Projects from '@/components/projects'
import { getContent, ProjectMetadata } from '@/lib/content'

export default async function ProjectsPage() {
  const projects = await getContent(undefined, 'projects')

  return (
    <section className='pb-24 pt-30'>
      <div className='container max-w-3xl'>
        <h1 className='title mb-12'>Projects</h1>

        <Projects projects={projects as ProjectMetadata[]} />
      </div>
    </section>
  )
}