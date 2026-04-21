
import { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Edit3, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { organizerService } from '@/services/organizerService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const OrganizerPostManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const fetchPosts = async () => {
    if (!user?.id) return;
    try {
      const data = await organizerService.getPosts(user.id);
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploading(true);
    try {
      // 1. Upload to Minio
      const { url } = await organizerService.uploadImage(file, user.id, user.name);
      
      // 2. Create post record
      await organizerService.saveFeedPosts(user.id, [{ imageUrl: url }]);
      
      toast({
        title: "Sucesso!",
        description: "Nova foto adicionada ao seu feed.",
      });
      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível subir a imagem.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateCaption = async (postId: string) => {
    try {
      await organizerService.updatePost(postId, { caption: editCaption });
      toast({
        title: "Legenda atualizada!",
        description: "Seu post agora está completo.",
      });
      setEditingPostId(null);
      fetchPosts();
    } catch (error) {
       toast({
        title: "Erro ao salvar",
        description: "Tente novamente em instantes.",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Deseja realmente excluir este post?")) return;
    
    try {
      await organizerService.deletePost(postId);
      toast({
        title: "Post removido",
      });
      fetchPosts();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout userType="organizer">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest">Postador - Gestão de Feed</h1>
            <p className="text-gray-600 font-medium">Lembre-se: fotos com legenda vendem mais!</p>
          </div>
          <div className="relative">
            <input
              type="file"
              id="new-post"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            <label
              htmlFor="new-post"
              className={`btn-primary flex items-center gap-2 px-6 py-3 cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
            >
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Nova Publicação
            </label>
          </div>
        </div>

        {posts.some(p => !p.caption) && (
          <Alert className="bg-amber-50 border-amber-200">
             <AlertCircle className="h-4 w-4 text-amber-600" />
             <AlertTitle className="text-amber-900 font-bold uppercase text-[10px] tracking-widest">Atenção</AlertTitle>
             <AlertDescription className="text-amber-800 text-sm font-medium">
               Você tem posts sem legenda. Clique no ícone de editar para dar um contexto às suas fotos.
             </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden border-none shadow-md group">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingPostId(post.id);
                        setEditCaption(post.caption || "");
                      }}
                      className="bg-white/90 p-2 rounded-lg text-indigo-600 hover:bg-white shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="bg-white/90 p-2 rounded-lg text-red-600 hover:bg-white shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <CardContent className="p-4">
                  {editingPostId === post.id ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full p-2 text-sm border-2 border-indigo-100 rounded-lg focus:ring-0 focus:border-indigo-400 font-medium"
                        rows={3}
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="Escreva uma legenda incrível..."
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 font-bold text-xs" 
                          onClick={() => handleUpdateCaption(post.id)}
                        >
                          Salvar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="font-bold text-xs" 
                          onClick={() => setEditingPostId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {post.caption ? (
                        <p className="text-sm font-medium text-gray-700 italic">"{post.caption}"</p>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">Sem legenda</span>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-2 font-black uppercase tracking-widest">
                        Postado em {new Date(post.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {posts.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Seu Feed está vazio</h3>
            <p className="text-gray-500 font-medium max-w-xs mx-auto">Comece subindo fotos dos seus melhores eventos para encantar seus clientes.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrganizerPostManager;
