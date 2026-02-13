
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  ShoppingBag,
  Star,
  Plus,
  Camera,
  ThumbsUp,
  MoreHorizontal,
  Info,
  Globe,
  Briefcase,
  Ticket as TicketIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { events as mockEvents, Photo } from '@/data/mockData';
import { Producer, Post } from '@/interfaces/a2types';

const ProducerFanPage = () => {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('timeline');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(2547);
  const [hasLiked, setHasLiked] = useState(false);

  // Mock producer data
  const producer: Producer = {
    id: '1',
    name: 'Bomba Produções',
    slug: slug || 'bombaproducoes',
    description: 'Transformando noites em memórias inesquecíveis através da música e arte. Especializada em produção de eventos musicais e culturais de alto nível.',
    location: 'São José dos Campos, SP',
    phone: '(12) 99999-9999',
    email: 'contato@bombaproducoes.com.br',
    website: 'www.bombaproducoes.com.br',
    coverImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=400&fit=crop',
    profileImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop',
    verified: true,
    followers: 2547,
    following: false,
    category: 'Organização de eventos'
  };

  const posts: Post[] = [
    {
      id: '1',
      producerId: '1',
      content: '🎵 Ansiosos para o Festival de Verão? 🌴🌊 Os últimos ingressos do lote 1 estão voando! Não fique de fora da melhor festa do ano.',
      imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      likes: 1284,
      comments: 45,
      shares: 12,
      createdAt: '2 horas atrás'
    },
    {
      id: '2',
      producerId: '1',
      content: '✨ Backstage do último evento! Veja como foi incrível a produção do Show Acústico Intimista. Obrigado a todos que estiveram presentes!',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
      likes: 189,
      comments: 28,
      shares: 8,
      createdAt: '1 dia atrás'
    }
  ];

  const producerEvents = mockEvents.filter(e => e.organizer.id === '1');

  const products = [
    {
      id: '1',
      name: 'Camiseta Festival 2025',
      price: 49.90,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      rating: 4.8,
      reviews: 67
    },
    {
      id: '2',
      name: 'Caneca Personalizada',
      price: 29.90,
      image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=300&fit=crop',
      rating: 4.9,
      reviews: 43
    }
  ];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  const handleLike = () => {
    setHasLiked(!hasLiked);
  };

  return (
    <div className="bg-[#F0F2F5] min-h-screen">
      {/* Cover & Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4">
          {/* Cover Photo */}
          <div className="relative h-[250px] md:h-[350px] rounded-b-xl overflow-hidden shadow-inner group">
            <img src={producer.coverImage} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all"></div>
            <div className="absolute bottom-4 right-4">
              <button className="bg-white/90 hover:bg-white backdrop-blur text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow flex items-center gap-2 transition-all">
                <Camera className="w-4 h-4" /> Editar Capa
              </button>
            </div>
          </div>

          {/* Profile Header Info */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-20 pb-6 border-b px-8">
            <div className="relative">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
                <img src={producer.profileImage} className="w-full h-full object-cover" alt="Profile" />
              </div>
              <button className="absolute bottom-4 right-2 bg-gray-200 p-2 rounded-full border border-white shadow-sm hover:bg-gray-300 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-extrabold text-gray-900">{producer.name}</h1>
                {producer.verified && (
                  <div className="w-6 h-6 bg-[#1877F2] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-500 font-semibold mb-2">{followersCount.toLocaleString()} seguidores • 12 seguindo</p>
              <div className="flex justify-center md:justify-start -space-x-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/40?u=${i + 10}`} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" />
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                  +120
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleFollow}
                className={isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-[#1877F2] text-white hover:bg-[#1567d3]'}
              >
                <TicketIcon className="w-4 h-4 mr-2" />
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </Button>
              <Button variant="outline" className="bg-gray-200 hover:bg-gray-300 border-none font-bold">
                <MessageCircle className="w-4 h-4 mr-2" /> Mensagem
              </Button>
              <Link to={`/producer/${slug}/careers`}>
                <Button className="bg-green-600 hover:bg-green-700 text-white font-bold border-none shadow-sm">
                  <Briefcase className="w-4 h-4 mr-2" /> Trabalhe Conosco
                </Button>
              </Link>
            </div>
          </div>

          {/* Facebook-style Nav Tabs */}
          <nav className="flex gap-1 py-1 overflow-x-auto no-scrollbar">
            {['Publicações', 'Sobre', 'Eventos', 'Loja', 'Fotos', 'Vídeos'].map(tab => {
              const tabId = tab === 'Publicações' ? 'timeline' :
                tab === 'Sobre' ? 'about' :
                  tab === 'Eventos' ? 'events' :
                    tab === 'Loja' ? 'store' :
                      tab === 'Fotos' ? 'photos' : 'videos';
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tabId)}
                  className={`px-4 py-4 font-bold transition whitespace-nowrap border-b-4 ${activeTab === tabId ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left Sidebar (Static elements like Facebook) */}
        <div className="md:col-span-5 lg:col-span-4 space-y-6">
          <Card className="rounded-xl shadow-sm border-none">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-extrabold text-xl">Apresentação</h3>
              <p className="text-sm text-center text-gray-700 leading-relaxed">{producer.description}</p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Info className="w-5 h-5 text-gray-400" />
                  <span>Página • {producer.category}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{producer.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span className="text-blue-600 hover:underline cursor-pointer">{producer.website}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full font-bold bg-gray-100 hover:bg-gray-200 border-none transition-all">Editar Bio</Button>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-none overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xl">Fotos</h3>
                <button onClick={() => setActiveTab('photos')} className="text-blue-600 text-sm hover:underline font-medium">Ver todas</button>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/prod${i}/200`} className="aspect-square object-cover hover:opacity-90 cursor-pointer transition-opacity" alt="Gallery" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center/Right Feed Area */}
        <div className="md:col-span-7 lg:col-span-8 space-y-6">

          {activeTab === 'timeline' && (
            <>
              {/* Create Post Widget */}
              <Card className="rounded-xl shadow-sm border-none">
                <CardContent className="p-4 flex gap-3">
                  <img src={producer.profileImage} className="w-10 h-10 rounded-full shadow-sm" alt="Profile" />
                  <div className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center px-4 text-gray-500 cursor-pointer transition-colors">
                    No que você está pensando, {producer.name.split(' ')[0]}?
                  </div>
                </CardContent>
              </Card>

              {/* Feed Posts */}
              {posts.map(post => (
                <Card key={post.id} className="rounded-xl shadow-sm border-none overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex gap-3">
                      <img src={producer.profileImage} className="w-10 h-10 rounded-full border border-gray-100 shadow-sm" alt="Profile" />
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-bold text-sm hover:underline cursor-pointer">{producer.name}</h4>
                          {producer.verified && <div className="w-3 h-3 bg-[#1877F2] rounded-full flex items-center justify-center"><svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                        </div>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {post.createdAt} • <Globe className="w-3 h-3" />
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                      <MoreHorizontal className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="px-4 pb-4 text-sm text-gray-800 leading-relaxed">
                    {post.content}
                  </div>

                  {post.imageUrl && (
                    <div className="relative aspect-video overflow-hidden">
                      <img src={post.imageUrl} className="w-full h-full object-cover" alt="Post" />
                    </div>
                  )}

                  {/* Like/Comment Summary */}
                  <div className="p-4 border-b mx-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1">
                        <div className="w-5 h-5 bg-[#1877F2] rounded-full flex items-center justify-center text-white border border-white shadow-sm">
                          <ThumbsUp className="w-3 h-3 fill-current" />
                        </div>
                        <div className="w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white border border-white shadow-sm">
                          <Heart className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                      <span className="hover:underline cursor-pointer ml-1">{post.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="hover:underline cursor-pointer">{post.comments} comentários</span>
                      <span className="hover:underline cursor-pointer">{post.shares} compartilhamentos</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-1 flex items-center justify-around">
                    <button
                      onClick={handleLike}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg font-bold transition-all ${hasLiked ? 'text-[#1877F2]' : 'text-gray-500'}`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} /> Curtir
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-500 font-bold transition-all">
                      <MessageCircle className="w-5 h-5" /> Comentar
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-500 font-bold transition-all">
                      <Share2 className="w-5 h-5" /> Compartilhar
                    </button>
                  </div>
                </Card>
              ))}
            </>
          )}

          {activeTab === 'events' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {producerEvents.map(event => (
                <Card key={event.id} className="overflow-hidden shadow-sm border-none group cursor-pointer">
                  <div className="relative h-40">
                    <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <Badge className="absolute top-2 right-2 bg-green-500 border-none">Vendas Abertas</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-extrabold text-lg mb-2 group-hover:text-[#1877F2] transition-colors">{event.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#1877F2]" />
                        <span className="font-semibold">{new Date(event.date).toLocaleDateString('pt-BR')} às {event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-pink-500" />
                        <span>{typeof event.location === 'string' ? event.location : event.location.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">A partir de</p>
                        <p className="text-xl font-black text-[#1877F2]">R$ {event.tickets[0]?.price.toFixed(2)}</p>
                      </div>
                      <Link to={`/events/${event.id}`}>
                        <Button className="bg-[#1877F2] hover:bg-[#1567d3] font-bold">Comprar</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'store' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Card key={product.id} className="overflow-hidden shadow-sm border-none group hover:shadow-md transition-all">
                  <div className="relative aspect-square">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" className="bg-white text-black hover:bg-gray-100 font-bold">Ver Detalhes</Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-1 truncate">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-black text-lg text-green-600">R$ {product.price.toFixed(2)}</span>
                      <Button size="sm" variant="outline" className="font-bold border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white">
                        <ShoppingBag className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'photos' && (
            <Card className="rounded-xl shadow-sm border-none p-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group relative">
                    <img
                      src={`https://picsum.photos/seed/a2p${i}/500`}
                      alt={`Gallery Item ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-4 text-white">
                        <span className="flex items-center gap-1 font-bold"><Heart className="w-4 h-4 fill-current" /> 12</span>
                        <span className="flex items-center gap-1 font-bold"><MessageCircle className="w-4 h-4 fill-current" /> 4</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === 'about' && (
            <Card className="rounded-xl shadow-sm border-none">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-black text-gray-900 border-b pb-4">Sobre {producer.name}</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-2">Descrição</h4>
                    <p className="text-gray-700 leading-relaxed font-medium">{producer.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Informações de Contato</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-blue-50 text-[#1877F2] rounded-lg"><Phone className="w-4 h-4" /></div>
                          <span className="font-bold">{producer.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-pink-50 text-pink-500 rounded-lg"><Mail className="w-4 h-4" /></div>
                          <span className="font-bold">{producer.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Globe className="w-4 h-4" /></div>
                          <span className="font-bold">{producer.website}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest">Transparência da Página</h4>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-gray-50 rounded-lg"><Calendar className="w-4 h-4" /></div>
                        <span className="font-medium text-gray-600">Página criada em Janeiro de 2024</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProducerFanPage;
