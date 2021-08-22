const fetch = require('node-fetch');
const fs = require('fs');
const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const helmet = require('koa-helmet');

const domain = 'https://parent-api.jingyupeiyou.com';

const app = new Koa();
const router = new Router();

app.use(bodyParser())/*.use(helmet())*/;

router.get('/fetch', async(ctx, next) => {
  ctx.type = 'html';
  ctx.body = fs.createReadStream('fetch.html');
})

router.post('/api/fetch', async(ctx, next) => {
  const body = ctx.request.body;
  if(body == null || body.auth == null || body.auth.indexOf('Basic ') != 0) {
    ctx.body = { message: '请输入正确的信息' };
    return;
  }
  const auth = body.auth;
  console.log(Date.now());
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
