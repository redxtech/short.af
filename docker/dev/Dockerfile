FROM docker.io/denoland/deno:latest

VOLUME [ "/app/yoinked" ]

WORKDIR /app/yoinked

RUN deno install -qAf --unstable https://deno.land/x/denon/denon.ts

CMD denon run --allow-env --allow-net --allow-read --allow-sys src/main.ts
