// require dependencies
const path = require('path');
const express = require('express');
const router = express.Router();

// get root route
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
});

// get information by individual member route
router.get('/member/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/viewMember.html'))
});

// catch all route- anything else will default to the main page
router.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
});

module.exports = router;