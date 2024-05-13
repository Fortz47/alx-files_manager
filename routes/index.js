#!/usr/bin/node

import AppConroller from "../controllers/AppController";
import UsersController from "../controllers/UsersController";

const loadRoutes = (app) => {
  app.get('/status', AppConroller.getStatus);
  app.get('/stat', AppConroller.getStat);
  app.post('/users', UsersController.postNew);
};

export default loadRoutes;