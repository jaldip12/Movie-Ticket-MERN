import React from 'react'
import { Landingpage } from '../components/landingPage/landingpage'
import { Header } from '../components/Headers/header'
import { Footer } from '../components/Footer/footer'
import { NowShowing } from '../components/nowshowing/nowshowing'
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
