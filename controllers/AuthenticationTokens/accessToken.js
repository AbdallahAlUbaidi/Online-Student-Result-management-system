const jwt = require('jsonwebtoken');
const { model } = require('mongoose');
const errorReport = require('../errorReport');
const {_refreashToken} = require('./refreashToken')


function generateAccessToken(refreashToken , expiration = '30m')
{
        const tokenInfo = jwt.verify(refreashToken , process.env.REFREASH_TOKEN_SECRET , (err , decoded)=>
        {
            if(err)errorReport(err)
        })
        return jwt.sign(tokenInfo , process.env.ACCESS_TOKEN_SECRET)

}

function verifyAccessToken(accessToken)
{
    const tokenInfo = jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET , (err , decoded)=>
    {
        if(err)errorReport(err)
    })
    return tokenInfo

}

// function verfiyAutherizationHeader(req , res , next)
// {
//     try
//     {
//         const Autherization =  req.headers.Autherization
//         Autherization
//     }
//     catch(err)
//     {

//     }

// }


module.exports = {generateAccessToken , verifyAccessToken}