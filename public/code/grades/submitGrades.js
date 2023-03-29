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
    }catch(err){
      console.log(err);
    }
  })
}