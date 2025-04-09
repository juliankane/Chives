#!/bin/bash

cd app/Chives
echo "Fetching from origin..."
git fetch origin
git reset --hard origin/main
git pull origin main
npm install

if  pm2 pid index > /dev/null; then
    pm2 restart index
else
    pm2 start index
fi 
