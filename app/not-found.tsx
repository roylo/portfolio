import Link from 'next/link'
import { ArrowLeftIcon } from '@radix-ui/react-icons'

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center pb-24 pt-40 bg-background transition-colors">
      <div className="relative mb-8">
        {/* UFO illustration with theme-aware colors */}
        <svg
          width="120"
          height="60"
          viewBox="0 0 120 60"
          fill="none"
          className="mx-auto animate-bounce"
        >
          {/* Shadow */}
          <ellipse
            cx="60"
            cy="48"
            rx="44"
            ry="8"
            className="fill-gray-200 dark:fill-gray-800"
          />
          {/* Main body */}
          <ellipse
            cx="60"
            cy="32"
            rx="36"
            ry="14"
            className="fill-indigo-200 dark:fill-indigo-900"
          />
          {/* Dome */}
          <ellipse
            cx="60"
            cy="25"
            rx="16"
            ry="7"
            className="fill-indigo-400 dark:fill-indigo-600"
          />
          {/* Lights */}
          <circle cx="40" cy="32" r="3" className="fill-yellow-300 dark:fill-yellow-500" />
          <circle cx="60" cy="38" r="3" className="fill-yellow-300 dark:fill-yellow-500" />
          <circle cx="80" cy="32" r="3" className="fill-yellow-300 dark:fill-yellow-500" />
        </svg>
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-2">
        404: Page Not Found
      </h1>
      <p className="text-base sm:text-lg text-muted-foreground mb-8 text-center max-w-xl">
        Looks like you’ve wandered off the map.<br className="hidden sm:inline" />
        The page you’re seeking isn’t here—maybe it’s hiding in another galaxy.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-muted-foreground transition-colors hover:text-foreground hover:border-foreground"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Return Home</span>
      </Link>
      <span className="mt-4 text-xs text-muted-foreground">
        (Or try searching again. Even UFOs get lost sometimes.)
      </span>
    </section>
  )
}