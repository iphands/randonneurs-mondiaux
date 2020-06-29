#!/bin/bash
set -e
bash ./scripts/build.sh
source ./secret/ftp.sh

cd frontend

lftp -u "${USER},${PASS}" markuthomas.pairserver.com << EOF

cd
put index.html

cd ./js
put ./js/main.js
put ./js/vendor.js
cd ..

cd ./data
put ./data/countries.js
put ./data/users.js
put ./data/events.js
put ./data/results.js
cd ..

bye
EOF
