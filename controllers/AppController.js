#!/usr/bin/node

import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppConroller {
  static getStatus(req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    const status = { redis: redisStatus, db: dbStatus };
    res.json(status);
  }

  static async getStat(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    const stat = { users: nbUsers, files: nbFiles };
    res.json(stat);
  }
}

export default AppConroller;
