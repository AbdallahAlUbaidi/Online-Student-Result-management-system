const facultyMemberImageContainer = Array.from(document.querySelectorAll('.faculty-card .img-container'));

function loadFacultyProfileImage(facultyMemberImageContainer){
    facultyMemberImageContainer.forEach(imgContainer =>{
        const imageWidth = getImageWidth(imgContainer.clientWidth)
        const profileImg = imgContainer.getAttribute('profileImg');
        let url;
        if(profileImg)
            url = `/images/profileImages/${profileImg}/resized${imageWidth}px.png`;
        else
            url = "/images/Default profile picture.png";
        imgContainer.style = `background: linear-gradient(rgba(85, 85, 85, 0.25), rgba(85, 85, 85, 0.25)), url("${url}") ;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;`;
    })
}

if(facultyMemberImageContainer.length > 0){
    window.addEventListener('load' , ()=>{
        loadFacultyProfileImage(facultyMemberImageContainer);
    })
    window.addEventListener('resize' , ()=>{
        loadFacultyProfileImage(facultyMemberImageContainer);
    })
}