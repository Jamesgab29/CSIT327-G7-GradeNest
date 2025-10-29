#!/usr/bin/env bash
set -o errexit

pip install -r requirments.txt
npm ci
npm run build
python manage.py collectstatic --noinput
python manage.py migrate