import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: 'https://s3.a2tickets360.com.br',
  credentials: {
    accessKeyId: 'mC2zolsn0vVjw2Lhk3h0',
    secretAccessKey: '1wtdjz3Wec1NGeLjkkznOXRBGfuNEpcT7ChMjCID',
  },
  region: 'us-east-1',
  forcePathStyle: true,
});

async function setCors() {
  try {
    const response = await s3Client.send(new PutBucketCorsCommand({
      Bucket: 'a2tickets360',
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["PUT", "POST", "DELETE", "GET", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000
          }
        ]
      }
    }));
    console.log("CORS aplicado com sucesso no bucket!", response);
  } catch (error) {
    console.error("Erro ao aplicar CORS:", error);
  }
}

setCors();
