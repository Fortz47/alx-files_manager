#!/usr/bin/node

import { createClient } from 'redis-promisify';

class RedisClient {
  constructor() {
    this.client = {};
    this.client = createClient()
      .on('error', (err) => {
        console.log(`Error connecting to Redis: ${err}`);
      });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const value = await this.client.getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    await this.client.setAsync(key, value);
    await this.client.expireAsync(key, duration);
  }

  async del(key) {
    await this.client.delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
