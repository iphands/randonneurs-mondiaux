#!/bin/bash
source venv/bin/activate
time python process_data.py && wc -l data/*json
fgrep tmp data/users.alt.json | sort >/tmp/1
fgrep tmp data/users.json | sort >/tmp/2
meld /tmp/1 /tmp/2
