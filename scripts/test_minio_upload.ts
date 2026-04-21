import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: 'https://s3.a2tickets360.com.br',
  credentials: {
    accessKeyId: 'mC2zolsn0vVjw2Lhk3h0',
    secretAccessKey: '1wtdjz3Wec1NGeLjkkznOXRBGfuNEpcT7ChMjCID',
  },
  region: 'us-east-1',
  forcePathStyle: true,
});

async function run() {
  try {
    console.log("Tentando enviar arquivo para MinIO...");
    await s3Client.send(new PutObjectCommand({
      Bucket: 'a2tickets360',
      Key: 'test_server_upload.txt',
      Body: 'Hello World from Node',
    }));
    console.log("✅ UPLOAD COM SUCESSO! O motor S3 da VPS funciona. O problema é bloqueio de navegador (CORS).");
  } catch(e) {
    console.error("❌ FALHA NO UPLOAD:", e.message);
  }
}
run();
