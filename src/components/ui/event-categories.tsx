
import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { 
  Music, Briefcase, Mic, BookOpen, Users, Coffee, 
  Camera, PenTool, Gift, Utensils, Gamepad2, Ticket 
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { name: "Música", icon: Music, link: "/events?category=music" },
  { name: "Negócios", icon: Briefcase, link: "/events?category=business" },
  { name: "Comédia", icon: Mic, link: "/events?category=comedy" },
  { name: "Educação", icon: BookOpen, link: "/events?category=education" },
  { name: "Networking", icon: Users, link: "/events?category=networking" },
  { name: "Café", icon: Coffee, link: "/events?category=coffee" },
  { name: "Fotografia", icon: Camera, link: "/events?category=photography" },
  { name: "Arte", icon: PenTool, link: "/events?category=art" },
  { name: "Feiras", icon: Gift, link: "/events?category=fairs" },
  { name: "Gastronomia", icon: Utensils, link: "/events?category=food" },
  { name: "Jogos", icon: Gamepad2, link: "/events?category=games" },
  { name: "Shows", icon: Ticket, link: "/events?category=shows" },
];

export function EventCategories() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0);
        api.scrollTo(0);
      } else {
        api.scrollNext();
        setCurrent(current + 1);
      }
    }, 3000);
  }, [api, current]);

  return (
    <div className="w-full py-12 bg-page">
      <div className="container mx-auto">
        <div className="flex flex-col gap-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">
            Descubra eventos por categoria
          </h2>
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {categories.map((category, index) => (
                <CarouselItem className="basis-1/3 md:basis-1/4 lg:basis-1/6" key={index}>
                  <Link to={category.link}>
                    <div className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="bg-primary/10 p-4 rounded-full mb-3">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}
