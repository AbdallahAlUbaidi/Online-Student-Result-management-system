const messagesPool = document.getElementById('messages-container');



axios.interceptors.response.use(res=>res,
function(error){
    if(error.response.status === 403){
        showFlashMessage(error.response.data.message , 0 , 3500 , messagesPool);
    }
    if(error.response.status === 404){
        let message = error.response.data.message;
        showFlashMessage(message || "Resourse not found" , 0 , 3500 , messagesPool);
    }
    return error;
});