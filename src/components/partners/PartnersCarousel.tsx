
import { useState, useEffect } from 'react';
import { partners } from '@/data/mockData';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const PartnersCarousel = () => {
  const [api, setApi] = useState<any>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const interval = setInterval(() => {
      api.scrollNext();
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Parceiros A2 Tickets 360</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Organizações e empresas que confiam em nossa plataforma para criar experiências incríveis.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {partners.map((partner) => (
                <CarouselItem key={partner.id} className="md:basis-1/3 lg:basis-1/4">
                  <div className="p-2 h-full">
                    <div className="bg-gray-50 rounded-lg p-6 h-full flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-full h-24 flex items-center justify-center mb-4">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <h3 className="text-sm font-medium text-center">{partner.description}</h3>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;
