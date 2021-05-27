#!/usr/bin/env bash

# TODO SECRET (dbname, username)
psql -h localhost -p 5432 -d lilreddit -U admin
