
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Globe,
  ShoppingBag,
  Star,
  Camera,
  Info,
  Calendar,
  Ticket as TicketIcon,
  Instagram,
  Facebook,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { organizerService } from '@/services/organizerService';
import { Skeleton } from '@/components/ui/skeleton';

const ProducerFanPage = () => {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('timeline');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(Math.floor(Math.random() * 5000) + 1000);
  const { toast } = useToast();

  const [producerData, setProducerData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [producerEvents, setProducerEvents] = useState<any[]>([]);
  const [producerProducts, setProducerProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadProducer();
    }
  }, [slug]);

  const loadProducer = async () => {
    try {
      setLoading(true);
      const data = await organizerService.getProducerBySlug(slug!);
      setProducerData(data);

      if (data?.user_id) {
        const [postsData, eventsData, productsData] = await Promise.all([
          organizerService.getPosts(data.user_id),
          organizerService.getEvents(data.user_id),
          organizerService.getProducts(data.user_id)
        ]);
        setPosts(postsData);
        setProducerEvents(eventsData.filter((e: any) => e.status === 'published' || e.status === 'active'));
        setProducerProducts(productsData.filter((p: any) => p.status === 'active'));
      }
    } catch (err) {
      console.error('Erro ao carregar produtor:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] space-y-4 pb-20">
        <Skeleton className="h-[350px] w-full" />
        <div className="max-w-5xl mx-auto px-4">
           <div className="flex gap-6 -mt-16">
              <Skeleton className="h-40 w-40 rounded-full border-4 border-white" />
              <div className="mt-20 space-y-2">
                 <Skeleton className="h-10 w-64" />
                 <Skeleton className="h-4 w-40" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (!producerData) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-10 text-center space-y-6 shadow-2xl border-none rounded-3xl">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Página não encontrada</h2>
            <p className="text-gray-500 font-medium mt-2">O produtor que você procura ainda não configurou sua vitrine ou a URL está incorreta.</p>
          </div>
          <Button variant="default" className="w-full font-black uppercase tracking-widest" asChild>
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const producer = {
    name: producerData.company_name || producerData.name || "Produtor sem Nome",
    bio: producerData.bio || "Este produtor ainda não adicionou uma biografia.",
    avatar: producerData.logo_url || producerData.avatar || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
    banner: producerData.banner_url || producerData.banner || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=400&fit=crop",
    location: producerData.city ? `${producerData.city}, ${producerData.state || ''}` : 'Brasil',
    instagram: producerData.instagram_url,
    facebook: producerData.facebook_url,
    whatsapp: producerData.whatsapp_number,
    website: producerData.website_url,
    category: producerData.category || "Entretenimento",
    slug: slug
  };

  const handleSocialShare = (platform: string, post?: any) => {
    const url = post ? `${window.location.origin}/events/${post.id}` : window.location.href;
    const text = post ? `Olha esse post de ${producer.name}!` : `Confira a vitrine oficial de ${producer.name} na Ticketera!`;
    
    switch(platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast({ title: 'Copiado!', description: 'Link copiado para a área de transferência.' });
        break;
    }
  };

  const nextEvent = producerEvents.length > 0 ? producerEvents[0] : null;

  return (
    <div className="bg-[#F0F2F5] min-h-screen font-sans">
      {/* HEADER SECTION (Facebook Style) */}
      <div className="bg-white shadow-sm">
        <div className="max-w-[1100px] mx-auto">
          {/* Banner */}
          <div className="relative h-[250px] md:h-[400px] rounded-b-xl overflow-hidden group">
            <img 
              src={producerData?.banner_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"} 
              className="w-full h-full object-cover" 
              alt="Cover" 
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all duration-500"></div>
            
            <div className="absolute bottom-4 right-4">
               <Button variant="secondary" size="sm" className="bg-white/90 backdrop-blur font-black uppercase text-[10px] tracking-widest gap-2 shadow-xl">
                 <Camera className="w-3 h-3" /> Ver Capa
               </Button>
            </div>
          </div>

          {/* Profile Info Overlay */}
          <div className="px-4 md:px-10 pb-4">
            <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 md:-mt-16 mb-4">
              <div className="relative group">
                <div className="w-40 h-40 md:w-44 md:h-44 rounded-full border-4 border-white bg-white overflow-hidden shadow-2xl">
                  <img 
                  src={producerData?.logo_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                  className="w-full h-full object-cover" 
                  alt="Avatar" 
                />
                </div>
                <div className="absolute bottom-4 right-2 bg-gray-100 p-2 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  <Camera className="w-4 h-4 text-gray-700" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left md:pb-4">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
                  {producerData?.company_name || producerData?.name || 'Produtor Ticketera'}
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-100">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                </h1>
                <p className="text-gray-500 font-black text-sm uppercase tracking-widest mt-1">
                  {followersCount.toLocaleString()} Seguidores • {producerData?.category}
                </p>
              </div>

              <div className="flex gap-2 md:pb-4">
                <Button 
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`h-10 px-6 font-black uppercase tracking-widest rounded-lg shadow-sm ${isFollowing ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-[#1877F2] text-white hover:bg-[#166fe5]'}`}
                >
                  {isFollowing ? 'Seguindo' : 'Seguir'}
                </Button>
                <Button 
                  variant="secondary" 
                  className="h-10 px-4 font-black uppercase text-xs tracking-widest rounded-lg gap-2"
                  onClick={() => handleSocialShare('whatsapp')}
                >
                  <Share2 className="w-4 h-4" /> Compartilhar
                </Button>
              </div>
            </div>

            <hr className="mb-1" />
            
            {/* Tabs Nav */}
            <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'timeline', label: 'Feed' },
                { id: 'events', label: 'Eventos' },
                { id: 'store', label: 'Loja' },
                { id: 'about', label: 'Sobre' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-4 font-bold text-sm tracking-tight transition-all rounded-lg ${activeTab === tab.id ? 'text-[#1877F2]' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <div className="relative">
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute -bottom-4 left-0 right-0 h-[3px] bg-[#1877F2] rounded-t-full" />}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-[1100px] mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR (Profile Intro & Store Widget) */}
        <aside className="md:col-span-5 space-y-6">
          {/* Intro Card */}
          <Card className="rounded-xl shadow-sm border-none overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
                <Info className="w-3 h-3" /> Sobre o Produtor
              </div>
              <p className="text-gray-700 text-sm font-medium leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                {producerData?.bio || "Nenhuma biografia disponível."}
              </p>
              
              <div className="flex items-center gap-2 text-gray-500 font-bold text-xs uppercase tracking-widest mt-4 pt-4 border-t border-gray-50">
                <MapPin className="w-4 h-4 text-primary" />
                {producerData?.city ? `${producerData.city}, ${producerData.state}` : 'Brasil'}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm font-bold text-[#1877F2] hover:underline cursor-pointer">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>{producerData?.website || 'a2tickets360.com.br'}</span>
                </div>
                <div className="flex gap-4 pt-2">
                   {producerData?.instagram && (
                     <a href={producerData?.instagram} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-pink-600 transition-colors">
                        <Instagram className="w-6 h-6" />
                     </a>
                   )}
                   {producerData?.facebook && (
                     <a href={producerData?.facebook} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">
                        <Facebook className="w-6 h-6" />
                     </a>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STORE WIDGET (Destaque da Loja) */}
          <Card className="rounded-xl shadow-sm border-none overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black uppercase tracking-tight">Loja Oficial</h3>
                <button onClick={() => setActiveTab('store')} className="text-sm font-bold text-[#1877F2] hover:underline">Ver Tudo</button>
              </div>
              
              {producerProducts.length > 0 ? (
                <div className="space-y-4">
                   {producerProducts.slice(0, 3).map(product => (
                     <Link key={product.id} to={`/checkout/product/${product.id}`} className="flex items-center gap-4 group cursor-pointer border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 shadow-inner">
                           <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={product.name} />
                        </div>
                        <div className="flex-1">
                           <h4 className="text-sm font-black text-gray-900 group-hover:text-[#1877F2] transition-colors">{product.name}</h4>
                           <p className="text-sm font-black text-[#1877F2]">R$ {parseFloat(product.price).toFixed(2)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1877F2]" />
                     </Link>
                   ))}
                   <Button onClick={() => setActiveTab('store')} className="w-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 font-black uppercase text-xs tracking-widest h-11 border-none">
                     <ShoppingBag className="w-4 h-4 mr-2" /> Acessar Vitrine Completa
                   </Button>
                </div>
              ) : (
                <div className="py-10 text-center space-y-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                   <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto" />
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loja em breve!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos/Feed Summary (Gallery Style) */}
          <Card className="rounded-xl shadow-sm border-none overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-lg font-black uppercase tracking-tight">Fotos Recentes</h3>
              <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
                 {posts.slice(0, 9).map(post => (
                   <div key={post.id} className="aspect-square bg-gray-100 cursor-pointer overflow-hidden">
                      <img src={post.imageUrl} className="w-full h-full object-cover hover:opacity-90 transition-opacity" alt="Feed" />
                   </div>
                 ))}
                 {posts.length === 0 && (
                   <div className="col-span-3 py-10 text-center text-gray-400 font-bold bg-gray-50 uppercase text-[10px] tracking-widest">Aguardando Posts</div>
                 )}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* FEED / CENTRAL AREA */}
        <main className="md:col-span-7 space-y-6">
          
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Creator Card (Placeholder aesthetic) */}
              <Card className="rounded-xl shadow-sm border-none">
                 <CardContent className="p-4 flex gap-4">
                    <img src={producer.avatar} className="w-10 h-10 rounded-full border border-gray-100" />
                    <div className="flex-1 bg-gray-100/80 hover:bg-gray-200/80 transition-colors rounded-full px-5 flex items-center text-gray-500 font-medium cursor-pointer">
                       Diga algo sobre sua próxima produção...
                    </div>
                 </CardContent>
              </Card>

              {posts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-black text-lg uppercase tracking-tight">Feed em silêncio</p>
                  <p className="text-gray-400 text-sm font-medium">As novidades serão postadas aqui em breve.</p>
                </div>
              ) : (
                posts.map(post => (
                  <Card key={post.id} className="rounded-xl shadow-sm border-none overflow-hidden">
                    <div className="p-4 flex items-center gap-3">
                      <img src={producer.avatar} className="w-10 h-10 rounded-full border border-gray-50 shadow-sm" alt="Author" />
                      <div>
                        <h4 className="font-black text-sm text-gray-900 leading-none">{producer.name}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')} • <Globe className="w-3 h-3" />
                        </p>
                      </div>
                    </div>

                    {post.caption && (
                       <div className="px-5 pb-3 text-sm text-gray-800 font-medium leading-relaxed">
                         {post.caption}
                       </div>
                    )}

                    <div className="relative group overflow-hidden bg-gray-50">
                      <img src={post.imageUrl} className="w-full max-h-[600px] object-contain mx-auto" alt="Post" />
                    </div>

                    <div className="p-3 px-6 flex items-center gap-6 border-t border-gray-50">
                       <button 
                         className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-red-500 transition-colors group"
                         onClick={() => {
                            toast({ title: '❤️ Curtido!', description: 'Você curtiu esta foto.' });
                         }}
                       >
                          <Heart className="w-5 h-5 group-hover:fill-current" /> Curtir
                       </button>
                       <button className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-[#1877F2] transition-colors">
                          <MessageCircle className="w-5 h-5" /> Comentar
                       </button>
                       <div className="flex items-center gap-2 ml-auto">
                          <button 
                            onClick={() => handleSocialShare('whatsapp', post)}
                            className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                          >
                             <MessageCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleSocialShare('facebook', post)}
                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          >
                             <Facebook className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleSocialShare('copy', post)}
                            className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                             <Share2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="grid grid-cols-1 gap-6">
              {producerEvents.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-black text-lg uppercase tracking-tight">Nenhum evento ativo</p>
                </div>
              ) : (
                producerEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden rounded-2xl shadow-sm border-none group cursor-pointer hover:shadow-xl transition-all duration-500 bg-white">
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                        <img src={event.bannerUrl || event.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all"></div>
                      </div>
                      <CardContent className="md:w-2/3 p-6 flex flex-col justify-between">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                               <Badge className="bg-emerald-100 text-emerald-700 font-black uppercase text-[10px] tracking-widest border-none">Vendas Abertas</Badge>
                               <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{event.category || 'Evento'}</p>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-[#1877F2] transition-colors">{event.title}</h3>
                            <div className="space-y-1">
                               <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-[#1877F2]" />
                                  {new Date(event.start_date || event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                               </p>
                               <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-pink-500" />
                                  {event.location_name || 'Brasil'}
                               </p>
                            </div>
                         </div>
                         <div className="mt-6">
                            <Link to={`/events/${event.id}`}>
                               <Button className="w-full bg-[#1877F2] text-white font-black uppercase tracking-widest rounded-xl h-12 shadow-lg hover:shadow-blue-200 hover:-translate-y-1 transition-all">
                                  Garantir Ingresso
                               </Button>
                            </Link>
                         </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-white p-6 rounded-2xl shadow-sm border-none flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-[#1877F2]/10 flex items-center justify-center rounded-2xl">
                     <ShoppingBag className="w-8 h-8 text-[#1877F2]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Loja Oficial {producer.name}</h2>
                    <p className="text-gray-500 font-medium">Produtos exclusivos para nossos fãs e seguidores.</p>
                  </div>
               </div>

               {producerProducts.length === 0 ? (
                 <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
                   <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-500 font-black text-lg uppercase tracking-tight">Cofre de produtos fechado</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {producerProducts.map(product => (
                      <Card key={product.id} className="rounded-2xl shadow-sm border-none overflow-hidden group bg-white flex flex-col">
                         <div className="aspect-square relative overflow-hidden bg-gray-50">
                            <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                            {product.salePrice && (
                              <Badge className="absolute top-4 left-4 bg-red-600 font-black rounded-lg border-none shadow-xl">OFF</Badge>
                            )}
                         </div>
                         <CardContent className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                               <h4 className="text-lg font-black text-gray-900 group-hover:text-[#1877F2] transition-colors line-clamp-1">{product.name}</h4>
                               <p className="text-sm text-gray-500 font-medium line-clamp-2 mt-1">{product.description}</p>
                            </div>
                            <div className="mt-6 flex flex-col gap-4">
                               <div className="flex items-center gap-2">
                                  <span className="text-2xl font-black text-gray-900">R$ {parseFloat(product.price).toFixed(2)}</span>
                               </div>
                               <Link to={`/checkout/product/${product.id}`}>
                                  <Button className="w-full bg-[#1877F2] text-white font-black uppercase tracking-widest rounded-xl hover:shadow-xl transition-all">
                                     Comprar
                                  </Button>
                               </Link>
                            </div>
                         </CardContent>
                      </Card>
                    ))}
                 </div>
               )}
            </div>
          )}

          {activeTab === 'about' && (
            <Card className="rounded-2xl shadow-sm border-none overflow-hidden pb-10">
               <div className="h-3 bg-[#1877F2]" />
               <CardContent className="p-8 space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tight">Missão & Visão</h3>
                    <p className="text-gray-700 text-lg leading-relaxed font-medium">{producer.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <h4 className="text-sm font-black uppercase text-gray-400 tracking-widest">Informações Adicionais</h4>
                       <div className="space-y-3">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                <MapPin className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Localização</p>
                                <p className="text-sm font-bold text-gray-800">{producer.location}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                <TicketIcon className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Eventos Realizados</p>
                                <p className="text-sm font-bold text-gray-800">{producerEvents.length}+ Eventos</p>
                             </div>
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4 text-center p-6 bg-gray-50 rounded-3xl border border-gray-100">
                       <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">Fã desde...</h4>
                       <div className="text-5xl">🎁</div>
                       <p className="text-xs font-bold text-gray-500 leading-relaxed">Conecte-se com a marca oficial em todos os canais verificados.</p>
                       <div className="flex justify-center gap-4">
                           {producer.instagram && <Instagram className="w-5 h-5 text-[#1877F2] cursor-pointer" />}
                           {producer.facebook && <Facebook className="w-5 h-5 text-[#1877F2] cursor-pointer" />}
                       </div>
                    </div>
                  </div>
               </CardContent>
            </Card>
          )}

        </main>
      </div>
      
      {/* Dynamic Link for Checkout / Floating button if mobile? (Optional premium touch) */}
    </div>
  );
};

export default ProducerFanPage;
