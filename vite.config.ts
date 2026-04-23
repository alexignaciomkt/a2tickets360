import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import basicSsl from '@vitejs/plugin-basic-ssl';

// Minio API plugin — runs in Node.js, credentials never reach the browser
function minioApiPlugin() {
  return {
    name: 'minio-api',
    configureServer(server: any) {
      server.middlewares.use('/api/minio', async (req: any, res: any) => {
        // Dynamic import to avoid bundling in client
        const { S3Client, CreateBucketCommand, PutBucketPolicyCommand, ListObjectsV2Command, DeleteObjectsCommand, DeleteBucketCommand } = await import('@aws-sdk/client-s3');

        const ENDPOINT   = 'https://s3.a2tickets360.com.br';
        const ACCESS_KEY = 'mC2zolsn0vVjw2Lhk3h0';
        const SECRET_KEY = '1wtdjz3Wec1NGeLjkkznOXRBGfuNEpcT7ChMjCID';

        const s3 = new S3Client({
          endpoint: ENDPOINT,
          credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
          region: 'us-east-1',
          forcePathStyle: true,
        });

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        // Read body
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        await new Promise(r => req.on('end', r));

        const payload = body ? JSON.parse(body) : {};
        
        // Sanitize producer name: lowercase, only alphanumeric and hyphens, max 20 chars
        const sanitizedName = (payload.producerName || '')
          .toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
          .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphen
          .replace(/-+/g, '-') // Remove double hyphens
          .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
          .substring(0, 20);

        const bucketName = sanitizedName 
          ? `producer-${payload.userId}-${sanitizedName}`.toLowerCase()
          : `producer-${payload.userId}`.replace(/[^a-z0-9-]/g, '-').toLowerCase();

        // POST /api/minio/ensure-bucket — Create bucket if it doesn't exist + set public policy
        if (req.url === '/ensure-bucket' && req.method === 'POST') {
          try {
            await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
            console.log(`[MinIO API] Created bucket: ${bucketName}`);
          } catch (e: any) {
            if (e.Code !== 'BucketAlreadyOwnedByYou' && e.Code !== 'BucketAlreadyExists') {
              console.error('[MinIO API] Bucket creation error:', e.Code, e.message);
            }
          }

          // Always apply public read/write policy (idempotent)
          try {
            const publicPolicy = JSON.stringify({
              Version: '2012-10-17',
              Statement: [
                {
                  Effect: 'Allow',
                  Principal: { AWS: ['*'] },
                  Action: ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
                  Resource: [
                    `arn:aws:s3:::${bucketName}`,
                    `arn:aws:s3:::${bucketName}/*`
                  ]
                }
              ]
            });
            await s3.send(new PutBucketPolicyCommand({ Bucket: bucketName, Policy: publicPolicy }));
            console.log(`[MinIO API] Public policy applied to: ${bucketName}`);
          } catch (policyErr: any) {
            console.error('[MinIO API] Policy error (non-critical):', policyErr.Code || policyErr.message);
          }

          res.end(JSON.stringify({ ok: true, bucket: bucketName }));
          return;
        }

        // DELETE /api/minio/delete-bucket — Delete all files + bucket
        if (req.url === '/delete-bucket' && req.method === 'DELETE') {
          console.log(`[MinIO API] Request to DELETE bucket: ${bucketName}`);
          try {
            // 1. List all objects (to ensure bucket is empty before deletion)
            const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
            
            if (listed.Contents && listed.Contents.length > 0) {
              console.log(`[MinIO API] Cleaning ${listed.Contents.length} objects from ${bucketName}...`);
              await s3.send(new DeleteObjectsCommand({
                Bucket: bucketName,
                Delete: { Objects: listed.Contents.map(o => ({ Key: o.Key! })) }
              }));
            }
            
            // 2. Delete the bucket itself
            await s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
            console.log(`[MinIO API] Successfully deleted bucket: ${bucketName}`);
            res.end(JSON.stringify({ ok: true, message: 'Bucket deleted' }));
          } catch (e: any) {
            console.error(`[MinIO API] Deletion error for ${bucketName}:`, e.name || e.Code, e.message);
            
            // If bucket doesn't exist, we consider it "deleted" (success)
            if (e.name === 'NoSuchBucket' || e.Code === 'NoSuchBucket') {
              res.end(JSON.stringify({ ok: true, message: 'Bucket already gone' }));
            } else {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: e.message, code: e.name || e.Code }));
            }
          }
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '127.0.0.1',
    port: 8081,
    strictPort: true,
  },
  plugins: [
    react(),
    minioApiPlugin(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
