#!/bin/bash

# catch errors
set -euo pipefail

nvm use 18
npm install
npm run build
