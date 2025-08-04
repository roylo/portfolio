# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` (uses Next.js with Turbopack for faster builds)
- **Build**: `npm run build`
- **Start production**: `npm start`
- **Lint**: `npm run lint`

Note: This project uses pnpm as the package manager (pnpm-lock.yaml present). Use `pnpm` commands when installing dependencies.

## Project Architecture

This is a Next.js 15 portfolio website using the App Router with React 19. The architecture follows these key patterns:

### Content Management System
- **Content Location**: All content is stored in the `/content` directory as Markdown files with frontmatter
- **Content Types**: Three main content types managed via `/lib/content.ts`:
  - Posts (`/content/posts/`) - Blog posts with metadata like title, summary, image, author, publishedAt
  - Projects (`/content/projects/`) - Project showcases with additional fields like url, skill, techStack, duration, gallery
  - Fragments (`/content/fragments/`) - Visual fragments/artwork with image, location metadata
- **Content Processing**: Uses `gray-matter` to parse frontmatter and `next-mdx-remote-client` for MDX rendering

### Styling & UI
- **CSS Framework**: Tailwind CSS v4 with custom design system
- **Theme**: Dark/light mode support via `next-themes` with system preference detection
- **UI Components**: Custom component library in `/components/ui/` using Radix UI primitives
- **Design Tokens**: CSS variables for colors, spacing, and typography defined in the Tailwind config

### Key Application Features
- **Email Contact Form**: Server action in `/lib/actions.ts` using Resend API for email delivery
- **Search**: Posts with search functionality via `/components/posts-with-search.tsx`
- **Random Fragments**: Dynamic fragment display using Fisher-Yates shuffle algorithm
- **Image Optimization**: Next.js Image component for all media assets in `/public/images/`

### File Structure Patterns
- **App Directory**: Next.js App Router structure with `page.tsx`, `layout.tsx`, and `not-found.tsx`
- **Dynamic Routes**: `[slug]` directories for dynamic content pages (posts, projects)
- **Components**: Organized by feature with clear separation between UI components and page-specific components
- **Server Actions**: Located in `/lib/actions.ts` for server-side operations

### Environment Requirements
- **Required Environment Variables**: 
  - `RESEND_API_KEY` for email functionality
- **Fonts**: Inter (sans-serif) and Playfair Display (serif) from Google Fonts

When working with content, always use the helper functions from `/lib/content.ts`. When adding new features, follow the existing patterns for component organization and styling consistency.