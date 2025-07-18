'use client'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import Image from 'next/image'
import lowPolyImage from '@/public/images/favicon/lowpoly.png'
import neonImage from '@/public/images/favicon/neon.png'

export default function Header() {
  const { theme } = useTheme()
  const headerImage = theme === 'dark' ? neonImage : lowPolyImage
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }
  
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
        
        {/* Desktop Navigation */}
        <ul className='hidden md:flex items-center gap-5 text-sm font-medium text-muted-foreground sm:gap-10'>
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

        <div className='flex items-center gap-4'>
          <ThemeToggle />
          
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className='md:hidden flex flex-col justify-center items-center w-8 h-8 p-1 rounded-md hover:bg-muted/50 transition-colors'
            aria-label='Toggle mobile menu'
          >
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
            }`}></span>
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ease-in-out my-1 ${
              isMobileMenuOpen ? 'opacity-0' : ''
            }`}></span>
            <span className={`block w-6 h-0.5 bg-foreground transition-all duration-300 ease-in-out ${
              isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className='md:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200'
            onClick={closeMobileMenu}
          />
          {/* Menu */}
          <div className='md:hidden fixed top-20 left-0 right-0 bg-white dark:bg-gray-900 z-50 shadow-lg animate-in slide-in-from-top-2 duration-300'>
            <div className='container max-w-3xl px-6 py-8'>
              <ul className='flex flex-col space-y-4'>
                <li>
                  <Link 
                    href='/posts' 
                    onClick={closeMobileMenu}
                    className='block text-base font-medium text-gray-900 dark:text-white hover:text-blue-500 transition-colors py-2 border-b border-gray-200 dark:border-gray-700'
                  >
                    Posts
                  </Link>
                </li>
                <li>
                  <Link 
                    href='/projects' 
                    onClick={closeMobileMenu}
                    className='block text-base font-medium text-gray-900 dark:text-white hover:text-blue-500 transition-colors py-2 border-b border-gray-200 dark:border-gray-700'
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link 
                    href='/fragments' 
                    onClick={closeMobileMenu}
                    className='block text-base font-medium text-gray-900 dark:text-white hover:text-blue-500 transition-colors py-2 border-b border-gray-200 dark:border-gray-700'
                  >
                    Fragments
                  </Link>
                </li>
                <li>
                  <Link 
                    href='/contact' 
                    onClick={closeMobileMenu}
                    className='block text-base font-medium text-gray-900 dark:text-white hover:text-blue-500 transition-colors py-2 border-b border-gray-200 dark:border-gray-700'
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </header>
  )
}