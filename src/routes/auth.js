const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const logger = require('../util/logger')
const { createJwtToken } = require('../util/jwt');

const router = express.Router();


// Signup route
router.post('/signup',async (req, res) => {
    try {
      const { email, password } = req.body;
      // const filePath = req.file ? req.file.path : null; // Path to the uploaded file
      logger.info(`Api call Signup`)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logger.error(`User with email ${email} already exists`);
        return res.status(400).json({ error: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword,filePath });
      await user.save();
    
      logger.info(`Success in Signup`)
      res.status(201).json({ message: 'User registered successfully',email });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });



// Login route
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      logger.info('Api call Login')
      const user = await User.findOne({ email });
      if (!user) {
        logger.info('User does not exists')
        return res.status(401).json({ error: 'Email or Password is incorrect' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Email or Password is incorrect' });
      }
  
      const token = 'token'
      logger.info('Success in login')
      res.json({ message: 'Authentication successful' ,token,user});
    } catch (error) {
      logger.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  module.exports = router