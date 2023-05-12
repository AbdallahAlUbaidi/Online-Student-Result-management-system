const flashMessageBox = Array.from(document.getElementsByClassName('flash-message-container'))[0]
const flashMessageExit = Array.from(document.getElementsByClassName('flash-message-exit'))[0]


function hideFlashMessage(flashMessageBox){
    if(!flashMessageBox)
        return;
    flashMessageBox.remove();
}

function showFlashMessage(message , messageType = 2 , duration = 5000 , container = document.getElementsByTagName('body')[0]){
    //Message type is an integer where 0 indicates an error, 1 sucesss , and 2 is an info
    const messageBoxClassArray = ['flash-message-box-error' , 'flash-message-box-success' , 'flash-message-box-inform'];
    const iconClassArray = ['bi-shield-fill-exclamation' , 'bi-check-circle-fill' , 'bi-info-square-fill'];
    const messageClass = messageBoxClassArray[messageType];
    const iconClass = iconClassArray[messageType];
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('flash-message-container');

    const messageBox = document.createElement('div');
    messageBox.classList.add('flash-message-box');
    messageBox.classList.add(messageClass);
    messageContainer.appendChild(messageBox);

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('flash-message-icon');
    const icon = document.createElement('i');
    icon.classList.add('bi');
    icon.classList.add(iconClass);
    iconSpan.appendChild(icon);
    messageBox.appendChild(iconSpan);

    const messageSpan = document.createElement('span');
    messageSpan.classList.add("flash-message");
    messageSpan.innerHTML = message;
    messageBox.appendChild(messageSpan);

    const exitBtnSpan = document.createElement('span');
    exitBtnSpan.classList.add('flash-message-exit');
    const exitIcon = document.createElement('i');
    exitIcon.classList.add('bi');
    exitIcon.classList.add('bi-x-lg');
    exitBtnSpan.appendChild(exitIcon);
    messageBox.appendChild(exitBtnSpan);
    if(container){
        container.insertBefore(messageContainer , container.firstChild);
        setTimeout(() => {
            hideFlashMessage(messageContainer)
        }, duration);
    }
    exitFlashMessage(messageContainer , exitBtnSpan);
    return messageContainer;
}

function exitFlashMessage(flashMessageBox , flashMessageExit){if(!flashMessageBox) return; flashMessageExit.addEventListener('click' , ()=>{hideFlashMessage(flashMessageBox)})}

exitFlashMessage(flashMessageBox , flashMessageExit)
window.addEventListener('load' , ()=>{setTimeout(()=>{hideFlashMessage(flashMessageBox)} , 5000)})

exitFlashMessage(flashMessageBox , flashMessageExit)