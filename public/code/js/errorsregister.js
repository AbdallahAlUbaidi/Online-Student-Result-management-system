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
};
//show hide password register page js

const password = document.getElementById("passwordField");
const showPassword = document.getElementById("show-password");
const pass = document.getElementById("conformPassword");
const showPass = document.getElementById("show-pass");
function fun(){
  password.type='password';
  showPassword.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';
 
};
if(password.type='text'){

showPassword.innerHTML=' <i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>';
}

window.onload=fun();

showPassword.addEventListener('click', () => {

   if (password === "")  {
    
    showPassword.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';


  } 
 else if (password.type === "password") {
    password.type = 'text';
    pass.type='text';

    
    
    showPassword.innerHTML= ' <i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>';
    showPass.innerHTML='<i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>'

  
  } else if (password.type === "text")  {
    password.type = 'password';
    pass.type='password';
    showPassword.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';
    showPass.innerHTML='<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>'

  } 

});

function fun2(){
  pass.type='password';
  showPass.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';
 
};
if(pass.type='text'){

showPass.innerHTML=' <i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>';
}


window.onload=fun2();


showPass.addEventListener('click', () => {
  // console.log(password)
 
 if (pass.type === "password") {
    pass.type = 'text';
    password.type='text';
    
    
    showPass.innerHTML= ' <i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>';
    showPassword.innerHTML='<i class="bi bi-eye-fill position-absolute top-0 end-0 eye2"></i>'
  //  showPassword.remove('<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye"></i>');
  
  } else if (pass.type === "text")  {
    pass.type = 'password';
    password.type='password';
    showPass.innerHTML= '<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>';
    showPassword.innerHTML='<i class="bi bi-eye-slash-fill  position-absolute top-0 end-0 eye2"></i>'

  } 

});
let select = document.querySelector('.form-select');

select.onfocus = function() {
    this.style.transition = 'transform 0.2s ease-out';
    this.style.transform = 'translateY(-3.5px)';
}

select.onblur = function() {
    this.style.transition = 'transform 0.2s ease-out';
    this.style.transform = 'translateY(0)';
};



