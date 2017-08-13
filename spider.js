const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite'); 
const db = require('./db');



let page = 0;
const getUrl = () => {
  return `http://www.y3600.com/hanju/2017/index_${page}.html`;
}





db.connect();
startRequest(getUrl());








function startRequest(url, retry = 0) {
  request({
    encoding: null,
    url: getUrl()

  }, (err, res, body) => {
    if (err || res.statusCode != 200) {
      console.error(err);
      if (retry < 2) {
        console.log(`fail to request page ${page}, retry`);
        return startRequest(url, retry + 1) ;
      }
      console.error(`fail to request page ${page}`);
      return;
    }


    let html = iconv.decode(body, 'utf-8').toString();
    let $ = cheerio.load(html);

    let dataCount = 0;

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

      db.insertRow(data.title, data.link ,data.img)
      dataCount++;
    });

    console.log('get!  ', url)
    console.log('data count:', dataCount)

    if (page >= 0) {
      db.end();
    } else {
      page++;
      startRequest(getUrl(page));
    }
  })
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