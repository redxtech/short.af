# short.af

> a simple, self hosted url shortener.

## setup

you can get up and running with `npm install` and `npm run dev`, or if you're using nix, you can run `nix run`

the configuration is a single env var, `GOOGLE_SAFE_BROWSING_KEY`, which if present, will be used to check urls against google's safe browsing api.

## endpoints

### `GET /`

will show a simple homepage with a form to create shortcuts

### `GET /:from`

will 302 redirect you to the destination if it exists, and 404 otherwise

### `GET /api/expand/:from`

will return the destination in json `{from, dest}` if it exists, and 404 otherwise

### `POST /api/shorten`: `{from, dest}`

will create a shortened link, will respond with 201 on successful add, 403 if it's a malicious url, 422 if a link with that same name already exists, and 400 for other failures.

successful responses will have a body of `{from, dest}`
