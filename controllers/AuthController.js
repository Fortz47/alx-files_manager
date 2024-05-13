#!/usr/bin/node

import dbClient from "../utils/db";
import redisClient from "../utils/redis";
import crypto from 'crypto';
import {uuidv4} from 'uuid';

class AuthController {
  async getConnect(req, res) {
    const basicAuthHeader = req.header('Authorization');
    if (!basicAuthHeader || !basicAuthHeader.startsWith('Basic ')) {
      res.status(401).send({error: 'Unauthorized'});
      return;
    }
    const encodedString = basicAuthHeader.split(' ')[1];
    const decodedString = Buffer.from(encodedString, 'base64').toString('utf-8');
    const {email, password} = decodedString.split(':');
    const user = await dbClient.getDocumentInCollectionByProperty('users', {'email': email});
    if (!user) {
      res.status(401).send({error: 'Unauthorized'});
      return;
    }
    const hash = crypto.createHash('sha1');
    hash.update(password);
    if (hash.digest('hex') !== user.password) {
      res.status(401).send({error: 'Unauthorized'});
      return;
    }
    const token = uuidv4();
    redisClient.set(`auth_${token}`, user._id, 86400);
    res.status(200).send({'token': token});
  }

  getDisiconnect() {}

  getMe() {}
}