#!/usr/bin/env bash
# Read-only Contabo/OpenClaw inventory. Does not print env values or config contents.
set -Eeuo pipefail

section() { printf '\n===== %s =====\n' "$1"; }
have() { command -v "$1" >/dev/null 2>&1; }

section "Timestamp and host"
date -Is 2>/dev/null || date
hostname
uname -a
[ -r /etc/os-release ] && . /etc/os-release && printf 'OS=%s %s\n' "${PRETTY_NAME:-unknown}" "${VERSION_ID:-}"

section "Uptime and capacity"
uptime 2>/dev/null || true
if have free; then free -h; fi
if have df; then df -hT / /home 2>/dev/null || df -hT /; fi
if have nproc; then printf 'CPU_CORES='; nproc; fi

section "Network listeners (review before sharing)"
if have ss; then ss -lnt 2>/dev/null || true; else echo "ss not installed"; fi

section "Firewall"
if have ufw; then ufw status 2>&1 | sed -E 's/(token|password|secret|key)=([^ ]+)/\1=[REDACTED]/Ig' || true; fi
if have firewall-cmd; then firewall-cmd --state 2>&1 || true; fi
if have iptables; then iptables -S INPUT 2>/dev/null | head -40 || true; fi

section "SSH service configuration summary"
for unit in ssh sshd; do
  if have systemctl && systemctl list-unit-files "${unit}.service" --no-legend 2>/dev/null | grep -q "${unit}.service"; then
    printf '%s active=' "$unit"; systemctl is-active "$unit" 2>/dev/null || true
    printf '%s enabled=' "$unit"; systemctl is-enabled "$unit" 2>/dev/null || true
  fi
done

section "OpenClaw installation (no config output)"
if have openclaw; then
  printf 'openclaw_path='; command -v openclaw
  openclaw --version 2>&1 | head -3 || true
else
  echo "openclaw command not found in this user's PATH"
fi
if have systemctl; then
  for unit in openclaw openclaw-gateway; do
    if systemctl list-unit-files "${unit}.service" --no-legend 2>/dev/null | grep -q "${unit}.service"; then
      printf '%s active=' "$unit"; systemctl is-active "$unit" 2>/dev/null || true
      systemctl show "$unit" -p User -p FragmentPath -p ActiveState -p SubState --no-pager 2>/dev/null || true
    fi
  done
fi

section "Docker inventory (names/images/status only)"
if have docker; then
  docker version --format 'client={{.Client.Version}} server={{.Server.Version}}' 2>/dev/null || true
  docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || true
else
  echo "docker not installed or unavailable to this user"
fi

section "Fail2ban"
if have fail2ban-client; then fail2ban-client status 2>&1 || true; else echo "fail2ban-client not installed"; fi

section "Runtime versions"
for bin in node npm pnpm python3 git; do
  if have "$bin"; then printf '%s=' "$bin"; "$bin" --version 2>&1 | head -1; else printf '%s=not-found\n' "$bin"; fi
done

section "OpenClaw data-path metadata (names and permissions only)"
for p in "$HOME/.openclaw" "$HOME/.config/openclaw" /home/ubuntu/clawguide; do
  if [ -e "$p" ]; then stat -c '%A %U:%G %n' "$p" 2>/dev/null || ls -ld "$p"; fi
done

section "End"
echo "Read-only inventory complete. No services, firewall rules, files, containers, or credentials were changed."
