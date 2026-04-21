import { S3Client } from '@aws-sdk/client-s3';
import { MINIO_CONFIG } from './supabase-config';

export const s3Client = new S3Client({
  endpoint: MINIO_CONFIG.endpoint,
  credentials: {
    accessKeyId: MINIO_CONFIG.accessKey,
    secretAccessKey: MINIO_CONFIG.secretKey,
  },
  region: MINIO_CONFIG.region,
  forcePathStyle: true, // Necessário para Minio
});
