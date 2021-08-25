const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');
const m3u8stream = require('m3u8stream');
const reader = require("readline-sync");

const domain = 'https://parent-api.jingyupeiyou.com';

let auth;

async function doFetch(path, data) {
  let options = {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  //console.log(options);

  try {
    let response = await fetch(domain + path, options);
    let result = await response.json();
    if(result.code == 200 && result.data) {
      return result.data;
    } else {
      console.error(result.code, result.message);
    }

    return result;
  } catch(e) {
    console.error(e);
    return {};
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function download(folder, fileName, url) {
  try {
    await fs.promises.access(folder, fs.constants.F_OK);
  } catch (e) {
    console.log('创建目录: ' + folder);
    await fs.promises.mkdir(folder);
  }

  try {
    fileName = fileName.replace(/[/\\?%*:|"<>]/g, ''); // 移除文件名中的特殊字符
    fileName = folder + '/' + fileName + '.mp4';
    console.log('>>> 开始下载: ' + fileName + ' --- ' + url);
    let stream = m3u8stream(url);
    stream.pipe(fs.createWriteStream(fileName));
    stream.on('progress', (segment, totalSegments, downloaded) => {
      readline.cursorTo(process.stdout, 0);
      process.stdout.write(
        `${segment.num} of ${totalSegments} segments ` +
        `(${(segment.num / totalSegments * 100).toFixed(2)}%) ` +
        `${(downloaded / 1024 / 1024).toFixed(2)}MB downloaded`);
    });
    let end = new Promise(function(resolve, reject) {
      stream.on('end', resolve);
    });
    await end;
    console.log('<<< ' + fileName + ' 下载完成');
  } catch(e) {
    console.log('下载失败', e);
  }
}

(async function() {
  /* login */
  /* 安全机制不好跳过, 先不做了
  let mobile = reader.question('手机号: ');
  console.log('>' + mobile)

  try {
    let response = await fetch(domain + '/v2/register/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile })
    });
    let result = await response.json();
    console.log(result.code, result.message);
  } catch(e) {
    console.error(e);
  }

  console.log('--- 已给手机发生验证码, 请查收 ---');
  let code = reader.question('验证码: ');
  console.log('>' + code)

  try {
    let response = await fetch(domain + '/v1/user/leads/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile,
        code,
        platform: 'MacIntel',
        userAgent: 'chrome'
      })
    });
    let result = await response.json();
    console.log(result);
  } catch(e) {
    console.error(e);
  }
  console.log('登录成功...');
  return;
  */
  auth = reader.question('Authorization: ');


  /* class list */
  console.log('抓取课程...');
  // status: 1 在读 2 已结班
  // 暂不处理分页
  let classes = [];
  let data = await doFetch('/v2/class/search/list', { page: 1, limit: 5, type: 1, status: 1 });
  classes = classes.concat(data.data);
  data = await doFetch('/v2/class/search/list', { page: 1, limit: 5, type: 1, status: 2 });
  classes = classes.concat(data.data);

  /* lesson detail */
  console.log('抓取课程详情...');
  for(let i = 0; i < classes.length; i++) {
    let classroom_id = classes[i].id;
    classes[i].lessons = await doFetch('/v2/schedule/search/list/all', { classroom_id });
  }

  classes.map(function(v) {
    console.log({ id: v.id, no: v.class_no, name: v.course.name_CN, lessons: v.lessons.map(function(vv) {
      return {
        name: vv.lesson.name_EN,
        video: JSON.stringify(vv.video)
      };
    })});
  });

  // let filter = reader.question('请输入下载课程编号(1/2/3/.../all 默认: all): ');

  /* download video */
  for(let i = 0; i < classes.length; i++) {
    for(let j = 0; j < classes[i].lessons.length; j++) {
      if(classes[i].lessons[j].video.length > 0) {
        let video = classes[i].lessons[j].video;
        for(let k = 0; k < video.length; k++) {
          let folder = classes[i].course.name_CN;
          let fileName = ('' + (j + 1 + 100)).slice(1) + '-' + classes[i].lessons[j].lesson.name_EN.replace(/\s/g, '-') + (video.length > 1 ? '-part' + (k + 1) : '');
          await download(folder, fileName, video[k]);
        }
      }
    }
  }

  console.log('结束: 所有内容完成下载');
})();
