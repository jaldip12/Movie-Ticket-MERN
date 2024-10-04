import React from 'react'
import { Landingpage } from '../components/landingPage/Landingpage'
import { Header } from '../components/Headers/Header'
import { Footer } from '../components/Footer/Footer'
import { NowShowing } from '../components/nowshowing/NowShowing'
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
