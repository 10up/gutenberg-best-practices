#!/bin/bash

# catch errors
set -euo pipefail
# output to logs
set -x

rsync -vrxc --delete build/ gitlab@147.182.201.45:/var/www/gutenberg.10up.com/
