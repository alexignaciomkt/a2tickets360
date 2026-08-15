import fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const MINIO_CONFIG = {
  endpoint: 'https://s3.a2tickets360.com.br',
  accessKey: 'mC2zolsn0vVjw2Lhk3h0',
  secretKey: '1wtdjz3Wec1NGeLjkkznOXRBGfuNEpcT7ChMjCID',
  bucket: 'a2tickets360',
  region: 'us-east-1'
};

const s3Client = new S3Client({
  endpoint: MINIO_CONFIG.endpoint,
  credentials: {
    accessKeyId: MINIO_CONFIG.accessKey,
    secretAccessKey: MINIO_CONFIG.secretKey,
  },
  region: MINIO_CONFIG.region,
  forcePathStyle: true,
});

async function run() {
  const fileBuffer = Buffer.from('test image content', 'utf-8');
  const filePath = 'producers/test-user-123/logo.png';
  
  const command = new PutObjectCommand({
    Bucket: MINIO_CONFIG.bucket,
    Key: filePath,
    Body: fileBuffer,
    ContentType: 'image/png',
  });

  const start = Date.now();
  try {
    await s3Client.send(command);
    console.log(`✅ Upload success in ${Date.now() - start}ms`);
    console.log(`URL: ${MINIO_CONFIG.endpoint}/${MINIO_CONFIG.bucket}/${filePath}`);
  } catch (err) {
    console.error(`❌ Upload failed in ${Date.now() - start}ms:`, err);
  }
}

run();
