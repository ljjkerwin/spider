const http = require('http');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

const db = require('./db');
db.connect();


let page = 0;
const getUrl = () => {
  return `http://www.y3600.com/hanju/2017/index_${page}.html`;
}


startRequest(getUrl());








function startRequest(url) {
  
  //采用http模块向服务器发起一次get请求      
  http.get(url, res => {
    console.log('get url:', url)

    res.setEncoding('utf-8'); //防止中文乱码

    let html = '';

    //监听data事件，每次取一块数据
    res.on('data', chunk => {
      html += chunk;
    });

    // 整个网页内容的html获取完毕回调函数
    res.on('end', function () {
      let $ = cheerio.load(html); // cheerio模块解析html

      let $list = $('#content ul');
      $list.each((i, item) => {
        let $item = $(item);

        let linkHost = 'http://www.y3600.com';

        let data = {
          title: $item.find('li.tit a').text(),
          link: linkHost + $item.find('.img').attr('href'),
          img: $item.find('.img img').attr('src'),
          // img: getMatch($item.find('.m a').attr('style'), /url\('(.*)'\)/),
        }
        // console.log(data)
 
        db.insertRow(data.title, data.link ,data.img)
      });

      // return

      if (page <= 2) {
        page++;
        startRequest(getUrl(page));
      } else {
        db.end();
      }


    });

  }).on('error', function (err) {
    console.log(err);
  });
}




function showPropertyKey(obj, own = false) {
  if (!obj) return;
  if (own) {
    for (let k in obj) {
      if (obj.hasOwnProperty(k)) {
        console.log(k);
      }
    }
    return;
  }
  for (let k in obj) {
    console.log(k);
  }
}

function getMatch(str = '', reg) {
  let match = str.match(reg);
  if (match) {
    return match[1];
  } else {
    return null;
  }
}