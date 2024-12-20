import { useState, useEffect, useCallback } from "react";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";

export function Sliders() {
  const images = [
    {
      url: "https://res.cloudinary.com/drikj5qcc/image/upload/v1727971425/devra.avif",
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
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const autoslideInterval = 5000;

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isAutoSliding) return;

    const intervalId = setInterval(handleNext, autoslideInterval);

    return () => clearInterval(intervalId);
  }, [isAutoSliding, handleNext, autoslideInterval]);

  const handleMouseEnter = () => setIsAutoSliding(false);
  const handleMouseLeave = () => setIsAutoSliding(true);

  return (
    <section className="w-full bg-blue-1200 flex justify-center items-center">
      <div className="container mx-auto px-4 relative flex justify-center">
        <div 
          className="relative overflow-hidden rounded-xl shadow-xl"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ width: '1020px', height: '240px' }}
        >
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full h-full"
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-xl"
                  loading="lazy"
                  style={{ width: '1020px', height: '240px' }}
                />
              </div>
            ))}
          </div>

          <button
            className="absolute top-1/2 left-2 transform -translate-y-1/2 text-2xl rounded-full p-2 bg-black/50 text-white cursor-pointer hover:bg-black transition-colors duration-300"
            onClick={handlePrevious}
            aria-label="Previous image"
          >
            <BsChevronCompactLeft size={24} />
          </button>

          <button
            className="absolute top-1/2 right-2 transform -translate-y-1/2 text-2xl rounded-full p-2 bg-black/50 text-white cursor-pointer hover:bg-black transition-colors duration-300"
            onClick={handleNext}
            aria-label="Next image"
          >
            <BsChevronCompactRight size={24} />
          </button>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  currentIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
