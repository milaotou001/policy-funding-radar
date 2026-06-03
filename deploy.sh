#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="policy-funding-radar"
PROJECT_PATH="/www/wwwroot/policy-funding-radar"
BRANCH="master"
PM2_NAME="policy-funding-radar"
PORT="3003"

echo "Deploying ${PROJECT_NAME} from ${BRANCH}"

cd "${PROJECT_PATH}"
git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git pull origin "${BRANCH}"

npm install
npm run build

if pm2 describe "${PM2_NAME}" >/dev/null 2>&1; then
  pm2 restart "${PM2_NAME}"
else
  pm2 start npm --name "${PM2_NAME}" -- run preview -- --host 127.0.0.1 --port "${PORT}"
fi

pm2 save
