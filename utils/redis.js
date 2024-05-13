#!/usr/bin/node

import { createClient } from 'redis-promisify';

class RedisClient {
  // _status = false;

  constructor() {
    this._status = false;
    this.client = {};
    // this.client = createClient()
    //   .on('error', (err) => {
    //     console.log('Error connecting to Redis: ' + err);
    //   })
    //   .on('connect', () => {
    //     this._status = true;
    //   });
  }

  isAlive() {
    return this._status;
  }

  async get(key) {
    return await this.client.getAsync(key);
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