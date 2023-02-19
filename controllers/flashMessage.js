function showFlashMessage(status , message , req , res , messageType = '2' , redirectTarget='back')
{
    
    req.flash('message' , message)
    req.flash('messageType' , messageType)

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