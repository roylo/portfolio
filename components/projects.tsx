import React from 'react'
import { ProjectMetadata } from '@/lib/content'
import Link from 'next/link'
import Image from 'next/image'

const Projects = ({ projects }: { projects: ProjectMetadata[] }) => {
  return (
    <ul className="flex flex-col gap-8">
      {projects.map(project => (
        <li key={project.slug} className="group">
          <Link
            href={`/projects/${project.slug}`}
            className={`
              flex flex-row items-center rounded-xl bg-background shadow
              transition-all duration-300 overflow-hidden
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
            {project.image && (
              <div className="relative w-2/5 min-w-[160px] h-48 sm:h-56 flex-shrink-0 bg-muted">
                <Image
                  src={project.image}
                  alt={project.title || ''}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="flex flex-col justify-center px-6 py-4 flex-1 transition-colors duration-300">
              {/* Title, duration, and type row */}
              <div className="flex flex-row items-center justify-between mb-1">
                <h2 className="title text-xl font-semibold line-clamp-1 group-hover:text-primary transition-colors duration-300">
                  {project.title}
                </h2>
                <div className="flex items-center ml-4 gap-2">
                  {/* Project duration at top right, vertically centered with title */}
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center">
                    {project.duration[0]}
                    {project.duration[1] && ` ~ ${project.duration[1]}`}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2 mt-3 line-clamp-4">
                {project.summary}
              </p>
              {/* Tech stack labels */}
              {Array.isArray(project.techStack) && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 mt-3">
                  {project.techStack.map((tech: string) => (
                    <span
                      key={tech}
                      className="
                        inline-block px-2.5 py-1 rounded-xl text-xs font-medium
                        bg-blue-100 text-blue-800 border border-blue-200
                        dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700
                        shadow-sm
                        transition-colors duration-300
                        group-hover:bg-blue-200 group-hover:dark:bg-blue-800
                      "
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {/* PM skill labels */}
              {Array.isArray(project.skill) && project.skill.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {project.skill.map((skill: string) => (
                    <span
                      key={skill}
                      className="
                        inline-block px-2.5 py-1 rounded-xl text-xs font-medium
                        bg-green-100 text-green-800 border border-green-200
                        dark:bg-green-900 dark:text-green-200 dark:border-green-700
                        shadow-sm
                        transition-colors duration-300
                        group-hover:bg-green-200 group-hover:dark:bg-green-800
                      "
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default Projects