import React from "react"
import Intro from "@/components/intro"
import RecentPosts from "@/components/recent-posts"
import RecentProjects from "@/components/recent-projects"
import RandomFragments from "@/components/random-fragments"

export default function Home() {

  return (
  <section className="pt-24">
    
    <div className="container max-w-3xl">
      <Intro />

      <RecentPosts />
      <RecentProjects />
      <RandomFragments />
    </div>
  </section>
  )
}