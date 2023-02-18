let fieldsArray = Array.from(document.getElementsByClassName('inputTextField'))
let fieldErrorsArray = Array.from(document.getElementsByClassName('inputTextFieldError'))
for(let i = 0 ; i < fieldsArray.length ; i++){
    errorHandler(fieldsArray[i] , fieldErrorsArray[i])
}


function errorHandler(textField , errorContainer){
  
    if(errorContainer.innerHTML.trim() !== ''){
        textField.placeholder = errorContainer.innerHTML
        textField.classList.add('textField')
    }
    else{
        textField.classList.remove('textField')
    }
}