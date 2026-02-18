#!/bin/bash
export PATH=$PATH:/root/.bun/bin
cd /root/ticketera/server
curl -s http://127.0.0.1:3000/api/master/organizers
