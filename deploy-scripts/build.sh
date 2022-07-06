#!/bin/bash

# catch errors
set -euo pipefail

nvm use 16
npm install
npm run build
