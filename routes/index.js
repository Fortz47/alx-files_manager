#!/usr/bin/node

import AppConroller from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

const loadRoutes = (app) => {
  app.get('/status', AppConroller.getStatus);
  app.get('/stat', AppConroller.getStat);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UsersController.getMe);
  app.post('/files', FilesController.postUpload);
  app.get('/files', FilesController.getIndex);
  app.get('/files/:id', FilesController.getShow);
};

export default loadRoutes;
