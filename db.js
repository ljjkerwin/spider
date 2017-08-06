const mysql = require('mysql');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'node',
});



exports.connect = () => {
  connection.connect(err => {
    if (err) {
      console.log('error connection:', err);
      return
    }

    console.log('connected as id:', connection.threadId)
  });
}


exports.end = () => {
  connection.end(err => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('------------------end success')
  });
}


let insertSql = 'INSERT INTO news (title, link, img) VALUES (?, ?, ?)';


exports.insertRow = (title = '', link = '', img = '') => {
  connection.query(insertSql, [title, link, img], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }

    // console.log('------------------insert success')
    // console.dir({
    //   title, link, img
    // })
  })
}


exports.search = (params = {}, callback) => {
  let keywords = params.keywords;
  let page_size = params.page_size || 20;
  let next_page = params.next_page || 0;

  let result = {
    status: 200,
    message: 'success',
    data: {
      list: [],
      next_page: null
    }
  }


  let searchSql = `SELECT SQL_CALC_FOUND_ROWS * FROM news WHERE id > ${next_page} AND title LIKE "%${keywords}%" LIMIT 0,${page_size}`;
  connection.query(searchSql, (err, rows, fields) => {
    if (err) {
      console.log(err);
      return;
    }

    connection.query('SELECT FOUND_ROWS();', (err, totalLen) => {
      if (err) {
        console.log(err);
        return;
      }
      
      totalLen = totalLen[0]['FOUND_ROWS()'];
      curLen = rows.length;

      console.log(`keywords: ${keywords}, result: ${curLen}/${totalLen}`);

      // 是否有分页
      if (curLen < totalLen) {
        result.data.next_page = rows[curLen - 1].id;
      }

      result.data.list = rows;
      result.data.total = totalLen;

      callback && callback(result);
    })
  })
}
