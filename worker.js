import Queue from 'bull';
import { ObjectId } from 'mongodb'
import imageFunction from 'image-thumbnail';;
import dbClient from './utils/db';

const { writeFile } = require('fs').promises;

const fileQueue = new Queue('image transcoding');
fileQueue.process(async (job, done) => {
  console.log(job)
  const data = job.data;
  if (!data.fileId) {
    done(new Error('Missing fileId'));
  }
  if (!data.userId) {
    done(new Error('Missing userId'));
  }

  const id = new ObjectId(data.fileId);
  const doc = await dbClient.getDocumentInCollectionByProperty('files', {_id: id, userId: data.userId});
  if (!doc) {
    done(new Error('File not found'));
  }

  const widthOptions = [{width: 500}, {width: 250}, {width: 100}];
  let progress = 0;
  widthOptions.forEach(async (options) => {
    try {
      const thumbnail = await imageFunction('image.png', options);
      await writeFile(`${doc.localPath}_${options.width}`, thumbnail);
      progress += 33.34;
      if (progress >= 100) progress = Math.round(progress);
      job.progress(progress);
    } catch (err) {
      console.log(`Error creating thumbnail or writing to file path: ${err}`);
    }
  });
  done();
})