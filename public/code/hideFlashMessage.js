const flashMessageBox = Array.from(document.getElementsByClassName('flash-message-container'))[0]
const flashMessageExit = Array.from(document.getElementsByClassName('flash-message-exit'))[0]

function hideFlashMessage(flashMessageBox){
    flashMessageBox.style = 'display:none;'
}

function exitFlashMessage(flashMessageBox , flashMessageExit){if(!flashMessageBox) return; flashMessageExit.addEventListener('click' , ()=>{hideFlashMessage(flashMessageBox)})}

exitFlashMessage(flashMessageBox , flashMessageExit)
window.addEventListener('load' , ()=>{setTimeout(()=>{hideFlashMessage(flashMessageBox)} , 5000)})

exitFlashMessage(flashMessageBox , flashMessageExit)