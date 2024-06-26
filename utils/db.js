import { MongoClient } from 'mongodb';

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_DATABASE || 'files_manager';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

class DBClient {
  constructor() {
    this.client = new MongoClient(url, { useUnifiedTopology: true }); // { useUnifiedTopology: true } Sets Server Discovery and Monitoring engine to latest/new
    (async () => {
      await this.client.connect();
      this._db = this.client.db(DB_NAME);
    })();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const count = await this._db.collection('users').countDocuments();
    return count;
  }

  async nbFiles() {
    const count = await this._db.collection('files').countDocuments();
    return count;
  }

  async insertDocument(collection, document) {
    const result = await this._db.collection(collection).insertOne(document);
    return result;
  }

  async getDocumentInCollectionByProperty(collection, property) {
    // property is an object with a single key-value, ex: {email: john@gmail.com}
    const document = await this._db.collection(collection).findOne(property);
    return document;
  }

  async getCollection(collectionName) {
    const collection = await this._db.collection(collectionName);
    return collection;
  }
}

const dbClient = new DBClient();
export default dbClient;
