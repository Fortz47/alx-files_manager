#!/usr/bin/node

import { v4 as uuidv4 } from 'uuid';
import AuthController from './AuthController';
import UsersController from './UsersController';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    const isConnected = await AuthController.getConnect(req, res);
    if (isConnected === false) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const user = await UsersController.getMe(req, res);

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

    // check if parentId is set in body.
    // Number() is used for case where parentId was set to zero
    // we want 0 to mark as true and not false
    if (Number(body.parentId)) {
      const file = await dbClient.getDocumentInCollectionByProperty('files', { parentId: body.parentId });
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
      res.status(201).send(body);
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
    await dbClient.insertDocument('files', file);
    res.status(201).send(file);
  }
}

export default FilesController;
