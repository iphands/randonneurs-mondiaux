#!/bin/bash
set -e
bash ./scripts/build.sh

scp -P666 ./build/deploy.tbz iphands@ahands.org:~/
ssh -p666 iphands@ahands.org 'cd ~/www/ahands/ian/rm-tmp/ && tar xvf ~/deploy.tbz'
