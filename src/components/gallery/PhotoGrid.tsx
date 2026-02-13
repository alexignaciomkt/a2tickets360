
import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Photo } from '@/data/mockData';

interface PhotoGridProps {
  photos: Photo[];
}

const PhotoGrid = ({ photos }: PhotoGridProps) => {
  const [likedPhotos, setLikedPhotos] = useState<Record<string, boolean>>({});
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  const handleLike = (photoId: string) => {
    setLikedPhotos((prev) => ({
      ...prev,
      [photoId]: !prev[photoId],
    }));
  };
  
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div 
            key={photo.id} 
            className="relative overflow-hidden rounded-lg shadow group card-hover cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img 
              src={photo.photoUrl} 
              alt={photo.caption || 'Photo'}
              className="w-full aspect-square object-cover"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p className="font-medium text-sm">{photo.userName}</p>
                {photo.caption && <p className="text-xs opacity-90 line-clamp-1">{photo.caption}</p>}
              </div>
            </div>
            
            <button
              className={`absolute top-2 right-2 p-2 rounded-full ${
                likedPhotos[photo.id] ? 'bg-red-500 text-white' : 'bg-white/70 text-gray-700'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike(photo.id);
              }}
            >
              <Heart className="h-4 w-4" fill={likedPhotos[photo.id] ? 'currentColor' : 'none'} />
            </button>
          </div>
        ))}
      </div>
      
      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img 
                src={selectedPhoto.photoUrl} 
                alt={selectedPhoto.caption || 'Photo'} 
                className="w-full max-h-[70vh] object-contain"
              />
              <button 
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center mb-3">
                <img 
                  src={`https://randomuser.me/api/portraits/${selectedPhoto.userId.includes('1') ? 'women' : 'men'}/${Math.floor(Math.random() * 50)}.jpg`} 
                  alt={selectedPhoto.userName} 
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <span className="font-medium">{selectedPhoto.userName}</span>
                <button
                  className={`ml-auto p-2 rounded-full ${
                    likedPhotos[selectedPhoto.id] ? 'text-red-500' : 'text-gray-500'
                  }`}
                  onClick={() => handleLike(selectedPhoto.id)}
                >
                  <Heart className="h-6 w-6" fill={likedPhotos[selectedPhoto.id] ? 'currentColor' : 'none'} />
                  <span className="ml-1">{
                    likedPhotos[selectedPhoto.id] ? 
                    selectedPhoto.likes + 1 : 
                    selectedPhoto.likes
                  }</span>
                </button>
              </div>
              
              {selectedPhoto.caption && (
                <p className="text-gray-800">{selectedPhoto.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGrid;
