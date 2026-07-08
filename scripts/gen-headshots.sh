#!/usr/bin/env bash
# Generates placeholder therapist headshots via Nano Banana Pro.
# Consistent style: professional, warm, soft muted teal-gray background, square.
set -u

GEN="$HOME/.claude/skills/nano-banana-pro/scripts/generate_image.py"
OUT="public/therapists"
mkdir -p "$OUT"

STYLE="Professional studio headshot portrait, head and shoulders, looking at camera, warm genuine approachable smile, calm and trustworthy, soft even natural lighting, plain smooth muted sage teal-gray background (#DCEAE7), shallow depth of field, photorealistic, sharp focus on face, centered square composition, the look of a caring licensed mental-health professional."

# id|subject description
ROWS=(
  "maya-okafor|a Black Nigerian-American woman in her early 40s, short natural curly hair, subtle elegant earrings, professional blazer"
  "daniel-reyes|a Latino man in his late 30s, short dark hair, light stubble, soft knit sweater"
  "sarah-bensen|a white woman in her mid 40s, shoulder-length blonde-brown hair, gentle expression, simple blouse"
  "james-whitfield|a Black man in his early 50s, short greying hair, warm fatherly pastoral presence, glasses, button-up shirt"
  "priya-nair|a South Asian Indian woman in her early 40s, long dark hair, warm brown eyes, professional top"
  "rebecca-stein|a white woman in her early 30s, dark wavy shoulder-length hair, friendly bright expression, casual professional blouse"
  "marcus-bell|a Black man in his early 30s, short fade haircut, neat short beard, relaxed crewneck"
  "aisha-rahman|a Muslim woman in her mid 30s wearing a tasteful soft-toned hijab, warm kind eyes, gentle smile"
  "tom-castellano|an older Italian-American white man in his mid 50s, short greying hair, kind weathered face, open-collar shirt"
  "grace-lim|a Korean East-Asian woman in her late 30s, sleek dark bob haircut, friendly slightly nerdy warmth, professional top"
  "noah-feldman|a young androgynous non-binary white person around 30, short tidy modern haircut, soft neutral expression, minimal jewelry"
  "helen-park|a Korean East-Asian woman in her early 50s, elegant dark hair with subtle grey, composed reassuring presence, refined blazer"
)

pids=()
i=0
for row in "${ROWS[@]}"; do
  id="${row%%|*}"
  desc="${row#*|}"
  prompt="$STYLE Subject: $desc."
  echo ">> generating $id"
  uv run "$GEN" --prompt "$prompt" --filename "$OUT/$id.png" --resolution 1K > "/tmp/gen-$id.log" 2>&1 &
  pids+=($!)
  i=$((i+1))
  # throttle to 3 concurrent to avoid rate limits
  if (( i % 3 == 0 )); then
    wait "${pids[@]}"
    pids=()
  fi
done
wait "${pids[@]}" 2>/dev/null

echo "=== results ==="
for row in "${ROWS[@]}"; do
  id="${row%%|*}"
  if [[ -f "$OUT/$id.png" ]]; then
    sz=$(stat -f%z "$OUT/$id.png" 2>/dev/null || echo 0)
    echo "OK   $id.png ($sz bytes)"
  else
    echo "FAIL $id.png"
    tail -3 "/tmp/gen-$id.log" 2>/dev/null | sed 's/^/       /'
  fi
done
