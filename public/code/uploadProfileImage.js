const profileImageBtn = document.querySelector(".circular-button");

if(profileImageBtn){
    profileImageBtn.addEventListener("click" , ()=> {
        const imgInput = document.createElement("input");
        imgInput.type = "file";
        imgInput.accept = ".jpg,.jpeg,.png";
        imgInput.click();
        imgInput.addEventListener("change" , async ()=> {
            const selectedFile = imgInput.files[0];
            const formData = new FormData();
            formData.append('profileImage' , selectedFile);
            try{
                const response = await axios.post("/profileImage/upload" , formData , {
                    headers:{
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if(response.name === "AxiosError")
                    throw(response);
                const { messageType , message } = response.data;
                showFlashMessage(message , messageType , 3500 , messagesPool);
                loadImage(profileImageBtn);
            }catch(err){
                if(err.response){
                    const {message , messageType} = err.response.data;
                    showFlashMessage(message , messageType , 3500 , messagesPool);
                }else{
                    console.log(err);
                    showFlashMessage("An Error Occured" , 0 , 3500 , messagesPool);
                }

            }
        });
    });
}