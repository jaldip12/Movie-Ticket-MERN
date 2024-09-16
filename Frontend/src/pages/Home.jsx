import React from 'react'
import { Landingpage } from '@/components/component/landingpage'
import { Header } from '@/components/component/header'
import { Footer } from '@/components/component/footer'
import { NowShowing } from '@/components/component/nowshowing'
function Home() {
  return (
    <div>
    <Header/>
      <Landingpage/>
      <NowShowing/>
      <Footer/>
    </div>
  )
}

export default Home
