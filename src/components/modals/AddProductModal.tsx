
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { organizerService } from '@/services/organizerService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: any) => void;
  product?: any;
}

const AddProductModal = ({ isOpen, onClose, onSubmit, product }: AddProductModalProps) => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    image: '',
    featured: false,
    hasVariants: false,
    variants: [] as any[]
  });

  const [newVariant, setNewVariant] = useState({ name: '', stock: '', price: '' });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.salePrice || '',
        category: product.categoryId || '',
        image: product.imageUrl || '',
        featured: product.isFeatured || false,
        hasVariants: product.hasVariants || false,
        variants: product.variants || []
      });
      setImagePreview(product.imageUrl || '');
    } else {
      setFormData({
        id: '',
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        image: '',
        featured: false,
        hasVariants: false,
        variants: []
      });
      setImagePreview('');
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      image: imagePreview
    };

    onSubmit(productData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      const { url } = await organizerService.uploadImage(file, user.id);
      setImagePreview(url);
      setFormData(prev => ({ ...prev, image: url }));
      showToast('success', 'Imagem carregada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', 'Falha ao carregar imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.stock) {
      setFormData({
        ...formData,
        variants: [
          ...formData.variants,
          { 
            id: Math.random().toString(36).substr(2, 9), 
            name: newVariant.name, 
            stock: parseInt(newVariant.stock),
            price: newVariant.price ? parseFloat(newVariant.price) : undefined
          }
        ]
      });
      setNewVariant({ name: '', stock: '', price: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Adicionar Novo Produto'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-400 transition-colors bg-gray-50/50">
              {isUploading ? (
                <div className="flex flex-col items-center py-8">
                  <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                  <p className="mt-2 text-sm text-gray-500">Fazendo upload...</p>
                </div>
              ) : imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
                    onClick={() => setImagePreview('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="product-image-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                        Clique para fazer upload
                      </span>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG ou WEBP até 5MB</p>
                      <input
                        id="product-image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Camiseta Festival 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vestuario">Vestuário</SelectItem>
                  <SelectItem value="acessorios">Acessórios</SelectItem>
                  <SelectItem value="decoracao">Decoração</SelectItem>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Produto *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva as características, material, etc..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço de Venda (R$) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="originalPrice">Preço Original / De (R$)</Label>
              <Input
                id="originalPrice"
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                placeholder="0.00"
              />
              <p className="text-[10px] text-gray-500 italic">Preço riscado para promoções</p>
            </div>
          </div>

          {/* Variable Product Toggle */}
          <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
            <div className="space-y-0.5">
              <Label htmlFor="hasVariants" className="text-base font-semibold text-indigo-900">Produto Variável</Label>
              <p className="text-xs text-indigo-600/70">Ative para adicionar tamanhos (P, M, G), cores ou variações.</p>
            </div>
            <Switch
              id="hasVariants"
              checked={formData.hasVariants}
              onCheckedChange={(checked) => setFormData({ ...formData, hasVariants: checked })}
            />
          </div>

          {/* Variants Section */}
          {formData.hasVariants && (
            <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm ring-1 ring-black/5">
              <Label className="text-sm font-bold uppercase tracking-wider text-gray-500">Variações do Produto</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-md">
                <div className="space-y-1">
                  <Label className="text-[10px]">Nome (ex: P / Azul)</Label>
                  <Input
                    value={newVariant.name}
                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                    placeholder="P, Azul, etc"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Estoque</Label>
                  <Input
                    type="number"
                    value={newVariant.stock}
                    onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    className="w-full h-8 bg-indigo-600 hover:bg-indigo-700"
                    onClick={addVariant}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Adicionar
                  </Button>
                </div>
              </div>

              {formData.variants.length > 0 && (
                <div className="mt-2 space-y-2">
                  {formData.variants.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 px-3 bg-gray-50 rounded text-sm border">
                      <span className="font-semibold text-gray-700">{v.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">Estoque: <strong>{v.stock}</strong></span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setFormData({
                            ...formData,
                            variants: formData.variants.filter((_, i) => i !== idx)
                          })}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!formData.hasVariants && (
              <div className="space-y-2">
                  <Label htmlFor="stock">Estoque Total *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={(formData as any).stock || '0'}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value } as any)}
                    placeholder="Quantidade disponível"
                  />
              </div>
          )}

          {/* Featured Product */}
          <div className="flex items-center space-x-2 py-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
            />
            <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">
              Exibir este produto em destaque na FanPage
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t font-semibold">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 px-8" disabled={isUploading}>
              {product ? 'Salvar Alterações' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
