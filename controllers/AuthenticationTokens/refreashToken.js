const jwt = require('jsonwebtoken');


async function createRefreashToken(user)
{
    const token  = await jwt.sign({userId: user._id} , process.env.REFREASH_TOKEN_SECRET , {expiresIn:'3d'});
    return token
}
async function verifyRefreashToekn(refreshToken)
{
    const tokenInfo = await jwt.verify(refreshToken , process.env.REFREASH_TOKEN_SECRET)
    return tokenInfo
}


module.exports = {createRefreashToken , verifyRefreashToekn}