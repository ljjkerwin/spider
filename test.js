const db = require('./db')

db.connect()

db.search({
  keywords: '1',

}, res => {
  console.log(res)
  db.end()
})

