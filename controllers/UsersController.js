import crypto from 'crypto';
import dbClient from '../utils/db';
import { userAuth } from '../utils/utility';

class UsersController {
  static async postNew(req, res) {
    const { body } = req;
    if (!body.email) {
      res.status(400).send({ error: 'Missing email' });
      return;
    } if (!body.password) {
      res.status(400).send({ error: 'Missing password' });
      return;
    }

    const user = await dbClient.getDocumentInCollectionByProperty('users', { email: body.email });
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

  static async getMe(req, res) {
    const user = await userAuth.authUser(req, res);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }
    res.status(200).json(user);
  }
}

export default UsersController;
