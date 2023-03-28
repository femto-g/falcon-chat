const express = require('express');
const router = express.Router();
const db = require('../db/index.js');


router.post('/messages', (req, res, next) => {
  //just get all messages between users, deal with scrolling later

  db.query('SELECT * FROM messages WHERE (sender=($1) AND reciever=($2)) OR  (sender=($2) AND reciever=($1)) ORDER BY timestamp',
    [req.body.user1, req.body.user2],
    (err, result) => {
      if(err){
        return next(err);
      }
      const rows = result.rows;
      return res.json(rows);
    }
  )

});

module.exports = router;