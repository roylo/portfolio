'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'
import lowPolyImage from '@/public/images/favicon/lowpoly.png'
import neonImage from '@/public/images/favicon/neon.png'

export default function Header() {
  const { theme } = useTheme()
  const headerImage = theme === 'dark' ? neonImage : lowPolyImage
  
  return (
    <header className='fixed inset-x-0 top-0 z-50 bg-background/75 py-6 backdrop-blur-sm'>
      <nav className='container max-w-3xl flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Image
              className='flex-1 rounded-xs'
              src={headerImage}
              alt='Roy Lo'
              width={40}
              height={40}
              priority
          />
          <Link href='/' className='font-serif text-2xl font-bold hover:text-blue-500'>
            RL
          </Link>
        </div>
        <ul className='flex items-center gap-5 text-sm font-medium text-muted-foreground sm:gap-10'>
          <li className='transition-colors hover:text-blue-500 hover:underline'>
            <Link href='/posts'>Posts</Link>
          </li>
          <li className='transition-colors hover:text-blue-500 hover:underline'>
            <Link href='/projects'>Projects</Link>
          </li>
          <li className='transition-colors hover:text-blue-500 hover:underline'>
            <Link href='/fragments'>Fragments</Link>
          </li>
          <li className='transition-colors hover:text-blue-500 hover:underline'>
            <Link href='/contact'>Contact</Link>
          </li>
        </ul>

        <div>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}