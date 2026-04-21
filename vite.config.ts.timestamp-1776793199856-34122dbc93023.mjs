// vite.config.ts
import { defineConfig } from "file:///E:/Sistemas/Ticketera/ticketera-main/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Sistemas/Ticketera/ticketera-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///E:/Sistemas/Ticketera/ticketera-main/node_modules/lovable-tagger/dist/index.js";
import basicSsl from "file:///E:/Sistemas/Ticketera/ticketera-main/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
var __vite_injected_original_dirname = "E:\\Sistemas\\Ticketera\\ticketera-main";
function minioApiPlugin() {
  return {
    name: "minio-api",
    configureServer(server) {
      server.middlewares.use("/api/minio", async (req, res) => {
        const { S3Client, CreateBucketCommand, PutBucketPolicyCommand, ListObjectsV2Command, DeleteObjectsCommand, DeleteBucketCommand } = await import("file:///E:/Sistemas/Ticketera/ticketera-main/node_modules/@aws-sdk/client-s3/dist-cjs/index.js");
        const ENDPOINT = "https://s3.a2tickets360.com.br";
        const ACCESS_KEY = "mC2zolsn0vVjw2Lhk3h0";
        const SECRET_KEY = "1wtdjz3Wec1NGeLjkkznOXRBGfuNEpcT7ChMjCID";
        const s3 = new S3Client({
          endpoint: ENDPOINT,
          credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
          region: "us-east-1",
          forcePathStyle: true
        });
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        let body = "";
        req.on("data", (chunk) => {
          body += chunk;
        });
        await new Promise((r) => req.on("end", r));
        const payload = body ? JSON.parse(body) : {};
        const sanitizedName = (payload.producerName || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 20);
        const bucketName = sanitizedName ? `producer-${payload.userId}-${sanitizedName}`.toLowerCase() : `producer-${payload.userId}`.replace(/[^a-z0-9-]/g, "-").toLowerCase();
        if (req.url === "/ensure-bucket" && req.method === "POST") {
          try {
            await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
            console.log(`[MinIO API] Created bucket: ${bucketName}`);
          } catch (e) {
            if (e.Code !== "BucketAlreadyOwnedByYou" && e.Code !== "BucketAlreadyExists") {
              console.error("[MinIO API] Bucket creation error:", e.Code, e.message);
            }
          }
          try {
            const publicPolicy = JSON.stringify({
              Version: "2012-10-17",
              Statement: [
                {
                  Effect: "Allow",
                  Principal: { AWS: ["*"] },
                  Action: ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"],
                  Resource: [
                    `arn:aws:s3:::${bucketName}`,
                    `arn:aws:s3:::${bucketName}/*`
                  ]
                }
              ]
            });
            await s3.send(new PutBucketPolicyCommand({ Bucket: bucketName, Policy: publicPolicy }));
            console.log(`[MinIO API] Public policy applied to: ${bucketName}`);
          } catch (policyErr) {
            console.error("[MinIO API] Policy error (non-critical):", policyErr.Code || policyErr.message);
          }
          res.end(JSON.stringify({ ok: true, bucket: bucketName }));
          return;
        }
        if (req.url === "/delete-bucket" && req.method === "DELETE") {
          console.log(`[MinIO API] Request to DELETE bucket: ${bucketName}`);
          try {
            const listed = await s3.send(new ListObjectsV2Command({ Bucket: bucketName }));
            if (listed.Contents && listed.Contents.length > 0) {
              console.log(`[MinIO API] Cleaning ${listed.Contents.length} objects from ${bucketName}...`);
              await s3.send(new DeleteObjectsCommand({
                Bucket: bucketName,
                Delete: { Objects: listed.Contents.map((o) => ({ Key: o.Key })) }
              }));
            }
            await s3.send(new DeleteBucketCommand({ Bucket: bucketName }));
            console.log(`[MinIO API] Successfully deleted bucket: ${bucketName}`);
            res.end(JSON.stringify({ ok: true, message: "Bucket deleted" }));
          } catch (e) {
            console.error(`[MinIO API] Deletion error for ${bucketName}:`, e.name || e.Code, e.message);
            if (e.name === "NoSuchBucket" || e.Code === "NoSuchBucket") {
              res.end(JSON.stringify({ ok: true, message: "Bucket already gone" }));
            } else {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: e.message, code: e.name || e.Code }));
            }
          }
          return;
        }
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not found" }));
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8081
  },
  plugins: [
    react(),
    minioApiPlugin(),
    basicSsl(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxTaXN0ZW1hc1xcXFxUaWNrZXRlcmFcXFxcdGlja2V0ZXJhLW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFNpc3RlbWFzXFxcXFRpY2tldGVyYVxcXFx0aWNrZXRlcmEtbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovU2lzdGVtYXMvVGlja2V0ZXJhL3RpY2tldGVyYS1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgYmFzaWNTc2wgZnJvbSAnQHZpdGVqcy9wbHVnaW4tYmFzaWMtc3NsJztcblxuLy8gTWluaW8gQVBJIHBsdWdpbiBcdTIwMTQgcnVucyBpbiBOb2RlLmpzLCBjcmVkZW50aWFscyBuZXZlciByZWFjaCB0aGUgYnJvd3NlclxuZnVuY3Rpb24gbWluaW9BcGlQbHVnaW4oKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ21pbmlvLWFwaScsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcjogYW55KSB7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKCcvYXBpL21pbmlvJywgYXN5bmMgKHJlcTogYW55LCByZXM6IGFueSkgPT4ge1xuICAgICAgICAvLyBEeW5hbWljIGltcG9ydCB0byBhdm9pZCBidW5kbGluZyBpbiBjbGllbnRcbiAgICAgICAgY29uc3QgeyBTM0NsaWVudCwgQ3JlYXRlQnVja2V0Q29tbWFuZCwgUHV0QnVja2V0UG9saWN5Q29tbWFuZCwgTGlzdE9iamVjdHNWMkNvbW1hbmQsIERlbGV0ZU9iamVjdHNDb21tYW5kLCBEZWxldGVCdWNrZXRDb21tYW5kIH0gPSBhd2FpdCBpbXBvcnQoJ0Bhd3Mtc2RrL2NsaWVudC1zMycpO1xuXG4gICAgICAgIGNvbnN0IEVORFBPSU5UICAgPSAnaHR0cHM6Ly9zMy5hMnRpY2tldHMzNjAuY29tLmJyJztcbiAgICAgICAgY29uc3QgQUNDRVNTX0tFWSA9ICdtQzJ6b2xzbjB2Vmp3MkxoazNoMCc7XG4gICAgICAgIGNvbnN0IFNFQ1JFVF9LRVkgPSAnMXd0ZGp6M1dlYzFOR2VMamtrem5PWFJCR2Z1TkVwY1Q3Q2hNakNJRCc7XG5cbiAgICAgICAgY29uc3QgczMgPSBuZXcgUzNDbGllbnQoe1xuICAgICAgICAgIGVuZHBvaW50OiBFTkRQT0lOVCxcbiAgICAgICAgICBjcmVkZW50aWFsczogeyBhY2Nlc3NLZXlJZDogQUNDRVNTX0tFWSwgc2VjcmV0QWNjZXNzS2V5OiBTRUNSRVRfS0VZIH0sXG4gICAgICAgICAgcmVnaW9uOiAndXMtZWFzdC0xJyxcbiAgICAgICAgICBmb3JjZVBhdGhTdHlsZTogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgcmVzLnNldEhlYWRlcignQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJywgJyonKTtcblxuICAgICAgICAvLyBSZWFkIGJvZHlcbiAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgcmVxLm9uKCdkYXRhJywgKGNodW5rOiBhbnkpID0+IHsgYm9keSArPSBjaHVuazsgfSk7XG4gICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gcmVxLm9uKCdlbmQnLCByKSk7XG5cbiAgICAgICAgY29uc3QgcGF5bG9hZCA9IGJvZHkgPyBKU09OLnBhcnNlKGJvZHkpIDoge307XG4gICAgICAgIFxuICAgICAgICAvLyBTYW5pdGl6ZSBwcm9kdWNlciBuYW1lOiBsb3dlcmNhc2UsIG9ubHkgYWxwaGFudW1lcmljIGFuZCBoeXBoZW5zLCBtYXggMjAgY2hhcnNcbiAgICAgICAgY29uc3Qgc2FuaXRpemVkTmFtZSA9IChwYXlsb2FkLnByb2R1Y2VyTmFtZSB8fCAnJylcbiAgICAgICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIC5ub3JtYWxpemUoXCJORkRcIikucmVwbGFjZSgvW1xcdTAzMDAtXFx1MDM2Zl0vZywgXCJcIikgLy8gUmVtb3ZlIGFjY2VudHNcbiAgICAgICAgICAucmVwbGFjZSgvW15hLXowLTldL2csICctJykgLy8gUmVwbGFjZSBub24tYWxwaGFudW1lcmljIHdpdGggaHlwaGVuXG4gICAgICAgICAgLnJlcGxhY2UoLy0rL2csICctJykgLy8gUmVtb3ZlIGRvdWJsZSBoeXBoZW5zXG4gICAgICAgICAgLnJlcGxhY2UoL14tfC0kL2csICcnKSAvLyBSZW1vdmUgbGVhZGluZy90cmFpbGluZyBoeXBoZW5zXG4gICAgICAgICAgLnN1YnN0cmluZygwLCAyMCk7XG5cbiAgICAgICAgY29uc3QgYnVja2V0TmFtZSA9IHNhbml0aXplZE5hbWUgXG4gICAgICAgICAgPyBgcHJvZHVjZXItJHtwYXlsb2FkLnVzZXJJZH0tJHtzYW5pdGl6ZWROYW1lfWAudG9Mb3dlckNhc2UoKVxuICAgICAgICAgIDogYHByb2R1Y2VyLSR7cGF5bG9hZC51c2VySWR9YC5yZXBsYWNlKC9bXmEtejAtOS1dL2csICctJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAvLyBQT1NUIC9hcGkvbWluaW8vZW5zdXJlLWJ1Y2tldCBcdTIwMTQgQ3JlYXRlIGJ1Y2tldCBpZiBpdCBkb2Vzbid0IGV4aXN0ICsgc2V0IHB1YmxpYyBwb2xpY3lcbiAgICAgICAgaWYgKHJlcS51cmwgPT09ICcvZW5zdXJlLWJ1Y2tldCcgJiYgcmVxLm1ldGhvZCA9PT0gJ1BPU1QnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHMzLnNlbmQobmV3IENyZWF0ZUJ1Y2tldENvbW1hbmQoeyBCdWNrZXQ6IGJ1Y2tldE5hbWUgfSkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtNaW5JTyBBUEldIENyZWF0ZWQgYnVja2V0OiAke2J1Y2tldE5hbWV9YCk7XG4gICAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgICAgICBpZiAoZS5Db2RlICE9PSAnQnVja2V0QWxyZWFkeU93bmVkQnlZb3UnICYmIGUuQ29kZSAhPT0gJ0J1Y2tldEFscmVhZHlFeGlzdHMnKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tNaW5JTyBBUEldIEJ1Y2tldCBjcmVhdGlvbiBlcnJvcjonLCBlLkNvZGUsIGUubWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQWx3YXlzIGFwcGx5IHB1YmxpYyByZWFkL3dyaXRlIHBvbGljeSAoaWRlbXBvdGVudClcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcHVibGljUG9saWN5ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICBWZXJzaW9uOiAnMjAxMi0xMC0xNycsXG4gICAgICAgICAgICAgIFN0YXRlbWVudDogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIEVmZmVjdDogJ0FsbG93JyxcbiAgICAgICAgICAgICAgICAgIFByaW5jaXBhbDogeyBBV1M6IFsnKiddIH0sXG4gICAgICAgICAgICAgICAgICBBY3Rpb246IFsnczM6R2V0T2JqZWN0JywgJ3MzOlB1dE9iamVjdCcsICdzMzpEZWxldGVPYmplY3QnLCAnczM6TGlzdEJ1Y2tldCddLFxuICAgICAgICAgICAgICAgICAgUmVzb3VyY2U6IFtcbiAgICAgICAgICAgICAgICAgICAgYGFybjphd3M6czM6Ojoke2J1Y2tldE5hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgYGFybjphd3M6czM6Ojoke2J1Y2tldE5hbWV9LypgXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGF3YWl0IHMzLnNlbmQobmV3IFB1dEJ1Y2tldFBvbGljeUNvbW1hbmQoeyBCdWNrZXQ6IGJ1Y2tldE5hbWUsIFBvbGljeTogcHVibGljUG9saWN5IH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTWluSU8gQVBJXSBQdWJsaWMgcG9saWN5IGFwcGxpZWQgdG86ICR7YnVja2V0TmFtZX1gKTtcbiAgICAgICAgICB9IGNhdGNoIChwb2xpY3lFcnI6IGFueSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW01pbklPIEFQSV0gUG9saWN5IGVycm9yIChub24tY3JpdGljYWwpOicsIHBvbGljeUVyci5Db2RlIHx8IHBvbGljeUVyci5tZXNzYWdlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgb2s6IHRydWUsIGJ1Y2tldDogYnVja2V0TmFtZSB9KSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gREVMRVRFIC9hcGkvbWluaW8vZGVsZXRlLWJ1Y2tldCBcdTIwMTQgRGVsZXRlIGFsbCBmaWxlcyArIGJ1Y2tldFxuICAgICAgICBpZiAocmVxLnVybCA9PT0gJy9kZWxldGUtYnVja2V0JyAmJiByZXEubWV0aG9kID09PSAnREVMRVRFJykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBbTWluSU8gQVBJXSBSZXF1ZXN0IHRvIERFTEVURSBidWNrZXQ6ICR7YnVja2V0TmFtZX1gKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gMS4gTGlzdCBhbGwgb2JqZWN0cyAodG8gZW5zdXJlIGJ1Y2tldCBpcyBlbXB0eSBiZWZvcmUgZGVsZXRpb24pXG4gICAgICAgICAgICBjb25zdCBsaXN0ZWQgPSBhd2FpdCBzMy5zZW5kKG5ldyBMaXN0T2JqZWN0c1YyQ29tbWFuZCh7IEJ1Y2tldDogYnVja2V0TmFtZSB9KSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChsaXN0ZWQuQ29udGVudHMgJiYgbGlzdGVkLkNvbnRlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coYFtNaW5JTyBBUEldIENsZWFuaW5nICR7bGlzdGVkLkNvbnRlbnRzLmxlbmd0aH0gb2JqZWN0cyBmcm9tICR7YnVja2V0TmFtZX0uLi5gKTtcbiAgICAgICAgICAgICAgYXdhaXQgczMuc2VuZChuZXcgRGVsZXRlT2JqZWN0c0NvbW1hbmQoe1xuICAgICAgICAgICAgICAgIEJ1Y2tldDogYnVja2V0TmFtZSxcbiAgICAgICAgICAgICAgICBEZWxldGU6IHsgT2JqZWN0czogbGlzdGVkLkNvbnRlbnRzLm1hcChvID0+ICh7IEtleTogby5LZXkhIH0pKSB9XG4gICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gMi4gRGVsZXRlIHRoZSBidWNrZXQgaXRzZWxmXG4gICAgICAgICAgICBhd2FpdCBzMy5zZW5kKG5ldyBEZWxldGVCdWNrZXRDb21tYW5kKHsgQnVja2V0OiBidWNrZXROYW1lIH0pKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBbTWluSU8gQVBJXSBTdWNjZXNzZnVsbHkgZGVsZXRlZCBidWNrZXQ6ICR7YnVja2V0TmFtZX1gKTtcbiAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBvazogdHJ1ZSwgbWVzc2FnZTogJ0J1Y2tldCBkZWxldGVkJyB9KSk7XG4gICAgICAgICAgfSBjYXRjaCAoZTogYW55KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGBbTWluSU8gQVBJXSBEZWxldGlvbiBlcnJvciBmb3IgJHtidWNrZXROYW1lfTpgLCBlLm5hbWUgfHwgZS5Db2RlLCBlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBJZiBidWNrZXQgZG9lc24ndCBleGlzdCwgd2UgY29uc2lkZXIgaXQgXCJkZWxldGVkXCIgKHN1Y2Nlc3MpXG4gICAgICAgICAgICBpZiAoZS5uYW1lID09PSAnTm9TdWNoQnVja2V0JyB8fCBlLkNvZGUgPT09ICdOb1N1Y2hCdWNrZXQnKSB7XG4gICAgICAgICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBvazogdHJ1ZSwgbWVzc2FnZTogJ0J1Y2tldCBhbHJlYWR5IGdvbmUnIH0pKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgb2s6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlLCBjb2RlOiBlLm5hbWUgfHwgZS5Db2RlIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XG4gICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBlcnJvcjogJ05vdCBmb3VuZCcgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODEsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIG1pbmlvQXBpUGx1Z2luKCksXG4gICAgYmFzaWNTc2woKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXNTLFNBQVMsb0JBQW9CO0FBQ25VLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsT0FBTyxjQUFjO0FBSnJCLElBQU0sbUNBQW1DO0FBT3pDLFNBQVMsaUJBQWlCO0FBQ3hCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUFhO0FBQzNCLGFBQU8sWUFBWSxJQUFJLGNBQWMsT0FBTyxLQUFVLFFBQWE7QUFFakUsY0FBTSxFQUFFLFVBQVUscUJBQXFCLHdCQUF3QixzQkFBc0Isc0JBQXNCLG9CQUFvQixJQUFJLE1BQU0sT0FBTyxnR0FBb0I7QUFFcEssY0FBTSxXQUFhO0FBQ25CLGNBQU0sYUFBYTtBQUNuQixjQUFNLGFBQWE7QUFFbkIsY0FBTSxLQUFLLElBQUksU0FBUztBQUFBLFVBQ3RCLFVBQVU7QUFBQSxVQUNWLGFBQWEsRUFBRSxhQUFhLFlBQVksaUJBQWlCLFdBQVc7QUFBQSxVQUNwRSxRQUFRO0FBQUEsVUFDUixnQkFBZ0I7QUFBQSxRQUNsQixDQUFDO0FBRUQsWUFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsWUFBSSxVQUFVLCtCQUErQixHQUFHO0FBR2hELFlBQUksT0FBTztBQUNYLFlBQUksR0FBRyxRQUFRLENBQUMsVUFBZTtBQUFFLGtCQUFRO0FBQUEsUUFBTyxDQUFDO0FBQ2pELGNBQU0sSUFBSSxRQUFRLE9BQUssSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBRXZDLGNBQU0sVUFBVSxPQUFPLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQztBQUczQyxjQUFNLGlCQUFpQixRQUFRLGdCQUFnQixJQUM1QyxZQUFZLEVBQ1osVUFBVSxLQUFLLEVBQUUsUUFBUSxvQkFBb0IsRUFBRSxF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
