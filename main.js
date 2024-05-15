const res = Buffer.from('bob@dylan.com:toto1234!', 'utf-8').toString('base64');
console.log(res);
const username = 'bob@dylan.com';
const password = 'toto1234!';
const base64Encoding = 'Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
const token = '2f95a6d2-a03a-4e21-9c67-58660114610e';

import { writeFile } from 'fs/promises';
//const {writeFile} = require('fs').promises;

(async () => {
	const res = await writeFile('/tmp/hello.txt', 'hello world!!');
	console.log(`Finshed: ${res}`);
})();