#!/bin/bash
set -e
if [ -z "$TRAVIS" ] ; then source ./secret/env.sh ; fi

cd ./build/frontend

lftp -u "${FTP_USER},${FTP_PASS}" markuthomas.pairserver.com << EOF

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
