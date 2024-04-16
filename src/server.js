import http from 'node:http';
import { json } from './middlewares/json.js';
import { routes } from './routes/router.js';
import { extractQuery } from './utils/query-params.js';
import { readCsv } from './utils/readCsv.js';

const PORT = 4000;

const server = http.createServer(async (req, res) => {
  let csv;
  if (req.url === '/csv' && req.method.toLowerCase() === 'post') {
    csv = await readCsv(req);

    const arrayCsv = csv.map(elm => ({
      title: elm[0],
      description: elm[1]
    }))

    for await (const task of arrayCsv) {
      const requestData = JSON.stringify({ title: task.title, description: task.description });

      const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/tasks',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestData)
        },
      };
      const req1 = http.request(options, (res1) => {
        console.log(`STATUS: ${res1.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res1.headers)}`);

        res1.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res1.on('end', () => {
          console.log('No more data in res1ponse.');
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });

      req1.write(requestData);
      req1.end();
    }


   return res.writeHead(201).end('Csv enviado.');;

  }

  const { method, url } = req;
  await json(req, res);


  const route = routes.find(route => route.method === method && route.path.test(url));

  if (route) {
    const routeParams = url.match(route.path);

    const { query, ...params } = routeParams.groups;


    req.params = params;
    req.query = query ? extractQuery(query) : {};

    console.log(req.query)
    return route.handler(req, res);

  }

  return res.writeHead(404).end('Resposta padrão.');

});

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`)
})