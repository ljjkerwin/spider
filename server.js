
const express = require('express')
const app = express();

const db = require('./db');
db.connect();

app.use(express.static('./'))

app.get('/search', (req, res) => {
  let keywords = req.query.keywords;
  let page_size = req.query.page_size;
  let next_page = req.query.next_page;

  
  db.search({
    keywords,
    page_size,
    next_page
  }, (rows) => {
    res.json(rows);
  })
  
})


const server = app.listen(9394, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log(host, port, 'is listening')
})