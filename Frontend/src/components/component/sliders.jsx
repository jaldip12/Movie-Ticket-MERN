import { useState, useEffect } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";

export function Sliders() {
  const images = [
    {
      url: "https://res.cloudinary.com/drikj5qcc/image/upload/v1724692994/i03yipvsh3jvfrf10cmt.jpg",
      alt: "Image 1",
    },
    {
      url: "https://res.cloudinary.com/drikj5qcc/image/upload/v1725286262/h6qdhd4ggmufmuzahgmt.avif",
      alt: "Image 2",
    },
    {
      url: "https://res.cloudinary.com/drikj5qcc/image/upload/v1724692994/ayxy36btxubmqnzmywlc.jpg",
      alt: "Image 3",
    },
    {
      url: "https://res.cloudinary.com/drikj5qcc/image/upload/v1725286148/tcqvexvhevpwcnh4wcwd.avif",
      alt: "Image 4",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const autoslide = true;
  const autoslideInterval = 3000;

  const handlePrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  useEffect(() => {
    if (!autoslide) return;

    const intervalId = setInterval(() => {
      handleNext();
    }, autoslideInterval);

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [autoslide, autoslideInterval, currentIndex]);

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-1200">
      <div className="container mx-auto px-4 relative">
        <div className="relative w-full overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-[700ms] ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full h-full rounded-lg overflow-hidden"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-25px" // Added rounded-lg class here
                />
              </div>
            ))}
          </div>

          {/* Previous Button */}
          <div
            className="absolute top-1/2 left-2 transform -translate-y-1/2 text-2xl rounded-full p-2 bg-black/50 text-white cursor-pointer hover:bg-black transition-colors duration-300"
            onClick={handlePrevious}
          >
            <BsChevronCompactLeft size={24} />
          </div>

          {/* Next Button */}
          <div
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-2xl rounded-full p-2 bg-black/50 text-white cursor-pointer hover:bg-black transition-colors duration-300"
            onClick={handleNext}
          >
            <BsChevronCompactRight size={24} />
          </div>
        </div>
      </div>
    </section>
  );
}
