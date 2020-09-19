#!/bin/bash
if [ -z "$TRAVIS" ] ; then source ./secret/env.sh ; fi
URL="https://docs.google.com/spreadsheets/d/${GOOGLE_DOC_ID}/gviz/tq?tqx=out:csv"
curl -v "${URL}&sheet=Results%20List" > ./exported/results.csv
curl -v "${URL}&sheet=Events%20List" > ./exported/events.csv
