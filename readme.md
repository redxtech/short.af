# yoinked
> a simple, self hosted url shortener.

## setup
you can run the app after choosing some configuration options, get a template with `cp config.example.ts config.ts`.

here are the available config options, custom types are imported in `config.example.ts`:
 - `port`: number, port that yoinked will run on
 - `googleSafeBrowsingKey`: string | boolean, either a google api key for the safe browsing api, or false to disable checking
 - `mongo`: MongoConfig, database access information

## usage
once configured, you should be able to run it with `deno run ./src/main.ts`, or to pass all permissions, `deno run --allow-net --allow-read ./src/main.ts`.

you can shorten new urls from the home page (`/`).

if you're not using docker-compose, you will need to change the `mongo.host` property in `config.ts` to point at the ip of the mongo instance you will be using.

### docker
i've build a dockerfile and a compose file for easy running. `docker compose up --build` in the should start it up. `docker compose up --build -d` will detach from the log. bring it down with `docker compose down`.

due to how the app and the container work, you will need to rebuild the container every time you edit `config.ts`. this is because it gets copied into the container before building, as it's required for the build to succeed.

keep in mind you will need to change the config to use the mongo container's ip in order to connect to it. if you're using docker-compose, this should work with the default values.

## endpoints

### `GET /`
will show a simple homepage with a form to create shortcuts

### `GET /:from`
will 302 redirect you to the destination if it exists, and 404 otherwise

### `GET /expand/:from`
will show the destination in plaintext if it exists, and 404 otherwise

### `POST /shorten`: `{ from, to }`
will create a shortened link, will respond with 201 on successful add, 403 if it's a malicious url, 422 if a link with that same name already exists, and 400 for other failures

