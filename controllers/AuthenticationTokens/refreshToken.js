const jwt = require('jsonwebtoken');
const {errorReport} = require('../errorReport');


async function generateToken(user)
{
    try
    {
        const token  = await jwt.sign({userId: user._id , roles:user.roles} , process.env.REFREASH_TOKEN_SECRET , {expiresIn:process.env.REFRESH_TOKEN_EXPIRATION_PERIOD});
        return token
    }
    catch(err)
    {
        return errorReport(err)
    }
}


module.exports = {generateToken}