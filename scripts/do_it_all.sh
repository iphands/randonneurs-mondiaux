#!/bin/bash
set -e

echo "#### Downloading csv data:"
bash scripts/get_exported.sh

echo "#### Running build:"
bash scripts/build.sh

echo "#### Deploying to ahands.org:"
if [ -z "$TRAVIS" ] ; then bash scripts/deploy.sh ; fi

echo "#### Deploying www.randonneur.me:"
bash scripts/ftp_deploy.sh
