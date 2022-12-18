const jwt = require('jsonwebtoken');


function createRefreashToken(user)
{
    return jwt.sign({userId: user._id} , process.env.REFREASH_TOKEN_SECRET , {expiresIn:'3d'});
}

function verifyRefreashToekn(refreshToken)
{
    return jwt.verify(refreshToken , process.env.REFREASH_TOKEN_SECRET)
}


module.exports = {createRefreashToken , verifyRefreashToekn}