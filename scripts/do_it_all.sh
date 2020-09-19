#!/bin/bash
set -e
bash scripts/get_exported.sh
bash scripts/build.sh
if [ -z "$TRAVIS" ] ; then bash scripts/deploy.sh ; fi
bash scripts/ftp_deploy.sh
