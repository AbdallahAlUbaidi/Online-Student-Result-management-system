const jwt = require('jsonwebtoken');
const errorReport = require('../errorReport')

function generateEmailConfirmationToken(user)
{
    return jwt.sign({userId:user._id} , process.env.EMAIL_TOKEN_SECRET , {expiresIn:'7d'});
}


function verifyEmailConfirmationToken(emailToken)
{
    try
    {
        return jwt.verify(emailToken , process.env.EMAIL_TOKEN_SECRET )
    }
    catch(err)
    {
        return errorReport(err);
    }
}

function generateEmailCheckToken(user)
{
    return jwt.sign({userId:user._id} , process.env.CHECK_VERIFY_TOKEN_SECRET ,{expiresIn:'3d'})
}

function verifyEmailCheckToken(checkToken)
{
    try
    {
        return jwt.verify(checkToken , process.env.CHECK_VERIFY_TOKEN_SECRET)
    }
    catch(err)
    {
        return errorReport(err)
    }
}




module.exports = { generateEmailConfirmationToken , verifyEmailConfirmationToken , generateEmailCheckToken , verifyEmailCheckToken}