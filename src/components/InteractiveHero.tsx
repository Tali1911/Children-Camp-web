import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowDown } from 'lucide-react';
import campingImage from '@/assets/camping.jpg';
import schoolsImage from '@/assets/schools.jpg';
import adventureImage from '@/assets/adventure.jpg';
import birthdayImage from '@/assets/birthday.jpg';
import dailyActivitiesImage from '@/assets/daily-activities.jpg';

const slides = [
  {
    id: 1,
    title: "Mountain Biking",
    subtitle: "Experience the thrill of mountain biking through scenic trails. Navigate challenging terrains, build endurance, and discover the joy of cycling in nature.",
    description: "Exhilarating", 
    image: adventureImage,
    buttonText: "Book Now",
    badge: "Outdoor Adventure"
  },
  {
    id: 2,
    title: "Orienteering",
    subtitle: "Master the art of navigation while exploring the great outdoors. Learn map reading, compass skills, and strategic thinking through exciting orienteering challenges.",
    description: "Challenging",
    image: schoolsImage,
    buttonText: "Learn More",
    badge: "Navigation Skills"
  },
  {
    id: 3,
    title: "Obstacle Course",
    subtitle: "Test your strength, agility, and determination on our exciting obstacle courses. Build confidence, teamwork, and resilience through fun physical challenges.",
    description: "Thrilling",
    image: campingImage,
    buttonText: "Take the Challenge",
    badge: "Physical Adventure"
  },
  {
    id: 4,
    title: "Little Explorer",
    subtitle: "Nurturing sensory exploration and early development for children aged three and below. Gentle outdoor experiences designed for our youngest adventurers.",
    description: "Nurturing",
    image: birthdayImage,
    buttonText: "Explore Program",
    badge: "Ages 0-3",
    link: "/programs/little-forest"
  },
  {
    id: 5,
    title: "Daily Activities",
    subtitle: "Join Amuse Kenya at Karura Forest, Sigiria Ridge (Gate F) Monday to Sunday from 8:00 AM to 5:00 PM for a full range of forest activities for your children to enjoy.",
    description: "Engaging",
    image: dailyActivitiesImage,
    buttonText: "Join Today",
    badge: "Every Day"
  }
];

const InteractiveHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransitioning, isPaused]);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsPaused(true);
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => {
      setIsTransitioning(false);
      setTimeout(() => setIsPaused(false), 3000); // Resume auto-advance after 3 seconds
    }, 600);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsPaused(true);
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => {
      setIsTransitioning(false);
      setTimeout(() => setIsPaused(false), 3000); // Resume auto-advance after 3 seconds
    }, 600);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsPaused(true);
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => {
      setIsTransitioning(false);
      setTimeout(() => setIsPaused(false), 3000); // Resume auto-advance after 3 seconds
    }, 600);
  };

  const handleRegisterClick = () => {
    if (current.link) {
      window.location.href = current.link;
    } else {
      const contactSection = document.getElementById('contact');
      contactSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const current = slides[currentSlide];

  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      {/* Background Images */}
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className="absolute inset-0 w-full h-full"
        >
          <img 
            src={slide.image}
            alt={`${slide.title} background`}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 ease-in-out",
              index === currentSlide && isLoaded 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-105"
            )}
            loading={index === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
      ))}

      {/* Main Content */}
      <div className="relative h-full w-full flex items-center justify-between px-4 lg:px-12">
        {/* Left Content Area */}
        <div className="flex-1 max-w-2xl">
          <div className={cn(
            "transition-all duration-500 ease-in-out transform",
            isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}>
            <span className="inline-block text-white bg-forest-500/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wider mb-6">
              {current.badge}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              {current.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md leading-relaxed">
              {current.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleRegisterClick}
                className="bg-forest-500 hover:bg-forest-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {current.buttonText}
              </button>
              <a 
                href="#programs" 
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                View All Programs
              </a>
            </div>
          </div>
        </div>

        {/* Right Preview Cards - Centered Rotating Carousel */}
        <div className="hidden lg:block ml-8 relative h-96 w-72">
          {slides.map((slide, index) => {
            // Calculate position relative to current slide
            let position = index - currentSlide;
            if (position < -2) position += slides.length;
            if (position > 2) position -= slides.length;
            
            // Don't render slides that are too far from center
            if (Math.abs(position) > 2) return null;
            
            const isCenter = position === 0;
            const translateY = position * 80; // 80px spacing between slides
            const scale = isCenter ? 1 : 0.8;
            const opacity = isCenter ? 1 : Math.max(0.3, 1 - Math.abs(position) * 0.3);
            const zIndex = isCenter ? 20 : 10 - Math.abs(position);
            
            return (
              <div 
                key={slide.id}
                onClick={() => goToSlide(index)}
                className="absolute left-1/2 top-1/2 cursor-pointer transition-all duration-700 ease-out"
                style={{
                  transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`,
                  opacity,
                  zIndex
                }}
              >
                <div className={cn(
                  "relative w-72 h-40 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300",
                  isCenter 
                    ? "ring-4 ring-white/50 shadow-2xl hover:scale-105" 
                    : "hover:scale-95"
                )}>
                  <img 
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg mb-1">{slide.title}</h3>
                    <p className="text-white/80 text-sm">{slide.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        disabled={isTransitioning}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button 
        onClick={nextSlide}
        disabled={isTransitioning}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10"
      >
        <ChevronRight size={24} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === currentSlide 
                ? "bg-white shadow-lg" 
                : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <a 
          href="#about" 
          className="flex flex-col items-center text-white/80 hover:text-white transition-colors duration-300"
        >
          <span className="text-sm mb-2">Scroll Down</span>
          <ArrowDown size={20} />
        </a>
      </div>
    </section>
  );
};

export default InteractiveHero;