FROM docker.io/denoland/deno:latest

WORKDIR /app/yoinked

ADD . .

RUN deno cache src/main.ts

RUN deno install -f --allow-net --allow-read --name yoinked src/main.ts

CMD /usr/local/bin/yoinked
