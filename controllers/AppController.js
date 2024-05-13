#!/usr/bin/node

import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppConroller {
  static getStatus(req, res) {
    const status = { redis: redisClient.isAlive(), db: dbClient.isAlive() };
    res.json(status);
  }

  static getStat(req, res) {
    const stat = { users: dbClient.nbUsers(), files: dbClient.nbFiles() };
    res.json(stat);
  }
}

export default AppConroller;
