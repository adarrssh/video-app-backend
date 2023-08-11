const express = require('express');
const User = require('../models/user');
const multer = require('multer')
const logger = require('../util/logger');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    logger.info('Api call get user details')
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      logger.info('User does not exists')
      return res.status(401).json({ error: 'User does not exists' });
    }

    logger.info('Success in get user details')
    res.json({ message: 'Success',user});
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    logger.info('Api call update user details')
    const user = await User.findOne({ email });
    if (!user) {
      logger.info('User does not exists')
      return res.status(401).json({ error: 'User does not exists' });
    }

    logger.info('Success in get user details')
    res.json({ message: 'Success',user});
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

module.exports = router;
