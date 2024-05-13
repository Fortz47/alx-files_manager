#!/usr/bin/node

import AppConroller from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';

const loadRoutes = (app) => {
  app.get('/status', AppConroller.getStatus);
  app.get('/stat', AppConroller.getStat);
  app.post('/users', UsersController.postNew);
  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UsersController.getMe);
};

export default loadRoutes;
