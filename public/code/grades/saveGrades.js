const saveButton = document.getElementById('faculty-save-button');
const submitButton = document.getElementById('faculty-submit-button');


async function saveGrades(courseTitle){
    const url = `/grades/${courseTitle}/save`;
    const data = parseStudentRecordsFromTable();
    console.log(url)
    try{
        const response = await axios({
            method:'post',
            url,
            data
        })
        console.log(response);
    }catch(err){
        console.log(err)
    }
}

function parseStudentRecordsFromTable(){
    let studentRecords = [];
    const tableRows = document.querySelectorAll('table tr');
    tableRows.forEach(row =>{
        let record = {};
        record.studentId = row.getAttribute('student-id');
        const cellsArray = Array.from(row.children).filter(cell => cell.childElementCount === 1);
        cellsArray.forEach(cell => {
            const inputField = cell.firstElementChild;
            const field = inputField.getAttribute('field');
            const value = inputField.value;
            if(value)
                record[field] = value;
        })
        studentRecords.push(record)
    })
    return studentRecords;
}

saveButton.addEventListener('click' , ()=>{
    console.log(table.getAttribute('course'))
    saveGrades(table.getAttribute('course'))
})


