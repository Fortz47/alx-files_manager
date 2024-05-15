import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const redisStatus = redisClient.isAlive();
    const dbStatus = dbClient.isAlive();
    res.send({ redis: redisStatus, db: dbStatus });
  }

  static async getStat(req, res) {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();
    const stat = { users: nbUsers, files: nbFiles };
    res.send(stat);
  }
}

export default AppController;
