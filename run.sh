#!/usr/bin/env bash
#
# Chạy môi trường dev của dự án CTXH:
#   - SQL Server 2022 (Docker)
#   - Backend  .NET 9  -> http://localhost:5000
#   - Frontend Vite    -> http://localhost:5173
#
# Cách dùng:
#   ./run.sh              # chạy tất cả (DB + backend + frontend)
#   ./run.sh backend      # chỉ DB + backend
#   ./run.sh frontend     # chỉ frontend
#   ./run.sh stop         # dừng backend/frontend do script này khởi chạy + container DB
#   ./run.sh --help
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
LOG_DIR="$ROOT_DIR/logs"

BACKEND_PORT=5000
FRONTEND_PORT=5173
BACKEND_PROJECT="src/Ctxh.Api"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"
BACKEND_PID_FILE="$LOG_DIR/backend.pid"
FRONTEND_PID_FILE="$LOG_DIR/frontend.pid"

STARTED_PIDS=()
STOPPING=0

# ---------- tiện ích ----------
info()  { printf '\033[1;34m[run]\033[0m %s\n' "$*"; }
ok()    { printf '\033[1;32m[ ok]\033[0m %s\n' "$*"; }
warn()  { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
fail()  { printf '\033[1;31m[fail]\033[0m %s\n' "$*" >&2; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    fail "Không tìm thấy '$1'. Hãy cài đặt trước khi chạy."
    exit 1
  }
}

is_port_listening() {
  lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
}

wait_for_port() {
  local port="$1" name="$2" timeout="${3:-180}" i=0
  while ! is_port_listening "$port"; do
    i=$((i + 1))
    if [ "$i" -ge "$timeout" ]; then
      fail "$name không mở cổng $port sau ${timeout}s. Xem log bên dưới:"
      tail -n 40 "$LOG_DIR/${name}.log" 2>/dev/null || true
      return 1
    fi
    sleep 1
  done
}

# Dừng cả cây tiến trình (dotnet run sinh tiến trình con).
kill_tree() {
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill "$pid" 2>/dev/null || true
}

cleanup() {
  trap - INT TERM EXIT
  STOPPING=1
  if [ "${#STARTED_PIDS[@]}" -gt 0 ]; then
    info "Đang dừng các tiến trình do script khởi chạy..."
    for pid in "${STARTED_PIDS[@]}"; do
      kill_tree "$pid"
    done
    wait 2>/dev/null || true
  fi
  rm -f "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"
}

# ---------- Docker / SQL Server ----------
ensure_docker() {
  require_cmd docker
  if docker info >/dev/null 2>&1; then
    return 0
  fi
  warn "Docker daemon chưa chạy, đang thử mở Docker Desktop..."
  if [ "$(uname -s)" = "Darwin" ] && [ -d "/Applications/Docker.app" ]; then
    open -a Docker
  fi
  local i=0
  until docker info >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -ge 60 ]; then
      fail "Không khởi động được Docker sau 60s. Hãy mở Docker Desktop rồi chạy lại."
      exit 1
    fi
    sleep 2
  done
  ok "Docker đã sẵn sàng"
}

start_db() {
  info "Khởi động SQL Server (docker compose)..."
  (cd "$ROOT_DIR" && docker compose up -d sqlserver)

  local i=0 status=""
  while :; do
    status="$(docker inspect --format '{{.State.Health.Status}}' ctxh-sqlserver 2>/dev/null || echo missing)"
    case "$status" in
      healthy) ok "SQL Server sẵn sàng tại localhost:1433"; break ;;
      missing|unhealthy)
        fail "Container ctxh-sqlserver ở trạng thái: $status"
        docker logs --tail 30 ctxh-sqlserver 2>/dev/null || true
        exit 1
        ;;
    esac
    i=$((i + 1))
    if [ "$i" -ge 60 ]; then
      fail "SQL Server chưa healthy sau 120s (trạng thái: $status)."
      exit 1
    fi
    sleep 2
  done
}

# ---------- Backend ----------
start_backend() {
  if is_port_listening "$BACKEND_PORT"; then
    warn "Cổng $BACKEND_PORT đã có tiến trình — bỏ qua backend (dùng ./run.sh stop để dọn)."
    return 0
  fi

  require_cmd dotnet
  mkdir -p "$LOG_DIR"
  info "Build & chạy backend (.NET) — log: $BACKEND_LOG"
  (
    cd "$BACKEND_DIR"
    exec dotnet run --project "$BACKEND_PROJECT" --launch-profile http
  ) >"$BACKEND_LOG" 2>&1 &
  local pid=$!
  STARTED_PIDS+=("$pid")
  echo "$pid" >"$BACKEND_PID_FILE"

  if ! wait_for_port "$BACKEND_PORT" backend 240; then
    exit 1
  fi
  ok "Backend: http://localhost:$BACKEND_PORT (Scalar API docs: /scalar/v1)"
}

# ---------- Frontend ----------
start_frontend() {
  if is_port_listening "$FRONTEND_PORT"; then
    warn "Cổng $FRONTEND_PORT đã có tiến trình — bỏ qua frontend (dùng ./run.sh stop để dọn)."
    return 0
  fi

  require_cmd npm
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    info "Chưa có node_modules, đang chạy npm install..."
    (cd "$FRONTEND_DIR" && npm install)
  fi

  mkdir -p "$LOG_DIR"
  info "Chạy frontend (Vite) — log: $FRONTEND_LOG"
  (
    cd "$FRONTEND_DIR"
    exec npm run dev
  ) >"$FRONTEND_LOG" 2>&1 &
  local pid=$!
  STARTED_PIDS+=("$pid")
  echo "$pid" >"$FRONTEND_PID_FILE"

  if ! wait_for_port "$FRONTEND_PORT" frontend 120; then
    exit 1
  fi
  ok "Frontend: http://localhost:$FRONTEND_PORT"
}

# ---------- stop ----------
stop_all() {
  info "Dừng backend/frontend..."
  for file in "$BACKEND_PID_FILE" "$FRONTEND_PID_FILE"; do
    if [ -f "$file" ]; then
      kill_tree "$(cat "$file")"
      rm -f "$file"
    fi
  done
  # Dọn tiến trình còn sót lại trên cổng dev.
  for port in "$BACKEND_PORT" "$FRONTEND_PORT"; do
    local pids
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    [ -n "$pids" ] && kill $pids 2>/dev/null || true
  done
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    (cd "$ROOT_DIR" && docker compose stop sqlserver) >/dev/null 2>&1 || true
    ok "Đã dừng SQL Server"
  fi
  ok "Đã dọn xong"
}

usage() {
  awk 'NR > 1 && /^#/ { sub(/^# ?/, ""); print; next } NR > 1 { exit }' "${BASH_SOURCE[0]}"
}

# ---------- main ----------
main() {
  local target="${1:-all}"
  case "$target" in
    -h|--help|help) usage; exit 0 ;;
    stop) stop_all; exit 0 ;;
    all|backend|frontend) ;;
    *) fail "Tham số không hợp lệ: $target"; usage; exit 1 ;;
  esac

  mkdir -p "$LOG_DIR"
  trap cleanup INT TERM EXIT

  if [ "$target" = "all" ] || [ "$target" = "backend" ]; then
    ensure_docker
    start_db
    start_backend
  fi
  if [ "$target" = "all" ] || [ "$target" = "frontend" ]; then
    start_frontend
  fi

  if [ "${#STARTED_PIDS[@]}" -eq 0 ]; then
    warn "Không có tiến trình nào được khởi chạy (cổng đã bận)."
    trap - INT TERM EXIT
    exit 0
  fi

  echo
  ok "Môi trường dev đang chạy. Ctrl+C để dừng."
  echo "     Backend  : http://localhost:$BACKEND_PORT  (log: logs/backend.log)"
  echo "     Frontend : http://localhost:$FRONTEND_PORT  (log: logs/frontend.log)"
  echo

  # Giữ script sống và thoát nếu một tiến trình chết.
  while :; do
    if [ "$STOPPING" -eq 1 ]; then
      exit 0
    fi
    for pid in "${STARTED_PIDS[@]}"; do
      if ! kill -0 "$pid" 2>/dev/null; then
        if [ "$STOPPING" -eq 1 ]; then
          exit 0
        fi
        fail "Một tiến trình đã dừng (pid $pid). Xem log trong $LOG_DIR/"
        exit 1
      fi
    done
    sleep 2
  done
}

main "$@"
