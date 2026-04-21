import { S3Client, CreateBucketCommand, PutObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { MINIO_CONFIG } from '../src/lib/supabase-config.ts';

const s3 = new S3Client({
  endpoint: MINIO_CONFIG.endpoint,
  credentials: {
    accessKeyId: MINIO_CONFIG.accessKey,
    secretAccessKey: MINIO_CONFIG.secretKey,
  },
  region: MINIO_CONFIG.region,
  forcePathStyle: true,
});

const testUserId = 'producer-test-abc123';

async function run() {
  // 1. Criar bucket do produtor
  console.log(`\n1. Criando bucket: ${testUserId}`);
  try {
    await s3.send(new CreateBucketCommand({ Bucket: testUserId }));
    console.log('✅ Bucket criado com sucesso!');
  } catch(e: any) {
    console.log('Status criação:', e.Code || e.message);
  }

  // 2. Subir um arquivo nele
  console.log('\n2. Subindo arquivo no bucket do produtor...');
  await s3.send(new PutObjectCommand({
    Bucket: testUserId,
    Key: 'logo.txt',
    Body: 'Imagem do produtor!',
  }));
  console.log('✅ Arquivo enviado!');

  // 3. Listar o bucket
  const { Contents } = await s3.send(new ListObjectsV2Command({ Bucket: testUserId }));
  console.log('\n3. Arquivos no bucket:', Contents?.map(f => f.Key));
}

run();
