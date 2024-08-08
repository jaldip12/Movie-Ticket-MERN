import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const ImageSlider = ({ children: slides, autoslide = false, autoslideInterval = 3000 }) => {
  const [curr, setCurr] = useState(0);

  const prev = () => {
    setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  };

  const next = () => {
    setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));
  };

  useEffect(() => {
    if (!autoslide) return;
    const slideInterval = setInterval(next, autoslideInterval);
    return () => clearInterval(slideInterval);
  }, [autoslide, autoslideInterval]);

  return (
    <div className="overflow-hidden relative">
      <div
        className="flex transition-transform ease-out duration-500"
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides}
      </div>
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button onClick={prev} className="p-1 rounded-full shadow bg-white text-gray-800 hover:bg-gray-300">
          <ChevronLeft />
        </button>
        <button onClick={next} className="p-1 rounded-full shadow bg-white text-gray-800 hover:bg-gray-300">
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

export default ImageSlider;
