
import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';

interface PhotoUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSizeMB?: number;
}

const PhotoUpload = ({ 
  onUpload, 
  maxFiles = 10, 
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 5 
}: PhotoUploadProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useNotifications();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (!acceptedTypes.includes(file.type)) {
        showToast('error', 'Tipo de arquivo inválido', `${file.name} não é um tipo de imagem suportado`);
        return false;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        showToast('error', 'Arquivo muito grande', `${file.name} excede o limite de ${maxSizeMB}MB`);
        return false;
      }
      
      return true;
    });

    if (selectedFiles.length + validFiles.length > maxFiles) {
      showToast('warning', 'Muitos arquivos', `Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    const newFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(newFiles);

    // Generate previews
    const newPreviews = [...previews];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      setPreviews([]);
      showToast('success', 'Upload concluído', `${selectedFiles.length} foto(s) enviada(s) com sucesso`);
    } catch (error) {
      showToast('error', 'Erro no upload', 'Falha ao enviar as fotos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Adicionar Fotos
            </h3>
            <p className="text-gray-500 mb-4">
              Clique aqui ou arraste fotos para fazer upload
            </p>
            <p className="text-sm text-gray-400">
              Formatos: JPEG, PNG, WebP • Máximo: {maxSizeMB}MB por foto • Limite: {maxFiles} fotos
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview Grid */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative">
                  <img 
                    src={preview} 
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {selectedFiles[index]?.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setSelectedFiles([]);
              setPreviews([]);
            }}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Enviar {selectedFiles.length} foto(s)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
