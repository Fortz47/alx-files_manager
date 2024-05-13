#!/usr/bin/node

import dbClient from '../utils/db';
import crypto from 'crypto';

class UsersController {
  static async postNew(req, res) {
    const body = req.body;
    if (!body.email) {
      res.status(400).send({ error: 'Missing email' });
      return;
    } else if (!body.password) {
      res.status(400).send({ error: 'Missing password' });
      return;
    }

    const user = await dbClient.getDocumentInCollectionByProperty('users', {email: body.email});
    if (user) {
      res.status(400).send({ error: 'Already exist' });
    } else {
      const hash = crypto.createHash('sha1');
      hash.update(body.password);
      body.password = hash.digest('hex');
      const result = await dbClient.insertDocument('users', body);
      const newUser = result.ops[0];
      res.statusCode = 201;
      res.json({ id: newUser._id, email: newUser.email });
    }
  }
}

export default UsersController;