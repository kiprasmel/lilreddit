#!/usr/bin/env bash

cd server/
docker-compose up -d

cd ../

yarn --cwd server/ dev
