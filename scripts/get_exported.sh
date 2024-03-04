#!/bin/bash
if [ -z "$TRAVIS" ] ; then source ./secret/env.sh ; fi
URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vTZrtz-r9coUnQgmOrEzBILQbUwgBY2JM7UqLX_v1qkF1KiMmRqsfciSiL5Ndrbpn16DB8FJtRvirnR/pub?single=true&output=csv"
mkdir -p ./exported

curl -Lv "${URL}&gid=619854825" > ./exported/results.csv
curl -Lv "${URL}&gid=47599129" > ./exported/events.csv

echo
echo "## Sizes"
wc -l ./exported/results.csv
wc -l ./exported/events.csv

test() {
  FILE=$1
  MIN=$2
  SIZE=`wc -l ./exported/${FILE}.csv | awk '{print $1}'`
  if [[ $SIZE < $MIN ]]
  then
    echo "FATAL ERROR: Expected $FILE to be at least $MIN but got $SIZE"
    exit 1
  fi
}

echo
test results 19000
test events 600
