import { api } from '@/services/api';

export interface ProducerAlbumPhoto {
  id: string;
  albumId: string;
  imageUrl: string;
  objectKey: string;
  caption: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ProducerAlbum {
  id: string;
  organizerId: string;
  eventId: string | null;
  title: string;
  description: string | null;
  coverPhotoId: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'HIDDEN';
  sortOrder: number;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
  photoCount: number;
  coverPhoto: ProducerAlbumPhoto | null;
}

export interface AlbumDetails extends ProducerAlbum {
  photos: ProducerAlbumPhoto[];
}

class AlbumService {
  async getAlbums(): Promise<ProducerAlbum[]> {
    return await api.get<ProducerAlbum[]>('/api/organizer/albums');
  }

  async getAlbumDetails(albumId: string): Promise<AlbumDetails> {
    return await api.get<AlbumDetails>(`/api/organizer/albums/${albumId}`);
  }

  async createAlbum(data: { title: string; description?: string; eventId?: string; eventDate?: string }): Promise<ProducerAlbum> {
    return await api.post<ProducerAlbum>('/api/organizer/albums', data);
  }

  async updateAlbum(albumId: string, data: Partial<ProducerAlbum>): Promise<ProducerAlbum> {
    return await api.put<ProducerAlbum>(`/api/organizer/albums/${albumId}`, data);
  }

  async deleteAlbum(albumId: string): Promise<void> {
    await api.delete(`/api/organizer/albums/${albumId}`);
  }

  async updatePhoto(albumId: string, photoId: string, data: { caption?: string; sortOrder?: number }): Promise<ProducerAlbumPhoto> {
    return await api.put<ProducerAlbumPhoto>(`/api/organizer/albums/${albumId}/photos/${photoId}`, data);
  }

  async deletePhoto(albumId: string, photoId: string): Promise<void> {
    await api.delete(`/api/organizer/albums/${albumId}/photos/${photoId}`);
  }

  // File Upload Handling
  // O componente AlbumPhotosManager chamará api.post('/api/uploads/presign') diretamente ou usará este helper
  async getPresignedUrl(fileName: string, fileType: string, fileSize: number, albumId: string) {
    return await api.post<{ presignedUrl: string; objectKey: string; publicUrl: string }>('/api/uploads/presign', {
      type: 'producer-album-photo',
      albumId,
      fileName,
      contentType: fileType,
      fileSize,
    });
  }

  async registerPhoto(albumId: string, objectKey: string, caption?: string): Promise<ProducerAlbumPhoto> {
    return await api.post<ProducerAlbumPhoto>(`/api/organizer/albums/${albumId}/photos`, {
      objectKey,
      caption,
    });
  }
}

export const albumService = new AlbumService();
