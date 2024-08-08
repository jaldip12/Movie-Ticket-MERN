import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ImageSlider from "./slider/slider";
export function Landingpage() {
  const slides = [
    "https://res.cloudinary.com/drikj5qcc/image/upload/v1709210144/cld-sample-2.jpg",
    "https://res.cloudinary.com/drikj5qcc/image/upload/v1709210104/sample.jpg",
    "https://res.cloudinary.com/drikj5qcc/image/upload/v1709210145/cld-sample-3.jpg",
    "https://res.cloudinary.com/drikj5qcc/image/upload/v1709210146/cld-sample-5.jpg",
  ];

  return (
    <div className="flex flex-col max-w-screen">
      <header className="bg-muted py-4 px-4 md:px-6">
        <div className="container flex items-center justify-between">
          <Link to="/" className="flex items-center" prefetch={false}>
            <FilmIcon className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Cinescape</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Home
            </Link>
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Showtimes
            </Link>
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Experiences
            </Link>
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Contact
            </Link>
          </nav>
          <Button>Book Tickets</Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative h-[80vh] bg-[url('/hero-bg.jpg')] bg-cover bg-center">
          <div className="absolute inset-0 border-4 h-[100px]">

            <ImageSlider autoslide={true}>{slides.map((s)=>(<img src={s}/>))} </ImageSlider>
          </div>
          {/* <div className="container h-full flex items-center justify-center">
            <div className="text-center text-white space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold">
                Elevate Your Movie Experience
              </h1>
              <p className="text-lg md:text-xl text-red-700">
                Discover the ultimate in private movie theater luxury.
              </p>
              <Button className="text-blue-600">Book Tickets</Button>
            </div>
          </div> */}
        </section>
        <section className="py-12 md:py-24 bg-muted">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <PopcornIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">
                  Gourmet Concessions
                </h3>
                <p className="text-muted-foreground">
                  Indulge in our selection of premium snacks and beverages to
                  elevate your movie-going experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <TvIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">High-End A/V</h3>
                <p className="text-muted-foreground">
                  Enjoy breathtaking visuals and immersive sound in our
                  state-of-the-art private screening rooms.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <SofaIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Luxury Seating</h3>
                <p className="text-muted-foreground">
                  Sink into our plush, comfortable seating and enjoy the
                  ultimate in movie-watching bliss.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  Upcoming Showtimes
                </h2>
                <p className="text-muted-foreground">
                  Check out our latest movie offerings and book your tickets
                  today.
                </p>
              </div>
              <Link
                href="#"
                className="inline-flex items-center text-primary hover:underline"
                prefetch={false}
              >
                View All Showtimes
                <ChevronRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <img
                  src=""
                  width={400}
                  height={600}
                  alt="Movie Poster"
                  className="rounded-t-lg object-cover"
                  style={{ aspectRatio: "400/600", objectFit: "cover" }}
                />
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Raayan</h3>
                  <p className="text-muted-foreground mb-4">
                    Showtimes: 7:00 PM, 9:30 PM
                  </p>
                  <Button>Book Tickets</Button>
                </CardContent>
              </Card>
              <Card>
                <img
                  src=""
                  width={400}
                  height={600}
                  alt="Movie Poster"
                  className="rounded-t-lg object-cover"
                  style={{ aspectRatio: "400/600", objectFit: "cover" }}
                />
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Kalki 2898 AD</h3>
                  <p className="text-muted-foreground mb-4">
                    Showtimes: 6:30 PM, 9:00 PM
                  </p>
                  <Button>Book Tickets</Button>
                </CardContent>
              </Card>
              <Card>
                <img
                  src=""
                  width={400}
                  height={600}
                  alt="Movie Poster"
                  className="rounded-t-lg object-cover"
                  style={{ aspectRatio: "400/600", objectFit: "cover" }}
                />
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">Deadpool</h3>
                  <p className="text-muted-foreground mb-4">
                    Showtimes: 8:00 PM
                  </p>
                  <Button>Book Tickets</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted py-6 px-4 md:px-6">
        <div className="container flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center">
            <FilmIcon className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Cinescape</span>
          </div>
          <nav className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Privacy Policy
            </Link>
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Terms of Service
            </Link>
            <Link
              to="/"
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function ChevronRightIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function FilmIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M7 3v18" />
      <path d="M3 7.5h4" />
      <path d="M3 12h18" />
      <path d="M3 16.5h4" />
      <path d="M17 3v18" />
      <path d="M17 7.5h4" />
      <path d="M17 16.5h4" />
    </svg>
  );
}

function PopcornIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a2 2 0 0 0 0-4 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0-4 0 2 2 0 0 0 0 4" />
      <path d="M10 22 9 8" />
      <path d="m14 22 1-14" />
      <path d="M20 8c.5 0 .9.4.8 1l-2.6 12c-.1.5-.7 1-1.2 1H7c-.6 0-1.1-.4-1.2-1L3.2 9c-.1-.6.3-1 .8-1Z" />
    </svg>
  );
}

function SofaIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
      <path d="M12 4v9" />
    </svg>
  );
}

function TvIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  );
}
