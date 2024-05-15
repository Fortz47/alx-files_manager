import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { userAuth } from '../utils/utility';

class AuthController {
  static async getConnect(req, res) {
    const basicAuthHeader = req.header('Authorization');
    if (!basicAuthHeader || !basicAuthHeader.startsWith('Basic ')) {
      res.status(401).send({ error: 'Unauthorized' });
      return false;
    }
    const encodedString = basicAuthHeader.split(' ')[1];
    const decodedString = Buffer.from(encodedString, 'base64').toString('utf-8');
    const email = decodedString.split(':')[0];
    const password = decodedString.split(':')[1];
    const user = await dbClient.getDocumentInCollectionByProperty('users', { email });
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return false;
    }
    const hash = crypto.createHash('sha1');
    hash.update(password);
    if (hash.digest('hex') !== user.password) {
      res.status(401).send({ error: 'Unauthorized' });
      return false;
    }
    const token = uuidv4();
    try {
      await redisClient.set(`auth_${token}`, user._id.toString(), 86400);
    } catch (err) {
      console.log(`Failed to save auth_token in Redis: ${err}`);
    }
    res.status(200).send({ token });
    return true;
  }

  static async getDisconnect(req, res) {
    const user = userAuth.authUser(req, res);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return false;
    }
    const token = req.header('X-Token');
    await redisClient.del(`auth_${token}`);
    res.status(204).end();
    return true;
  }
}

export default AuthController;
