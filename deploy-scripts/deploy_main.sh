#!/bin/bash

cd app/Chives
git pull origin main
npm install
pm2 restart index
