const express = require('express');
const path = require('path');
const fs = require('fs');
const User = require("../../models/User");
const { uploadProfileImage } = require('../imageUpload');
const {profileImageResize} = require('../imageResize');
const bcrypt = require("bcrypt");
const router = express.Router();

router.post("/upload" , uploadProfileImage , async(req , res)=>{
    if(req.file){
        if(req.info.userInfo.profileImg){
            const dir = path.join(__dirname , '..' , '..' ,  "public" , "images" , 'profileImages' , req.info.userInfo.profileImg);
            fs.rmSync(dir, { recursive: true, force: true });
        }
        try{
            const {_id} = req.info.userInfo;
            const hashedId = await bcrypt.hash(_id.toString() , 10)
            const profileImg = hashedId.replace(/[\/\\]/gi , "-");
            const response = await profileImageResize(req , res , req.file.buffer , profileImg);
            if(response.messageType){
                await User.updateOne({_id} , {profileImg});
            }
            res.status(200).json(response);
        }catch(err){
            res.status(500).json({
                message:"An Error occured while uploading profile image",
                messageType:0
            });
        }
    }

});

router.get('/' , (req , res) => {
    try{
        const profileImg = req.info.userInfo.profileImg;
        res.status(200).json({profileImg});
    }catch(err){
        res.status(500).json(err)
    }
});

module.exports = router;