const table = document.getElementById('grades-table');

if(table)
{
    window.addEventListener('load' , async ()=>{
        const {fields , records} = await getGrades(table.attributes.role.value , table.attributes.course.value);
        makeTableHeadings(fields , table,"col","text-white");
        records.forEach(record =>{
            const newTableRecord = makeTableRecord(record , fields,"row");
            table.appendChild(newTableRecord);
        })
    });
}
// كلاسات table ما عرفت شحط
// انت حطهن
// {/* <div class="container my-5   container-e">
//   <div class="row  ">
//     <div class="col-md-12">
//       <table class="table table-hover  ">
//         <thead class="bg-secondary text-white">
//           <tr>
//             <th scope="col" >Student</th>
//             <th scope="col" >grade status</th>
//             <th scope="col">Daily grade</th>
//             <th scope="col">Mid grade</th>
//              */}
          

//مال input 
//input-animation   
//input-course
//bottom span-course
//right span-course
//top span-course
//left span-course

async function getGrades(role , courseTitle){
    try{
        const response = await axios.get(`/grades/${courseTitle}/${role}`);
        if (!response)
            throw new Error('Server did not respond')
        const {fields , records} = response.data;
        return {fields , records};
    }catch(err){
        console.log(err);
    }
}

function makeTableHeadings(fields , table  , tableHeadingClasses = ''){
    fields.forEach(field =>{
        const tableHeading = document.createElement('th');
        tableHeading.innerHTML = field.displayName;
        if(tableHeadingClasses)
            tableHeading.classList.add(tableHeadingClasses);
        table.appendChild(tableHeading);
    })
}


function makeTableRecord(recordValues , fields , tableRecordClasses = '' , tableCellClasses = ''){
    const tableRecord = document.createElement('tr');
    tableRecord.setAttribute('student-id' , recordValues.studentId);
    if(tableCellClasses)
        tableRecord.classList.add(tableRecordClasses);
    fields.forEach(field =>{
        const {value , isWritable} = recordValues[field.name];
        const tableCell = makeTableCell(value , isWritable ,  field.name , tableCellClasses);
        tableRecord.appendChild(tableCell);
    })
    return tableRecord;
}

function makeTableCell(value , isWritable  , field , tableCellClasses = ''){
    const tableCell = document.createElement('td');
    if(tableCellClasses)
        tableCell.classList.add(tableCellClasses);
    if(!isWritable)
        tableCell.innerHTML = value? value: '';
    else if(!value)
        tableCell.innerHTML = `<input type = "text" field=${field}>`;
    else
        tableCell.innerHTML = `<input type = "text" field=${field} value = "${value}">`;
    return tableCell;
}
