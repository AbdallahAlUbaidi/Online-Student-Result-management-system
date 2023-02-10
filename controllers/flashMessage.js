function showFlashMessage(status , message , req , res , redirectTarget='back')
{
    req.flash('message' , message)
    res.status(status).redirect(redirectTarget)
}


function setCachingToOff(req , res , next)
{
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.header('Expires', '0');
    res.header('Pragma', 'no-cache');
    next()
}


module.exports = {showFlashMessage , setCachingToOff}