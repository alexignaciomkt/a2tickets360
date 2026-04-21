import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  const command = new PutObjectCommand({
    Bucket: 'a2tickets360',
    Key: 'test_presigned.txt',
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  console.log("Presigned URL gerada:", url);
  
  // Vamos testar o PUT nela via Node (fetch)
  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: 'Hello World from Presigned',
      headers: {
        'Content-Type': 'text/plain'
      }
    });
    console.log("Resultado do PUT:", response.status, response.statusText);
  } catch (err) {
    console.error("Erro no PUT presigned:", err);
  }
}

run();
