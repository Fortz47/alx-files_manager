import { ObjectId } from 'mongodb';
import redisClient from './redis';
import dbClient from './db';

export class userAuth {
  static async authUser(request) {
    const token = request.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);
    const userObjectId = new ObjectId(userId);
    const user = await dbClient.getDocumentInCollectionByProperty('users', { _id: userObjectId });
    if (!user) {
      return null;
    }
    return { id: userId, email: user.email };
  }
}

export function decodeString(encodedString, encoding, decoding) {
  const data = Buffer.from(encodedString, encoding).toString(decoding);
  return data;
}
