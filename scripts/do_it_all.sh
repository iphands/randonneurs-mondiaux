#!/bin/bash
set -e
bash scripts/get_exported.sh
bash scripts/build.sh
bash scripts/deploy.sh
bash scripts/ftp_deploy.sh
