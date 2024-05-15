import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import { userAuth, decodeString } from '../utils/utility';

const { writeFile, mkdir, readFile } = require('fs').promises;
const mime = require('mime-types');

class FilesController {
  static async postUpload(req, res) {
    const user = await userAuth.authUser(req);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const { body } = req;
    if (!body.name) {
      res.status(400).send({ error: 'Missing name' });
      return;
    }
    if (!body.type || !(['folder', 'file', 'image'].includes(body.type))) {
      res.status(400).send({ error: 'Missing type' });
      return;
    }
    if (body.type !== 'folder' && !body.data) {
      res.status(400).send({ error: 'Missing data' });
      return;
    }

    // check if parentId is set in body
    if (body.parentId) {
      const toObjectId = new ObjectId(body.parentId);
      const file = await dbClient.getDocumentInCollectionByProperty('files', { _id: toObjectId });
      if (!file) {
        res.status(400).send({ error: 'Parent not found' });
        return;
      }
      if (file.type !== 'folder') {
        res.status(400).send({ error: 'Parent is not a folder' });
        return;
      }
    }

    body.parentId = body.parentId || 0;
    body.isPublic = body.isPublic || false;
    body.userId = user.id;
    if (body.type === 'folder') {
      await dbClient.insertDocument('files', body);
      res.status(201).json(body);
      return;
    }

    const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
    const fileName = uuidv4();
    const file = {
      userId: user.id,
      name: body.name,
      type: body.type,
      isPublic: body.isPublic,
      parentId: body.parentId,
      localPath: `${filePath}/${fileName}`,
    };
    const result = await dbClient.insertDocument('files', file);
    const doc = result.ops[0];
    // create file and write to file
    const data = decodeString(body.data, 'base64', 'utf-8');
    try {
      await mkdir(filePath, { recursive: true });
      await writeFile(file.localPath, data);
    } catch (err) {
      console.log(`Error creating/writing file: ${err}`);
    }

    res.status(201).json({
      id: result.insertedId,
      userId: doc.userId,
      name: doc.name,
      type: doc.type,
      isPublic: doc.isPublic,
      parentId: doc.parentId,
    });
  }

  static async getShow(req, res) {
    const user = await userAuth.authUser(req);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const id = new ObjectId(req.params.id);
    const file = await dbClient.getDocumentInCollectionByProperty('files', { _id: id, userId: user.id });
    if (!file) {
      res.status(404).send({ error: 'Not found' });
      return;
    }

    const modifiedFile = { id: file._id.toString(), ...file };
    delete modifiedFile._id;
    if (modifiedFile.localPath) delete modifiedFile.localPath;
    res.status(200).send(modifiedFile);
  }

  static async getIndex(req, res) {
    const user = await userAuth.authUser(req);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    let { parentId, page } = req.query;
    page = page || 0;
    parentId = parentId || 0;
    const limit = 20;
    const offset = page * limit;
    const filesCollection = await dbClient.getCollection('files');
    const docs = await filesCollection.find({ parentId }).skip(offset).limit(limit).toArray();

    const modifiedDocs = docs.map((doc) => {
      const newObj = { id: doc._id.toString(), ...doc };
      delete newObj._id;
      if (newObj.localPath) delete newObj.localPath;
      return newObj;
    });
    res.status(200).send(modifiedDocs);
  }

  static async putPublish(req, res) {
    const user = await userAuth.authUser(req);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const objectId = new ObjectId(id);
    const file = await dbClient.getDocumentInCollectionByProperty('files', { _id: objectId, userId: user.id });
    if (!file) {
      res.status(404).send({ error: 'Not found' });
      return;
    }

    const modifiedFile = { id, ...file };
    modifiedFile.isPublic = true;
    delete modifiedFile._id;
    if (modifiedFile.localPath) delete modifiedFile.localPath;

    res.send(modifiedFile);
  }

  static async putUnpublish(req, res) {
    const user = await userAuth.authUser(req);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const objectId = new ObjectId(id);
    const file = await dbClient.getDocumentInCollectionByProperty('files', { _id: objectId, userId: user.id });
    if (!file) {
      res.status(404).send({ error: 'Not found' });
      return;
    }

    const modifiedFile = { id, ...file };
    modifiedFile.isPublic = false;
    delete modifiedFile._id;
    if (modifiedFile.localPath) delete modifiedFile.localPath;

    res.send(modifiedFile);
  }

  static async getFile(req, res) {
    const user = await userAuth.authUser(req);
    const { id } = req.params;
    const objectId = new ObjectId(id);
    const file = await dbClient.getDocumentInCollectionByProperty('files', { _id: objectId });
    if (!file) {
      res.status(404).send({ error: 'Not found' });
      return;
    }
    if (file.isPublic === false && !user) {
      res.status(404).send({ error: 'Not found' });
      return;
    }
    if (file.isPublic === false && file.userId !== user.id) {
      res.status(404).send({ error: 'Not found' });
      return;
    }
    if (file.type === 'folder') {
      res.status(400).send({ error: 'A folder doesn\'t have content' });
      return;
    }

    let isAccesible = true;
    let encodedData = '';
    try {
      encodedData = await readFile(file.localPath, { encoding: 'base64' });
    } catch (error) {
      isAccesible = false;
      console.log(`"${file.localPath}" not accesible: ${error}`);
    }
    if (isAccesible === false) {
      res.status(404).send({ error: 'Not found' });
      return;
    }

    let mimeType = mime.lookup(file.name);
    mimeType = mimeType || 'application/octet-stream';
    res.setHeader('Content-type', mimeType);
    const decodedData = decodeString(encodedData, 'base64', 'utf-8');
    res.status(200).send(decodedData);
  }
}

export default FilesController;
