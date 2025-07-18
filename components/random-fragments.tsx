import { getRandomFragments } from "@/lib/content"
import Fragments from "@/components/fragments"
import Link from "next/link"

export default async function RandomFragments() {
  const fragments = await getRandomFragments(3)

  return (
    <section className='pb-24'>
      <div>
        <h2 className='title mb-12'>Fragments of inspiration</h2>
        <div className="space-y-2 columns-1 sm:columns-2 md:columns-3 gap-4">
          <Fragments fragments={fragments} />
        </div>
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