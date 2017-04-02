# place-scraper-node (Formerly https://github.com/moustacheminer/place)
Intercepts the incoming websocket frams from [/r/place](https://reddit.com/r/place) and inserts them into a MySQL database

## Install
Git clone this repo, and then install all the node modules by doing:

```bash
npm i
```

## Config
Copy or rename `config.default.json` to `config.json` and add in your server specifics

config.json:
```json
{
	"host": "127.0.0.1",
	"password": "supersecretpassword",
	"user": "reddit",
	"database": "reddit"
}
```