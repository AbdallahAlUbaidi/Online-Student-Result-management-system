if(profileImageBtn){
    window.addEventListener("load" , ()=> {
        loadImage(profileImageBtn);
    });   
}

async function loadImage(profileImageBtn) {
    let profileImg = profileImageBtn.getAttribute("profile-img");
    if(!profileImg){
        const response = await axios("/profileImage");
        if(response)
            profileImg = response.data.profileImg;
    }
    if (profileImg) {
      let imgUrl = `/images/profileImages/${profileImg}/resized50px.png`;
      imgUrl += `?timestamp=${new Date().getTime()}`;
      profileImageBtn.style.backgroundImage = '';
      profileImageBtn.offsetHeight;
      profileImageBtn.style.backgroundImage = `url(${imgUrl})`;
      profileImageBtn.setAttribute("profile-img" , "");
    }
  }
  
