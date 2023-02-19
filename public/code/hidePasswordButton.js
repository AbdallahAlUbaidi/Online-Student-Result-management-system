const passwordFieldsArray = Array.from(document.querySelectorAll('input.passwordField'));
const hidePasswordButtonsArray = Array.from(document.querySelectorAll('input.passwordField ~i.bi-eye-fill'));


function hidePassword(passwordField , hidePasswordButton){
    passwordField.type = 'password';
    hidePasswordButton.classList.add('bi-eye-fill')
    hidePasswordButton.classList.remove('bi-eye-slash-fill')
}

function showPassword(passwordField , hidePasswordButton){
    passwordField.type = 'text';
    hidePasswordButton.classList.remove('bi-eye-fill')
    hidePasswordButton.classList.add('bi-eye-slash-fill')
}

for(let i = 0 ; i < passwordFieldsArray.length ; i++){
    window.addEventListener('load' , ()=>{
        hidePassword(passwordFieldsArray[i] , hidePasswordButtonsArray[i])
    })
    hidePasswordButtonsArray[i].addEventListener('click' , ()=>{
        const passwordField = passwordFieldsArray[i];
        const hidePasswordButton = hidePasswordButtonsArray[i];
        if(passwordField.type === 'text')
            hidePassword(passwordField , hidePasswordButton)
        else
            showPassword(passwordField , hidePasswordButton)
    })

}

