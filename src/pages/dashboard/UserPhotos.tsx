
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Image as ImageIcon, 
  Video, 
  Grid3X3, 
  Bookmark, 
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Filter,
  ArrowLeft,
  Camera,
  Layers,
  MapPin,
  Settings,
  Share2,
  Zap,
  Target
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const UserPhotos = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mockPosts = [
    { id: 1, image: 'https://picsum.photos/600/600?random=11', likes: 42, comments: 8 },
    { id: 2, image: 'https://picsum.photos/600/600?random=12', likes: 128, comments: 15 },
    { id: 3, image: 'https://picsum.photos/600/600?random=13', likes: 89, comments: 12 },
    { id: 4, image: 'https://picsum.photos/600/600?random=14', likes: 256, comments: 32 },
    { id: 5, image: 'https://picsum.photos/600/600?random=15', likes: 73, comments: 6 },
    { id: 6, image: 'https://picsum.photos/600/600?random=16', likes: 194, comments: 28 },
  ];

  if (showCreatePost) {
    return (
      <DashboardLayout userType="customer">
        <div className="max-w-2xl mx-auto pb-20 animate-in slide-in-from-bottom-8 duration-700">
          <Card className="rounded-[3rem] border-gray-100 shadow-2xl overflow-hidden bg-white">
            <div className="flex items-center justify-between p-10 border-b border-gray-50 bg-gray-50/20">
              <button 
                onClick={() => setShowCreatePost(false)}
                className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                Cancel Node
              </button>
              <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">Initialize Identity Stream</h1>
              <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors">
                Publish Asset
              </button>
            </div>

            <div className="p-10 space-y-10">
              {/* Upload Area */}
              <div className="aspect-square rounded-[2.5rem] border-4 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-slate-200 transition-all">
                <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                   <ImageIcon className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight mb-2">Deploy Visual Assets</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Drag and drop high-fidelity nodes here.</p>
                <Button variant="outline" className="h-11 rounded-full border-gray-100 text-[10px] font-black uppercase tracking-widest px-10">
                  Select from Matrix
                </Button>
              </div>

              {/* Filters */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <Layers className="h-4 w-4 text-slate-900" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identity Filters</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {['Normal', 'Clarendon', 'Gingham', 'Moon', 'Lark', 'Reyes', 'Juno'].map((filter) => (
                    <div key={filter} className="flex-shrink-0 text-center space-y-3 cursor-pointer group">
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl border-2 border-transparent group-hover:border-slate-900 transition-all overflow-hidden shadow-sm">
                         <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-400 opacity-50" />
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{filter}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Registry Description</Label>
                <textarea 
                  placeholder="Escreva uma legenda executiva..."
                  className="w-full p-10 bg-gray-50/50 border-2 border-gray-100 rounded-[2.5rem] text-[12px] font-bold text-slate-900 focus:ring-8 focus:ring-slate-50 transition-all resize-none leading-relaxed"
                  rows={4}
                />
              </div>

              {/* Advanced Options */}
              <div className="space-y-2">
                {[
                  { label: 'Tag Authorized Nodes', sub: 'Marcar pessoas', icon: Target },
                  { label: 'Geo-Location Registry', sub: 'Adicionar local', icon: MapPin },
                  { label: 'External Node Sync', sub: 'Post to Facebook', icon: Share2, toggle: true }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-8 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 rounded-3xl transition-all group">
                    <div className="flex items-center gap-5">
                       <item.icon className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                       <div className="space-y-0.5">
                          <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{item.label}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.sub}</p>
                       </div>
                    </div>
                    {item.toggle ? (
                       <div className="w-10 h-6 bg-gray-200 rounded-full relative shadow-inner">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    ) : (
                      <Button variant="ghost" className="h-8 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Configure</Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="customer">
      <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-1000">
        
        {/* Profile Header */}
        <div className="bg-white rounded-[3.5rem] p-12 shadow-sm border border-gray-50 mb-10 group hover:shadow-2xl transition-all duration-700">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative group/avatar">
               <div className="absolute inset-0 bg-slate-900 rounded-[3rem] rotate-6 scale-95 opacity-0 group-hover/avatar:opacity-10 transition-all duration-700" />
               <div className="w-40 h-40 rounded-[3rem] bg-gray-100 overflow-hidden border-4 border-white shadow-2xl relative z-10">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Identity" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/avatar:scale-110"
                  />
               </div>
               <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-slate-900 text-white rounded-[1.2rem] flex items-center justify-center shadow-2xl border-4 border-white z-20 group-hover/avatar:scale-110 transition-transform">
                  <Plus className="w-6 h-6" onClick={() => setShowCreatePost(true)} />
               </div>
            </div>

            <div className="flex-1 space-y-8 text-center md:text-left">
              <div className="space-y-2">
                 <div className="flex flex-col md:flex-row items-center gap-4">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">João da Silva Node</h2>
                    <div className="px-4 py-1.5 bg-slate-900 rounded-full text-[8px] font-black text-white uppercase tracking-[0.2em] shadow-lg">Verified Identity</div>
                 </div>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Matrix ID: @JOAOSILVA_ALPHA</p>
              </div>

              <div className="flex justify-center md:justify-start gap-12">
                {[
                  { l: 'Registries', v: mockPosts.length },
                  { l: 'Network', v: '1.2k' },
                  { l: 'Authorized', v: '890' }
                ].map((stat, i) => (
                  <div key={i} className="text-center md:text-left">
                    <div className="text-xl font-black text-slate-900 tabular-nums leading-none mb-1.5">{stat.v}</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.l}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                <Button className="h-11 rounded-full bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest px-12 shadow-xl shadow-slate-100 active:scale-95 transition-all">
                  Sync Profile Matrix
                </Button>
                <Button variant="ghost" className="h-11 rounded-full text-slate-400 font-black uppercase text-[10px] tracking-widest px-8 hover:text-slate-900 hover:bg-gray-100 transition-all">
                   <Settings className="w-4 h-4 mr-2" /> Node Params
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="space-y-8">
           <div className="flex bg-gray-100/50 p-1.5 rounded-full border border-gray-100 shadow-inner w-fit mx-auto">
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="bg-transparent h-auto p-0 gap-1.5">
                {[
                  { v: 'grid', i: Grid3X3, l: 'Asset Grid' },
                  { v: 'reels', i: Video, l: 'Temporal Flux' },
                  { v: 'saved', i: Bookmark, l: 'Encrypted Vault' }
                ].map((tab) => (
                  <TabsTrigger 
                    key={tab.v}
                    value={tab.v} 
                    className="rounded-full px-10 py-3.5 text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xl transition-all shadow-none border border-transparent"
                  >
                    <tab.i className="w-4 h-4 mr-3" /> {tab.l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
           </div>

          <div className="min-h-[600px]">
            <Tabs defaultValue="grid" className="w-full">
              <TabsContent value="grid" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {mockPosts.map((post) => (
                    <div 
                      key={post.id} 
                      className="aspect-square relative cursor-pointer group rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700"
                      onClick={() => setSelectedImage(post.image)}
                    >
                      <img 
                        src={post.image} 
                        alt={`Registry ${post.id}`}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center text-white backdrop-blur-sm">
                        <div className="flex items-center gap-10">
                          <div className="flex flex-col items-center gap-2">
                            <Heart className="h-6 w-6" fill="white" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{post.likes}</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <MessageCircle className="h-6 w-6" fill="white" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reels" className="mt-0 animate-in fade-in duration-700">
                <div className="flex flex-col items-center justify-center py-40 bg-gray-50/20 rounded-[4rem] border-4 border-dashed border-gray-100">
                  <div className="w-24 h-24 rounded-[3rem] bg-white shadow-xl flex items-center justify-center mb-8">
                     <Video className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-2 leading-none">Zero Temporal Flux Detected</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Initialize your first video asset node.</p>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="mt-0 animate-in fade-in duration-700">
                <div className="flex flex-col items-center justify-center py-40 bg-gray-50/20 rounded-[4rem] border-4 border-dashed border-gray-100">
                  <div className="w-24 h-24 rounded-[3rem] bg-white shadow-xl flex items-center justify-center mb-8">
                     <Bookmark className="h-8 w-8 text-slate-200" />
                  </div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em] mb-2 leading-none">Encrypted Vault Empty</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Sincronize ativos externos para persistência local.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Modal de visualização da imagem */}
        {selectedImage && (
          <div className="fixed inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setSelectedImage(null)}>
            <div className="max-w-4xl w-full flex flex-col lg:flex-row bg-white rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500" onClick={(e) => e.stopPropagation()}>
                <div className="lg:w-2/3 bg-black flex items-center justify-center relative">
                   <img src={selectedImage} alt="Post" className="max-h-[80vh] object-contain" />
                </div>
                
                <div className="lg:w-1/3 flex flex-col h-full bg-white">
                  <div className="flex items-center justify-between p-8 border-b border-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gray-100 overflow-hidden border-2 border-slate-900 shadow-lg">
                         <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="A" className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-0.5">
                         <span className="text-[11px] font-black uppercase tracking-tight text-slate-900">joaosilva_alpha</span>
                         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">AUTHORIZED_NODE</p>
                      </div>
                    </div>
                    <button className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                      <MoreHorizontal className="h-6 w-6 text-slate-300" />
                    </button>
                  </div>
                  
                  <div className="flex-1 p-8 overflow-y-auto min-h-[300px]">
                    <div className="space-y-6">
                       <div className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 shrink-0" />
                          <div className="space-y-1">
                             <p className="text-[11px] font-bold text-slate-900 leading-relaxed"><span className="font-black uppercase mr-2 text-slate-900">joaosilva_alpha</span> Que evento incrível! 🎉 Sincronização de ativos concluída com sucesso. #A2Tickets #AlphaNode</p>
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">2h • Kernel Verified</p>
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  <div className="p-8 border-t border-gray-50 space-y-6 bg-gray-50/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-8">
                        <Heart className="h-7 w-7 text-slate-900 cursor-pointer hover:scale-125 transition-transform" />
                        <MessageCircle className="h-7 w-7 text-slate-900 cursor-pointer hover:scale-125 transition-transform" />
                        <Send className="h-7 w-7 text-slate-900 cursor-pointer hover:scale-125 transition-transform" />
                      </div>
                      <Bookmark className="h-7 w-7 text-slate-900 cursor-pointer hover:scale-125 transition-transform" />
                    </div>
                    
                    <div className="space-y-1">
                       <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight">128 Validations</p>
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest tabular-nums">Registry Cycle: 2025.01.21.1432</p>
                    </div>

                    <div className="relative group">
                       <Input 
                         placeholder="Authorized comment..." 
                         className="h-12 bg-white border-gray-100 rounded-full px-6 text-[11px] font-black uppercase tracking-tight shadow-sm focus:ring-8 focus:ring-slate-50 transition-all border-2 pr-12"
                       />
                       <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserPhotos;
