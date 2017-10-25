// get laravel .env
require('dotenv').config();

const server = require('laravel-echo-server');

const authHost = process.env.APP_URL || 'http://localhost';
const redis = {};

if (process.env.REDIS_SCHEME === 'unix') {
	redis.path = process.env.REDIS_SOCKET || '/var/run/redis/redis.sock';
}
else {
	redis.host = process.env.REDIS_HOST || 'localhost';
	redis.port = process.env.REDIS_PORT || 6379;
}

server.run({
	authHost,
	authEndpoint: '/broadcasting/auth',
	// ignored when using with Nginx + Passenger
	port: process.env.WS_PORT || 6001,
	clients: [],
	database: 'redis',
	databaseConfig: { redis },
	devMode: process.env.APP_DEBUG !== 'false',
	socketio: { wsEngine: 'uws' }
});