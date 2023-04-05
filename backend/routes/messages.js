const express = require('express');
const router = express.Router();
const db = require('../db/index.js');


router.post('/messages', (req, res, next) => {
  //TODO: handle infinite scrolling
  db.query('SELECT * FROM messages WHERE (sender=($1) AND receiver=($2)) OR (sender=($2) AND receiver=($1)) ORDER BY timestamp',
    [req.body.user1, req.body.user2],
    (err, result) => {
      if(err){
        return next(err);
      }
      const rows = result.rows;
      return res.json(rows);
    }
  );

});

router.post('/active-chats', (req, res, next) => {
  //selects, for a given user, the names (as well as # of unread inbound messages) of the
  //users they have chatted with ordered by date of most recent message  
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

router.post("/search", (req, res, next) => {

	const searchQuery = req.body.searchQuery;
	db.query('SELECT username FROM users WHERE username LIKE ($1)', [searchQuery + '%'], (err, result) => {
		if(err){
			return next(err);
		}
		return res.json(result.rows);
	})

});

module.exports = router;