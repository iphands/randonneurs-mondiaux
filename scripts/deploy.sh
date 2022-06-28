#!/bin/bash
set -e
scp -P666 ./build/deploy.tbz iphands@ahands.org:~/
ssh -p666 iphands@ahands.org 'cd /var/www/ahands/ian/rm-tmp/ && tar xvf ~/deploy.tbz'
