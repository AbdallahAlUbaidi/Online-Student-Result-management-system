if(submitButton){
  submitButton.addEventListener('click' , async ()=>{
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    let records = [];
    rows.forEach(row =>{
      const newRecord = {studentId:row.getAttribute('student-id')}
      records.push(newRecord);
    })
    try{
      const res = await axios({
          method:'post',
          url:`/grades/${table.getAttribute('course')}/submit`,
          data:records
        });
        if(!res)
          showFlashMessage("Network Error, No response from the server" , 0  , 5000 , messagesPool);
        else if(res.data.message){
          showFlashMessage(res.data.message , res.data.messageType  , 4000 , messagesPool);
          refreshTable(table , table.currentPage , tablePaginationButtonsContainer);
        }

    }catch(err){
      if(err.response.data.message)
        showFlashMessage(err.response.data.message , 0  , 5000 , messagesPool);
      else
        showFlashMessage("Somthing went wrong" , 0  , 3000 , messagesPool);
    }
  })
}