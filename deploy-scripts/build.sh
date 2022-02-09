#!/bin/bash

# catch errors
set -euo pipefail

nvm use 14
npm install
npm run build
