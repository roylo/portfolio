import React from 'react'
import Projects from '@/components/projects'
import Link from 'next/link'
import { getContent, ProjectMetadata } from '@/lib/content'

const RecentProjects = async () => {
  const projects = await getContent(2, 'projects')
  return (
    <section className='pb-24'>
      <div>
        <h2 className='title mb-12'>Recent projects</h2>
        <Projects projects={projects as ProjectMetadata[]} />

        <Link
          href='/projects'
          className='mt-8 inline-flex items-center gap-2 text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
        >
          <span>All projects</span>
        </Link>
      </div>
    </section>

    
  )
}

export default RecentProjects