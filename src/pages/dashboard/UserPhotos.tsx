
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Image, 
  Video, 
  Grid3X3, 
  Bookmark, 
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  Filter,
  ArrowLeft
} from 'lucide-react';

const UserPhotos = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const mockPosts = [
    { id: 1, image: 'https://picsum.photos/300/300?random=1', likes: 42, comments: 8 },
    { id: 2, image: 'https://picsum.photos/300/300?random=2', likes: 128, comments: 15 },
    { id: 3, image: 'https://picsum.photos/300/300?random=3', likes: 89, comments: 12 },
    { id: 4, image: 'https://picsum.photos/300/300?random=4', likes: 256, comments: 32 },
    { id: 5, image: 'https://picsum.photos/300/300?random=5', likes: 73, comments: 6 },
    { id: 6, image: 'https://picsum.photos/300/300?random=6', likes: 194, comments: 28 },
  ];

  if (showCreatePost) {
    return (
      <DashboardLayout userType="customer">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button 
              onClick={() => setShowCreatePost(false)}
              className="flex items-center text-blue-500 font-medium"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Voltar
            </button>
            <h1 className="font-semibold">Nova publicação</h1>
            <button className="text-blue-500 font-medium">
              Compartilhar
            </button>
          </div>

          {/* Upload Area */}
          <div className="p-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Image className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Selecione fotos e vídeos aqui</p>
              <Button variant="outline">
                Selecionar da galeria
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Filtros</span>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {['Normal', 'Clarendon', 'Gingham', 'Moon', 'Lark', 'Reyes', 'Juno'].map((filter) => (
                <div key={filter} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mb-1"></div>
                  <span className="text-xs text-gray-600">{filter}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="px-4 pb-4">
            <textarea 
              placeholder="Escreva uma legenda..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Advanced Options */}
          <div className="px-4 space-y-3">
            <div className="flex items-center justify-between py-3 border-b">
              <span>Marcar pessoas</span>
              <button className="text-blue-500">Adicionar</button>
            </div>
            <div className="flex items-center justify-between py-3 border-b">
              <span>Adicionar local</span>
              <button className="text-blue-500">Adicionar</button>
            </div>
            <div className="flex items-center justify-between py-3">
              <span>Publicar também no Facebook</span>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="customer">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Minhas Fotos</h1>
          <button 
            onClick={() => setShowCreatePost(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Profile Section */}
        <div className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg">João da Silva</h2>
              <p className="text-gray-600">@joaosilva</p>
            </div>
          </div>

          <div className="flex justify-around text-center mb-4">
            <div>
              <div className="font-semibold text-lg">{mockPosts.length}</div>
              <div className="text-gray-600 text-sm">publicações</div>
            </div>
            <div>
              <div className="font-semibold text-lg">1.2k</div>
              <div className="text-gray-600 text-sm">seguidores</div>
            </div>
            <div>
              <div className="font-semibold text-lg">890</div>
              <div className="text-gray-600 text-sm">seguindo</div>
            </div>
          </div>

          <p className="text-sm mb-4">
            Amante de eventos e música 🎵<br/>
            📍 São Paulo, SP<br/>
            ✨ Vivendo experiências únicas
          </p>

          <Button className="w-full" variant="outline">
            Editar perfil
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="grid" className="border-t">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="reels" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-3 gap-1">
              {mockPosts.map((post) => (
                <div 
                  key={post.id} 
                  className="aspect-square relative cursor-pointer group"
                  onClick={() => setSelectedImage(post.image)}
                >
                  <img 
                    src={post.image} 
                    alt={`Post ${post.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-5 w-5" fill="white" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-5 w-5" fill="white" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reels" className="mt-0">
            <div className="p-8 text-center text-gray-500">
              <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Nenhum vídeo ainda</p>
              <p className="text-sm">Compartilhe seus momentos em vídeo</p>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <div className="p-8 text-center text-gray-500">
              <Bookmark className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma publicação salva</p>
              <p className="text-sm">Salve publicações que você goste</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de visualização da imagem */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center" onClick={() => setSelectedImage(null)}>
            <div className="max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <span className="font-medium">joaosilva</span>
                  </div>
                  <button>
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
                
                <img src={selectedImage} alt="Post" className="w-full" />
                
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <Heart className="h-6 w-6" />
                      <MessageCircle className="h-6 w-6" />
                      <Send className="h-6 w-6" />
                    </div>
                    <Bookmark className="h-6 w-6" />
                  </div>
                  
                  <p className="font-medium mb-1">128 curtidas</p>
                  <p className="text-sm">
                    <span className="font-medium">joaosilva</span> Que evento incrível! 🎉
                  </p>
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
