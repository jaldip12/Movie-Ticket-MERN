import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { useEffect, useState } from "react";

const images = [
  { url: 'https://res.cloudinary.com/drikj5qcc/image/upload/v1723209853/nzpygwhusukmvrqxhunn.jpg', alt: 'Image 1' },
  { url: 'https://res.cloudinary.com/drikj5qcc/image/upload/v1723209881/ibwnilktuit8clfa1sus.jpg', alt: 'Image 2' },
  { url: 'https://res.cloudinary.com/drikj5qcc/image/upload/v1723209883/gixijmlvgoy9becxdaju.jpg', alt: 'Image 3' },
];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  let autoslide = true;
  let autoslideInterval = 3000;

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="overflow-hidden bg-auto relative h-[600px] max-w-[1800px] group">
      <img
        src={images[currentIndex].url}
        alt={images[currentIndex].alt}
        className="w-full h-full object-cover"
      />
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <BsChevronCompactLeft onClick={handlePrevious} size={22} />
      </div>
      <div className="hidden group-hover:block absolute top-[50%] -translate-x-0 translate-y-[50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer">
        <BsChevronCompactRight onClick={handleNext} size={22} />
      </div>
    </div>
  );
};

export default ImageSlider;
