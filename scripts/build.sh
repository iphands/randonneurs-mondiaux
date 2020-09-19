#!/bin/bash
set -e
source venv/bin/activate
python process_data.py
mkdir -p ./frontend/data

for var in countries.js users.js events.js results.js
do
    cp ./data/$var ./frontend/data/
done

mkdir -p build
cp -r frontend build/
build_id=`date | md5sum | awk '{print $1}'`
sed -s "s/__BUSTER__/$build_id/g" -i build/frontend/index.html

tar -cvjf ./build/deploy.tbz -C ./build frontend
