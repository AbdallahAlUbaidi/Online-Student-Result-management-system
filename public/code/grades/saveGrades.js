const saveButton = document.getElementById('faculty-save-button');
const submitButton = document.getElementById('faculty-submit-button');


async function saveGrades(courseTitle){
    const url = `/grades/${courseTitle}/save`;
    const data = parseStudentRecordsFromTable();
    try{
        const response = await axios({
            method:'post',
            url,
            data
        })
    }catch(err){
        console.log(err)
    }
}

function parseStudentRecordsFromTable(){
    let studentRecords = [];
    const tableRows = document.querySelectorAll('table tr');
    tableRows.forEach(row =>{
        let record = {};
        const cellsArray = Array.from(row.children).filter(cell => cell.childElementCount === 1);       
        record.studentId = row.getAttribute('student-id');
        cellsArray.forEach(cell => {
            const inputField = cell.firstElementChild;
            const field = inputField.getAttribute('field');
            const value = inputField.value;
            if(value)
                record[field] = value;
        })
        if(cellsArray.length > 0)
            studentRecords.push(record)
    })
    return studentRecords;
}

if(saveButton)
{
    saveButton.addEventListener('click' , ()=>{
        saveGrades(table.getAttribute('course'))
    })    
}
