#!/usr/bin/python
# -*- coding: utf-8 -*-
import csv
import hashlib
import base64
import json
import datetime
import pycountry

events = {}
users = {}

def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False

def build_user(fname, lname, sex, country):
    return {
        'fname': fname,
        'lname': lname,
        'sex': sex,
        'tmp': '{} {}'.format(lname, fname).strip(),
        'country': country,
    }

def get_user_data(row):
    return row['Rider Last Name'], row['Rider First Name'], row['Rider M/F'], row['Rider Country']

def hash_it(s):
    return hashlib.md5(base64.b64encode(s.encode('utf-8'))).hexdigest()

# countries
with open('./exported/events.csv', newline='', encoding='utf-8') as csvfile:
    countries_tmp = {}
    events_reader = csv.DictReader(csvfile)

    for row in events_reader:
        c = row['Event Country']
        if c not in countries:
            countries_tmp[c] = c

    clist = {}
    for country in pycountry.countries:
        clist[country.name.lower()] = country.alpha_2
        clist[country.name.lower().split(',')[0]] = country.alpha_2
    clist['russia'] = 'RU'

    for c in countries_tmp.values():
        cid = c.lower().replace(' & ', ' and ')

        if cid in clist:
            cid = clist[cid]
        else:
            print(json.dumps(clist, indent=4))
            raise Exception('Country not found in list: {}'.format(cid))

        if cid not in countries:
            countries[cid] = {
                'name': c
            }
    with open('./data/countries.json', 'w', encoding='utf-8') as out:
        json.dump(countries, out, ensure_ascii=False, indent=4)

with open('./exported/events.csv', newline='', encoding='utf-8') as csvfile:
    events_reader = csv.DictReader(csvfile)
    for row in events_reader:
        if row['Event ID'] not in events:
            date = datetime.datetime.strptime(row['Event Date'], '%d-%b-%y').isoformat()

            events[row['Event ID']] = {
                'id': row['Event ID'],
                'country': row['Event Country'],
                'organizer': row['Event Organizer'],
                'dist': row['Event Distance'],
                'club': row['Organizing Club'],
                'name': row['Event Name'],
                'date': date,
            }

    with open('./data/events.json', 'w', encoding='utf-8') as out:
        json.dump(events, out, ensure_ascii=False)

def get_event_data(row, uid):
    return row['Certificate'], row['Event ID'], uid, row['Rider Time']

with open('./exported/results.csv', newline='', encoding='utf-8') as csvfile:
    csv_reader = csv.DictReader(csvfile)

    results = []

    for row in csv_reader:
        lname, fname, sex, country = get_user_data(row)

        if is_int(lname):
            tmp = fname.split(' ', 1)
            lname = tmp[0]
            fname = tmp[1]

        key = '{}-{}'.format(lname, fname).lower().strip()
        uid = hash_it(key)

        if uid not in users:
            users[uid] = build_user(fname, lname, sex, country)

        cert, eid, uid, time = get_event_data(row, uid)
        results.append({
            "cert": cert,
            "eid":  int(eid),
            "uid": uid,
            "time": time,
        })

    with open('./data/users.json', 'w', encoding='utf-8') as out:
        json.dump(users, out, ensure_ascii=False, indent=2)

    with open('./data/results.json', 'w', encoding='utf-8') as out:
        json.dump(results, out, ensure_ascii=False, indent=2)

with open('./exported/results.csv', newline='', encoding='utf-8') as csvfile:
    csv_reader = csv.DictReader(csvfile)

    for row in csv_reader:
        lname, fname, sex, country = get_user_data(row)

        if is_int(lname):
            lname = ''

        key = '{}-{}'.format(lname, fname).strip()
        uid = hash_it(key)

        if uid not in users:
            users[uid] = build_user(fname, lname, sex, country)

    with open('./data/users.alt.json', 'w', encoding='utf-8') as out:
        json.dump(users, out, ensure_ascii=False, indent=2)

for path in [ 'countries',  'events',  'results', 'users' ]:
    with open('./data/{}.json'.format(path), 'r', encoding='utf-8') as fin:
        with open('./data/{}.js'.format(path), 'w', encoding='utf-8') as fout:
            data = fin.read()
            fout.write('window.{} = {};'.format(path, data))

