let fieldsArray = Array.from(document.getElementsByClassName('inputTextField'))
let fieldErrorsArray = Array.from(document.getElementsByClassName('inputTextFieldError'))
for(let i = 0 ; i < fieldsArray.length ; i++){
    errorHandler(fieldsArray[i] , fieldErrorsArray[i])
}


function errorHandler(textField , errorContainer){
  
    if(errorContainer.innerHTML !== ''){
        textField.placeholder = errorContainer.innerHTML
        textField.classList.add('textField')
    }
    else{
        textField.classList.remove('textField')
    }
}

const password = document.getElementById("passwordField");
const showPassword = document.getElementById("show-password");
function fun(){
  password.type='password';
  showPassword.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';
 
};
if(password.type='text'){

showPassword.innerHTML=' <i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>';
}

window.onload=fun();

showPassword.addEventListener('click', () => {
  console.log(password)
   if (password === "")  {
    
    showPassword.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';
  } 
 else if (password.type === "password") {
    password.type = 'text';
    
    
    showPassword.innerHTML= ' <i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>';

  
  } else if (password.type === "text")  {
    password.type = 'password';
    showPassword.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';

  } 

});



