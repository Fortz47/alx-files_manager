const res = Buffer.from('bob@dylan.com:toto1234!', 'utf-8').toString('base64');
console.log(res);
const username = 'bob@dylan.com';
const password = 'toto1234!';
const base64Encoding = 'Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=';
const token = '9db96393-4018-4c79-96c3-b1a7272d8a7f';

// import { writeFile } from 'fs/promises';
//const {writeFile} = require('fs').promises;

// (async () => {
// 	const res = await writeFile('/tmp/hello.txt', 'hello world!!');
// 	console.log(`Finshed: ${res}`);
// })();