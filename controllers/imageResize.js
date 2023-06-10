const sharp = require('sharp');
const fs = require('fs')
const { showFlashMessage } = require('./flashMessage');
const path = require('path')


async function imageResize(res , req , imageBuffer , courseTitle){
    try{
        let dir = path.join(__dirname , '..' , 'public' , 'images' , 'courseImages' , courseTitle);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await Promise.all([
            sharp(imageBuffer).resize({height:200 , width:150}).toFile(`${dir}/resized150px.png`),
            sharp(imageBuffer).resize({height:200 , width:200}).toFile(`${dir}/resized200px.png`),
            sharp(imageBuffer).resize({height:200 , width:250}).toFile(`${dir}/resized250px.png`),
            sharp(imageBuffer).resize({height:200 , width:500}).toFile(`${dir}/resized500px.png`),
        ])
        return path.join('public' , 'images' , 'courseImages' , courseTitle);
    }catch(err){
        showFlashMessage(500 , 'Could not upload image' , req , res , '0');
        return 0;
    }
}

async function profileImageResize(res , req , imageBuffer , profileImg){
    try{
        let dir = path.join(__dirname , '..' , 'public' , 'images' , 'profileImages' , profileImg);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        await Promise.all([
            sharp(imageBuffer).resize({height:200 , width:150}).toFile(`${dir}/resized150px.png`),
            sharp(imageBuffer).resize({height:200 , width:200}).toFile(`${dir}/resized200px.png`),
            sharp(imageBuffer).resize({height:200 , width:250}).toFile(`${dir}/resized250px.png`),
            sharp(imageBuffer).resize({height:200 , width:500}).toFile(`${dir}/resized500px.png`),
            sharp(imageBuffer).resize({height:50 , width:50}).toFile(`${dir}/resized50px.png`),
        ])
        return {
            message:"Profile image uploaded successfully",
            messageType:1
        }
    }catch(err){
        return {
            message:"Could not upload profile image",
            messageType:0
        };
    }
}

function renameImageDirectory(currentName , newName){
    let prevPath = path.join(__dirname , '..' , 'public' , 'images' , 'courseImages' , currentName);
    let newPath = path.join(__dirname , '..' , 'public' , 'images' , 'courseImages' , newName);
    fs.renameSync(prevPath , newPath);
}

function deleteImageDirectory(){

}


module.exports = {imageResize , renameImageDirectory , deleteImageDirectory , profileImageResize}