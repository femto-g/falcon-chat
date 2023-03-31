const express = require('express');
const router = express.Router();
const db = require('../db/index.js');


router.post('/messages', (req, res, next) => {
  //just get all messages between users, deal with scrolling later

  db.query('SELECT * FROM messages WHERE (sender=($1) AND receiver=($2)) OR (sender=($2) AND receiver=($1)) ORDER BY timestamp',
    [req.body.user1, req.body.user2],
    (err, result) => {
      if(err){
        return next(err);
      }
      // if(result.rows.length === 0){
      //   return res.sendStatus(404);
      // }
      const rows = result.rows;
      //console.log(rows);
      return res.json(rows);
    }
  );

});

router.post('/active-chats', (req, res, next) => {
  //add a query here that returns, for a given user, the names (as well as # of unread messages) of the users they have chatted with
  //ordered by date of most recent chat
  // SELECT sender, sum(CASE WHEN read = false THEN 1 ELSE 0 END), max(timestamp) as latest FROM messages WHERE receiver=($1) GROUP BY sender ORDER BY latest;
  //SELECT (CASE WHEN sender=(me) THEN receiver ELSE sender) as conversation, max(timestamp) as latest FROM messages where receiver=(me) OR sender=(me) GROUP BY conversation ORDER by latest;

  //SELECT (CASE WHEN sender = 'rememberthis' THEN receiver ELSE sender END) as conversation, sum(CASE WHEN read = false THEN 1 ELSE 0 END) as unread, max(timestamp) as latest FROM messages where receiver = 'rememberthis' OR sender = 'rememberthis' GROUP BY conversation ORDER by latest;
  
  //SELECT (CASE WHEN sender = 'rememberthis' THEN receiver ELSE sender END) as conversation, sum(CASE WHEN receiver = 'rememberthis' AND read = false THEN 1 ELSE 0 END) as unread, max(timestamp) as latest FROM messages where receiver = 'rememberthis' OR sender = 'rememberthis' GROUP BY conversation ORDER by latest DESC;
  db.query(`SELECT (CASE WHEN sender = ($1) THEN receiver ELSE sender END) as conversation, 
    sum(CASE WHEN receiver = ($1) AND read = false THEN 1 ELSE 0 END) as unread, max(timestamp) 
    as latest FROM messages where receiver = ($1) OR sender = ($1) GROUP BY conversation ORDER by latest DESC;`,
    [req.body.username],
    (err, result) => {
      if(err){
        return next(err);
      }
      const rows = result.rows;
      return res.json(rows);
    });
});


router.post('/read-messages', (req, res, next) => {
  //this pending forever for some reason, after enough instances stops db
  console.log('read messages query');
  db.query('UPDATE messages SET read = true WHERE sender = ($1) AND receiver = ($2)',
  [req.body.sender, req.body.receiver],
  (err) => {
    if(err){
      return next(err);
    }
    console.log('finished read messages query');
    return res.sendStatus(200);
  });
});

module.exports = router;