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
tar -cvjf ./build/deploy.tbz frontend
