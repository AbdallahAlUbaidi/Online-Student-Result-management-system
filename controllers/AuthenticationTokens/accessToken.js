const jwt = require('jsonwebtoken');
const {expressjwt} = require('express-jwt')
const {unless} = require('express-unless')
const errorReport = require('../errorReport');
const axois = require('axios');
const secure = Boolean(parseInt(process.env.HTTPS))

async function generateToken(refreashToken , expiration = '30m')
{
    try
    {
        const tokenInfo = await jwt.verify(refreashToken , process.env.REFREASH_TOKEN_SECRET)
        return await jwt.sign({userId:tokenInfo.userId , role:tokenInfo.role} , process.env.ACCESS_TOKEN_SECRET , {expiresIn:expiration})
    }
    catch(err)
    { 
        return errorReport(err)
    }
}

//The logic of parsing Tokens
function getToken(req)
{
    const cookie = req.cookies.Authorization;
    if(!cookie)
        return cookie
    const token = cookie.split(' ')[1]
    return token;
}


//Expired tokens handler
function onExpired(req , err)
{
    if (new Date() - err.inner.expiredAt < 5000) return;
    throw err;
}


const verifyToken = expressjwt({secret:process.env.ACCESS_TOKEN_SECRET,algorithms: ["HS256"],getToken,onExpired,credentialsRequired:true})

function errorHandler(err, req, res, next)
{

    const refreshTokenCookie = req.cookies.Refreash_Token
    if(!refreshTokenCookie)
        res.redirect('/login')
    else
    {   
        const tokenInfo = refreshTokenCookie.split(' ')[1]
        if(err.name === 'UnauthorizedError')
        {
            if(err.code == 'invalid_token')
            {
                res.cookie('Authorization' , `` , { 
                    httpOnly: true, 
                    sameSite: secure? 'None': "Lax",
                    secure: Boolean(parseInt(process.env.HTTPS)), 
                    maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_PERIOD) * 60 * 60 * 1000 
                })
                res.cookie('Refreash_Token' , `` , { 
                    httpOnly: true, 
                    sameSite: secure? 'None': "Lax", secure: Boolean(parseInt(process.env.HTTPS)), 
                    maxAge: parseInt(process.env.REFRESH_TOKEN_EXPIRATION_PERIOD) * 24 * 60 * 60 * 1000 })
                
                res.render('errorPages/invalidToken' , {error:err.code})
            }
            else
            {
                axois({
                    method:'post',
                    url:process.env.AUTH_SERVER_URL,
                    data:{
                        refreshToken:tokenInfo,
                        expiresIn:process.env.ACCESS_TOKEN_EXPIRATION_PERIOD
                    }
                })
                .then(response=>
                {
                    const accessToken = response.data.accessToken
                    res.cookie('Authorization' , `bearer ${accessToken}` , { 
                        httpOnly: true, 
                        sameSite: 'None',
                        secure: Boolean(parseInt(process.env.HTTPS)), 
                        maxAge: parseInt(process.env.ACCESS_TOKEN_EXPIRATION_PERIOD) * 60 * 60 * 1000 
                    })
                    req.cookies.Authorization = `bearer ${accessToken}`;
                    return tokenHandler(req, res , next)
                })
                .catch(err =>
                {
                    if(!err.response)
                        res.render('errorPages/serverError' , {error:'Auth Server did not responed'})
                    else if(err.response.status === 401 && err.response.data.errorMsg === "invalid signature")
                        res.render('errorPages/invalidToken' , {error:err.response.data.errorMsg})
                    else if(err.response.status === 401 && err.response.data.errorMsg === 'jwt expired')
                        res.redirect('/login')
                    else
                        res.render('errorPages/serverError' , {error:'An error has occured in the server'})
                })
            }
        }
        else
            next()
    }
}

function tokenHandler(req , res , next)
{
    verifyToken(req , res , (err)=>
    {
        if(err)
            errorHandler(err , req , res , next)
        else
            next()
    })
}

tokenHandler.unless = unless

module.exports = {generateToken , getToken , tokenHandler}