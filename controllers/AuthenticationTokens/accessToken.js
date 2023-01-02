const jwt = require('jsonwebtoken');
const { model } = require('mongoose');
const errorReport = require('../errorReport');
const {_refreashToken} = require('./refreashToken')


async function generateAccessToken(refreashToken , expiration = '30m')
{
    const tokenInfo = await jwt.verify(refreashToken , process.env.REFREASH_TOKEN_SECRET)
    return await jwt.sign(tokenInfo , process.env.ACCESS_TOKEN_SECRET)

}

async function verifyAccessToken(accessToken)
{
    const tokenInfo = await jwt.verify(accessToken , process.env.ACCESS_TOKEN_SECRET , (err , decoded)=>
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