#!/bin/bash
export PATH=$PATH:/root/.bun/bin
cd /root/ticketera/server
bun run db:push
