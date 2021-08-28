const fetch = require('node-fetch');
const fs = require('fs');
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');
const { Buffer } = require('buffer');

const domain = 'https://parent-api.jingyupeiyou.com';

const app = new Koa();
const router = new Router();

app.use(bodyParser())/*.use(helmet())*/;

router.get('/fetch', async(ctx, next) => {
  ctx.type = 'html';
  ctx.body = fs.createReadStream('fetch.html');
});

router.post('/api/getCode', async(ctx, next) => {
  const body = ctx.request.body;
  let response = await fetch(domain + '/v3/register/send', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mobile: body.mobile })
  });
  let result = await response.json();
  ctx.body = result;
});

router.post('/api/fetch', async(ctx, next) => {
  const body = ctx.request.body;
  let auth;
  let response = await fetch(domain + '/v2/register/register', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ mobile: body.mobile, code: body.code, platform: 'iOS', userAgent: 'iOS', staff_no: 'app\/ios' })
  });
  let result = await response.json();

  if(result.code != 200 || !result.data.newToken) {
    ctx.body = { code: 403, message: result.message };
    return;
  }
  
  auth = Buffer.from(result.data.newToken);
  auth = 'Basic ' + auth.toString('base64');

  let data = await getList(auth);
  
  ctx.body = data;
});

app.use(router.routes());
app.listen(3008);
console.log('LISTEN: 3008');

async function doFetch(path, data, auth) {
  let options = {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };

  try {
    let response = await fetch(domain + path, options);
    let result = await response.json();
    if(result.code == 200 && result.data) {
      return result.data;
    } else {
      // console.error(result.code, result.message);
    }

    return result;
  } catch(e) {
    // console.error(e);
    return {};
  }
}

async function getList(auth) {
  /* class list */
  // status: 1 在读 2 已结班
  // 暂不处理分页
  let classes = [];
  let data = await doFetch('/v2/class/search/list', { page: 1, limit: 5, type: 1, status: 1 }, auth);
  classes = classes.concat(data.data);
  data = await doFetch('/v2/class/search/list', { page: 1, limit: 5, type: 1, status: 2 }, auth);
  classes = classes.concat(data.data);

  /* lesson detail */
  for(let i = 0; i < classes.length; i++) {
    let classroom_id = classes[i].id;
    classes[i].lessons = await doFetch('/v2/schedule/search/list/all', { classroom_id }, auth);
  }

  return classes;
}
