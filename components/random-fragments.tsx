import { getRandomFragments } from "@/lib/content"
import FlexibleFragments from "./flexible-fragments"
import Link from "next/link"

export default async function RandomFragments() {
  const fragments = await getRandomFragments(8) // Get more fragments to choose from

  return (
    <section className='pb-24'>
      <div>
        <h2 className='title mb-12'>Fragments of inspiration</h2>
        
        <FlexibleFragments fragments={fragments} />

        <Link
          href='/fragments'
          className='mt-8 inline-flex items-center gap-2 text-muted-foreground underline decoration-1 underline-offset-2 transition-colors hover:text-foreground'
        >
          <span>All fragments</span>
        </Link>
      </div>
    </section>
  )
} 