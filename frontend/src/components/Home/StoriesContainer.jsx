import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { stories } from '../../utils/constants';

// Import all story images
const storyImages = import.meta.glob('../../assets/images/logos/*.webp', { eager: true });

const StoriesContainer = () => {

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 7.5,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1050,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 2,
        },
      },
    ],
  };

  return (
    <div className="w-full">
      <Slider {...settings} className="w-full bg-white pt-2.5 pb-1 px-2.5 flex overflow-hidden border rounded">

        {stories.map((s, i) => {
          const imagePath = `../../assets/images/logos/${s.image}.webp`;
          const image = storyImages[imagePath];
          
          return (
            <div className="flex flex-col text-center justify-center items-center p-2 cursor-pointer" key={i}>
              <div className="w-16 p-[1px] h-16 rounded-full border-2 border-red-500">
                <img 
                  loading="lazy" 
                  className="rounded-full h-full w-full border border-gray-300 object-cover" 
                  src={image?.default || 'https://via.placeholder.com/64'} 
                  draggable="false" 
                  alt={s.title} 
                />
              </div>
              <span className="text-xs">{s.title}</span>
            </div>
          );
        })}

      </Slider>
    </div>
  );
};

export default StoriesContainer;