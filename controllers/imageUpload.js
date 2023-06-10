const multer = require('multer');

const uploadImage = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req , file , cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image file'));
        }
        cb(null , true);
    }
}).single('courseImage');

const uploadProfileImage = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req , file , cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image file'));
        }
        cb(null , true);
    }
}).single('profileImage');

module.exports = {uploadImage , uploadProfileImage};