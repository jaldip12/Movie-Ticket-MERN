import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Component() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6 flex items-center justify-between">
        <Link to="/home" className="text-xl font-bold" prefetch={false}>
          MovieHub
        </Link>
        <nav className="hidden md:flex gap-4">
          <Link to="/" className="hover:underline" prefetch={false}>
            Home
          </Link>
          <Link to="/" className="hover:underline" prefetch={false}>
            Movies
          </Link>
          <Link to="/" className="hover:underline" prefetch={false}>
            Theaters
          </Link>
          <Link to="/" className="hover:underline" prefetch={false}>
            About
          </Link>
          <Link to="/" className="hover:underline" prefetch={false}>
            Contact
          </Link>
        </nav>
        <Link to="/login" className="hover:underline">
          Sign in
        </Link>
      </header>

      <main className="flex-1">
        <section className="relative h-[50vh] md:h-[70vh]">
          <img src="/placeholder.svg" alt="Hero Movie" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          {/* <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-500">Discover the Latest Movies</h1>
            <p className="text-lg md:text-xl mb-8 text-blue-500">Find the perfect movie for your next night out or stay-in experience.</p>
            <div className="w-full max-w-md">
              <form className="flex items-center bg-primary-foreground rounded-md overflow-hidden">
                <Input
                  type="text"
                  placeholder="Search movies..."
                  className="flex-1 px-4 py-2 text-foreground"
                />
                <Button type="submit" className="px-4 py-2">
                  Search
                </Button>
              </form>
            </div>
          </div> */}
        </section>

        <section className="py-12 px-4 md:px-6">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Popular Movies</h2>
              <Link to="/" className="text-primary hover:underline" prefetch={false}>
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="bg-gray-200 rounded-md h-48" />
              <div className="bg-gray-200 rounded-md h-48" />
              <div className="bg-gray-200 rounded-md h-48" />
              <div className="bg-gray-200 rounded-md h-48" />
            </div>
          </div>
        </section>

        <section className="py-12 px-4 md:px-6 bg-muted">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Trending Now</h2>
              <Link to="/" className="text-primary hover:underline" prefetch={false}>
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="bg-gray-200 rounded-md h-48" />
              <div className="bg-gray-200 rounded-md h-48" />
              <div className="bg-gray-200 rounded-md h-48" />
              <div className="bg-gray-200 rounded-md h-48" />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground py-6 px-4 md:px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm mb-4 md:mb-0">&copy; 2024 MovieHub. All rights reserved.</p>
          <nav className="flex gap-4">
            <Link to="/" className="hover:underline" prefetch={false}>
              About
            </Link>
            <Link to="/" className="hover:underline" prefetch={false}>
              Contact
            </Link>
            <Link to="/" className="hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
            <Link to="/" className="hover:underline" prefetch={false}>
              Terms of Service
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
