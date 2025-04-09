#!/bin/bash

cd app/Chives
git fetch origin
git reset --hard origin/main
git pull origin main
npm install
pm2 restart index
