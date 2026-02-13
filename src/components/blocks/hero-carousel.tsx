
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  backgroundUrl: string;
  date: string;
  location: string;
  time: string;
  category: string;
  price: string;
  rating: number;
  link: string;
  tags: string[];
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  autoPlayDelay?: number;
}

export const HeroCarousel = ({ slides, autoPlayDelay = 5000 }: HeroCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayDelay);

    return () => clearInterval(interval);
  }, [currentSlide, isAutoPlaying, slides.length, autoPlayDelay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Background with Enhanced Overlay */}
      <div className="absolute inset-0">
        <img
          src={currentSlideData.backgroundUrl}
          alt={currentSlideData.title}
          className="w-full h-full object-cover transition-all duration-1000 ease-in-out"
        />
        {/* Sobreposição preta com 50% de transparência */}
        <div className="absolute inset-0 bg-black/50 transition-opacity duration-1000" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Content */}
            <div className="hero-content animate-fade-in order-2 lg:order-1">
              {/* Category Tag */}
              <div className="mb-4">
                <span className="tag-event text-xs">
                  {currentSlideData.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-4 sm:mb-6 text-shadow-lg leading-tight">
                {currentSlideData.title}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 text-white/90 max-w-xl leading-relaxed">
                {currentSlideData.description}
              </p>

              {/* Event Details */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{currentSlideData.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{currentSlideData.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{currentSlideData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current text-yellow-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{currentSlideData.rating}/5</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                {currentSlideData.tags.map((tag, index) => (
                  <span key={index} className="tag-event text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to={currentSlideData.link} className="w-full sm:w-auto">
                  <Button className="btn-primary text-xs sm:text-sm lg:text-base px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto">
                    Comprar Ingressos - {currentSlideData.price}
                  </Button>
                </Link>
                <Button variant="outline" className="btn-outline text-xs sm:text-sm lg:text-base px-6 sm:px-8 py-3 sm:py-4 h-auto w-full sm:w-auto">
                  Saiba Mais
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative group w-full max-w-sm sm:max-w-md lg:max-w-lg">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <img
                  src={currentSlideData.imageUrl}
                  alt={currentSlideData.title}
                  className="relative w-full h-56 sm:h-72 md:h-80 lg:h-auto object-cover rounded-3xl shadow-2xl transform transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots - Desktop */}
      <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-20 hidden lg:flex flex-col gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Slide anterior"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Próximo slide"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-linear"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      {/* Mobile Navigation Dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex lg:hidden gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50'
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
