import { z } from 'zod'

export const ContactFormSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .min(2, { message: 'Must be at least 2 characters.' }),
  email: z
    .email('Invalid email.'),
  message: z.string().min(1, { message: 'Message is required.' })
})

export const NewsletterFormSchema = z.object({
  email: z.email('Invalid email.')
})