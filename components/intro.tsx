import Image from 'next/image'
import authorImage from '@/public/images/authors/Roy.jpg'

export default function Intro() {
  return (
    <section className='flex flex-col items-start gap-x-10 gap-y-4 pb-24 md:flex-row md:items-center'>
      <div className='relative self-start sm:mt-2'>
        <Image
          className='flex-1 rounded-lg'
          src={authorImage}
          alt='Roy Lo'
          width={175}
          height={175}
          priority
        />
      </div>
      <div className='mt-2 flex-1 md:mt-0'>
        <h1 className='title no-underline'>Hi, I'm Roy Lo.</h1>
        <p className='mt-3 font-light text-muted-foreground'>
          I'm a product leader, former startup founder, and hands-on software engineer.
          <br /> <br />
          In 2016, I bootstrapped a SaaS business focused on messaging marketing automation, 
          which grew to serve hundreds of enterprise clients and was acquired by <a href="https://www.appier.com/en/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Appier (4180.T)</a> in 2021.
          <br /> <br />
          My journey spans web development at Yahoo!, iOS engineering at two early-stage startups, 
          founding and scaling BotBonnie, and leading cross-functional product teams at Appier. 
          <br /> <br />
          I recently earned a master's in management from Stanford Graduate School of Business.
          <br /> <br />
          At every stage, I've deepened my curiosity, sharpened my problem-solving, 
          and built the instincts to thrive in fast-moving, cross-disciplinary environments.
        </p>
      </div>
    </section>
  )
}