const express = require('express');
const User = require('../models/user');
const multer = require('multer')
const logger = require('../util/logger');
const router = express.Router();
const { MongoClient } = require("mongodb");
const { GridFsStorage } = require("multer-gridfs-storage")
const db = require('../db/db')
const GridFSBucket = require("mongodb").GridFSBucket
const decodeJwt = require('../middleware/decodeJwt')
const bcrypt = require('bcrypt')

const url = 'mongodb+srv://adarsh:BJtJTeNJSb7KvzmU@cluster0.hi5p8dt.mongodb.net/binge-club'
const mongoClient = new MongoClient(url);

// Create a storage object with a given configuration
const storage = new GridFsStorage({
  url,
  file: (req, file) => {
    //If it is an image, save to photos bucket
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
      return {
        bucketName: "photos",
        filename: `${Date.now()}_${file.originalname}`,
      }
    } else {
      //Otherwise save to default bucket
      return `${Date.now()}_${file.originalname}`
    }
  },
})

const upload = multer({ storage })



router.post("/upload/image", upload.single("avatar"), async (req, res) => {
  try {
    console.log('in api call',res.locals);
    const file = req.file;
    const { decodedEmail: email } = res.locals;
    const user = await User.findOne({ email });

    const {_id: userId} = user
    if (!user) {
      logger.info('User does not exists')
      return res.status(401).json({ error: 'Email or Password is incorrect' });
    }  

    const updateUser = await User.findByIdAndUpdate(
     userId,
      {$set:{profileImage: file.filename}},
      {new: true}
    )

    res.send({
        message: "Uploaded",
        id: file.id,
        name: file.filename,
        contentType: file.contentType,
        user: updateUser
    });

} catch (error) {
    logger.error(error);
    res.status(500).json({ message: "Error uploading image" });
}
})



router.get("/download/image",decodeJwt ,async (req, res) => {
  try {
    const { decodedEmail: email } = res.locals;
    const user = await User.findOne({ email });
    let {profileImage} = user

    if(profileImage === 'defaultImage'){
      profileImage = '1691817779001_Screenshot 2023-08-11 at 2.20.51 PM.png'
    }

    const database = mongoClient.db('binge-club')
    
    const imageBucket = new GridFSBucket(database, {
      bucketName: "photos",
    })
    
    let downloadStream = imageBucket.openDownloadStreamByName(
      profileImage
      )
      
      downloadStream.on("data", function (data) {
        return res.status(200).write(data)
      })
      
      downloadStream.on("error", function (data) {
        return res.status(404).send({ error: "Image not found" })
      })
      
      downloadStream.on("end", () => {
        return res.end()
      })
    } catch (error) {
      console.log(error)
      res.status(500).send({
        message: "Error Something went wrong",
        error,
      })
    }
  })
  


router.get('/', async (req, res) => {
  try {
    const { decodedEmail: email } = res.locals;
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
    const { email,username,password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    logger.info('Api call update user details')
    const user = await User.findOneAndUpdate(
      {email},
      {$set:{ username, password: hashedPassword} },
      {new:true}
    );

    console.log(user);
    if (!user) {
      logger.info('User does not exists')
      return res.status(401).json({ error: 'User does not exists' });
    }

    logger.info('Success in update user details')
    res.json({ message: 'Success',user});
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error });
  }
});

module.exports = router;
