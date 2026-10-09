#!/usr/bin/env bash
set -euo pipefail
cd /workspace

if [[ ! -f .env ]]; then
  cp .env.example .env
fi

mkdir -p database uploads

if ! tmux has-session -t career_api 2>/dev/null; then
  tmux new-session -d -s career_api "node server/index.js 2>&1 | tee /tmp/career-api.log"
fi

for _ in $(seq 1 60); do
  if curl -sf http://127.0.0.1:5000/api/health >/dev/null; then
    break
  fi
  sleep 1
done

if ! tmux has-session -t career_web 2>/dev/null; then
  tmux new-session -d -s career_web "cd client && BROWSER=none HOST=0.0.0.0 PORT=3000 npm start 2>&1 | tee /tmp/career-web.log"
fi

for _ in $(seq 1 120); do
  if curl -sf http://127.0.0.1:3000 >/dev/null; then
    exit 0
  fi
  sleep 2
done

echo "Frontend did not become ready within timeout" >&2
exit 1
