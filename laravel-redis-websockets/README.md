# Websockets server and client example

* [Installation docs](https://laravel.com/docs/5.5/broadcasting#installing-laravel-echo),
* [Using with notifications](https://laravel.com/docs/5.5/notifications#broadcast-notifications)

Install deps

```bash
npm i -S laravel-echo laravel-echo-server uws dotenv
```

Run server

```bash
node server
```

Load socket.io script

```html
<script src="scheme://host:port/socket.io/socket.io.js"></script>
```

Use client code

```javascript
import Echo from 'laravel-echo';

// just for example
let token = window.localStorage.authToken;

const echo = new Echo({
    broadcaster: 'socket.io',
    host: 'scheme://host:port',
    auth: {
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }
});
```