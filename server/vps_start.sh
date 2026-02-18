#!/bin/bash
export PATH=$PATH:/root/.bun/bin
cd /root/ticketera/server
fuser -k 3000/tcp || true
nohup bun run dev > server.log 2>&1 &
echo "Server started in background"
