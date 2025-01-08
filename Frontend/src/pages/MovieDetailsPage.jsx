import React from 'react'
import { Header } from '../components/Headers/Header'
import { Footer } from '../components/Footer/Footer'
import  MovieDetailspage  from '../components/nowshowing/MovieDetails'
function MovieDetailsPage() {
  return (
    <div>
      <Header/>
      <MovieDetailspage/>
      <Footer/>
      
    </div>
  )
}

export default MovieDetailsPage
