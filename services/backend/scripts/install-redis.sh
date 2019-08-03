#!/usr/bin/env bash

if [ -d "vendor/redis-stable" ]; then
    echo "Redis already exists."
    exit 0
fi

mkdir -p vendor/
cd vendor/

# Download redis
curl -O http://download.redis.io/redis-stable.tar.gz
tar xzvf redis-stable.tar.gz
cd redis-stable/

# Build and Install Redis
make

# Cleanup
cd ../
rm -f redis-stable.tar.gz
