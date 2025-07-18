import { getContent } from '@/lib/content'
import Fragments from './fragments'

export default async function FragmentsPage() {
  const fragments = await getContent(undefined, 'fragments')
  return <Fragments fragments={fragments} />
}