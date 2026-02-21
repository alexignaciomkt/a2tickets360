
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import EventCard from '@/components/events/EventCard';
import { eventService, Event } from '@/services/eventService';
import { Loader2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Calendar, MapPin, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EventsPage = () => {
  /* 
     UPDATED: Added useSearchParams to read category from URL.
     Added new filters state: date, artist, city.
  */
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Featured events for carousel
  const featuredEvents = allEvents.filter(e => e.isFeatured).slice(0, 5);

  // New Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Categories
  const categories = [
    { id: 'all', name: 'Todas Categorias' },
    { id: 'music', name: 'Música' },
    { id: 'business', name: 'Negócios' },
    { id: 'comedy', name: 'Comédia' },
    { id: 'theater', name: 'Teatro' },
    { id: 'workshop', name: 'Workshop' },
    { id: 'conference', name: 'Conferência' },
  ];

  useEffect(() => {
    // Sync state with URL if it changes externally or on load
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ ...Object.fromEntries(searchParams), category: categoryId });
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await eventService.getPublicEvents();
        setAllEvents(data);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Filter events when any filter changes
  useEffect(() => {
    let filtered = [...allEvents];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    // Filter by search query (Title or Description or Artist)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          (event.organizer && event.organizer.name.toLowerCase().includes(query)) // Assuming artist/organizer check
      );
    }

    // Filter by Date
    if (selectedDate) {
      filtered = filtered.filter(event => event.date === selectedDate);
    }

    // Filter by City
    if (selectedCity) {
      filtered = filtered.filter(event => event.location.city.toLowerCase().includes(selectedCity.toLowerCase()));
    }

    setFilteredEvents(filtered);
  }, [selectedCategory, searchQuery, selectedDate, selectedCity, allEvents]);

  return (
    <MainLayout>
      <div className="bg-page py-12">
        <div className="container mx-auto px-4">
          {/* Banner Carousel */}
          <div className="mb-12">
            <Carousel className="w-full">
              <CarouselContent>
                {featuredEvents.map((event) => (
                  <CarouselItem key={event.id} className="md:basis-2/3 lg:basis-3/4">
                    <div className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden">
                      <img
                        src={event.bannerUrl}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 text-white">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h2>
                        <p className="text-sm md:text-base mb-4">{event.location.city}, {new Date(event.date).toLocaleDateString('pt-BR')}</p>
                        <a href={`/events/${event.id}`} className="btn-primary inline-block w-max py-2 px-4">
                          Ver detalhes
                        </a>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          </div>

          <h1 className="text-3xl font-bold mb-8">Todos os Eventos</h1>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <Input
                  type="text"
                  placeholder="Buscar evento, artista..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border-gray-200"
                />
              </div>

              <div className="md:col-span-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cidade"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="pl-9 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="pl-9 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-gray-50 border-gray-200">
                      <span className="truncate">{categories.find(c => c.id === selectedCategory)?.name || 'Categorias'}</span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={selectedCategory === category.id ? "bg-indigo-50 text-indigo-600 font-medium" : ""}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-500 font-medium tracking-tight">Estamos encontrando os melhores eventos para você...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-50 px-6">
              <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Filter className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tighter uppercase">Nenhum evento encontrado</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                Infelizmente não encontramos nenhum evento com os filtros aplicados ({searchQuery || selectedCategory || selectedCity || 'Filtros'}). Tente buscar por outros termos ou limpar os filtros.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedCity('');
                  setSelectedDate('');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 transition-all uppercase tracking-tight"
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default EventsPage;
