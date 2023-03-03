const courseImageContainers = Array.from(document.querySelectorAll('.img-container'));

function loadCoursesImage(courseImageContainers){
    courseImageContainers.forEach(imgContainer =>{
        const imageWidth = getImageWidth(imgContainer.clientWidth)
        const courseTitle = imgContainer.getAttribute('courseTitle');
        const url = `/images/courseImages/${courseTitle}/resized${imageWidth}px.png`;
        imgContainer.style = `background: linear-gradient(rgba(85, 85, 85, 0.25), rgba(85, 85, 85, 0.25)), url("${url}") ;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;`;
    })
}

function getImageWidth(imageContainerWidth){
    const sizes = [150 , 200 , 250 , 500];
    let imageSizeIndex = 0;
    for(i in sizes){
        let sizeDiffrence = Math.abs(sizes[imageSizeIndex] - imageContainerWidth);
        let newSizeDifference = Math.abs(sizes[i] - imageContainerWidth);
        if(sizeDiffrence > newSizeDifference)
            imageSizeIndex = i;
    }
    return sizes[imageSizeIndex];

}

if(courseImageContainers.length > 0){
    window.addEventListener('load' , ()=>{
        loadCoursesImage(courseImageContainers);
    })
    window.addEventListener('resize' , ()=>{
        loadCoursesImage(courseImageContainers);
    })
}