#!/bin/bash
set -e

echo "#### Downloading csv data:"
time bash scripts/get_exported.sh

echo "#### Running build:"
time bash scripts/build.sh

if [ -z "$TRAVIS" ]
then
    echo "#### Deploying to ahands.org:"
    time bash scripts/deploy.sh
fi

echo "#### Deploying to www.randonneur.me:"
time bash scripts/ftp_deploy.sh
