import { getContent } from '@/lib/content'
import Fragments from '@/components/fragments'

export default async function FragmentsPage() {
  const fragments = await getContent(undefined, 'fragments')

  return (
    <section className="pb-24 pt-30">
      <div
        className="
          container
          mx-auto
          max-w-4xl
          space-y-2
          columns-1
          sm:columns-2
          md:columns-3
          lg:columns-4
          gap-4
        "
      >
        <Fragments fragments={fragments} />
      </div>
    </section>
  )
}