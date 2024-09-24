FROM docker.io/denoland/deno:latest

WORKDIR /app/yoinked

ADD . .

RUN deno cache src/main.ts

RUN deno install -f --global --allow-env --allow-net --allow-read --allow-sys --name yoinked src/main.ts

CMD /usr/local/bin/yoinked
