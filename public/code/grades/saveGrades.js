const saveButton = document.getElementById('faculty-save-button');
const messagesPool = document.getElementById('messages-container');



async function saveGrades(courseTitle){
    const url = `/grades/${courseTitle}/save`;
    const data = parseStudentRecordsFromTable();
    try{
        const response = await axios({
            method:'post',
            url,
            data
        });
        if(response.data.message === "There are no grades to save or cannot be saved"){
            showFlashMessage(response.data.message , 2  , 4000 , messagesPool);
            return;
        }
        const {results} = response.data;
        const modified = results.filter(r => r.modifiedCount > 0);
        let erroringCells;
        if(modified.length === 0){
            showFlashMessage("Grades was not modified since the last save" , 2  , 5000 , messagesPool);
            Array.from(document.getElementsByClassName("input-animation")).forEach(inputDiv => {
                inputDiv.classList.remove('inputField-container-error');
            });
            submitButton.disabled = false;
            table.modified = false;

            return;
        }
        showFlashMessage("Grades saved successfully" , 1  , 5000 , messagesPool);
        Array.from(document.getElementsByClassName("input-animation")).forEach(inputDiv => {
            inputDiv.classList.remove('inputField-container-error');
        });
        submitButton.disabled = false;
        table.modified = false;
    }catch(err){
        if(!err.response || !err.response.data.errors){
            console.log(err);
            showFlashMessage("Network Error, No response from the server" , 0  , 5000 , messagesPool);
            return;
        }
        const errorsInfo = err.response.data;
        let errorMessages = [];
        errorsInfo.errors.forEach(err => {
            const studentId = err.student;
            const raw = document.querySelector(`[student-id="${studentId}"]`);
            const rawCells = Array.from(raw.children);
            const recordErrMessages = err.reason.errors;
            const inputCells = rawCells.filter(cell => cell.childElementCount === 1);
            erroringCells = inputCells.filter((cell , index) => {
                const inputFieldContainer = cell.firstElementChild;
                const inputField = inputFieldContainer.firstElementChild;
                const field = inputField.getAttribute('field');
                return Boolean(recordErrMessages[field]);
            });
            Object.values(recordErrMessages).forEach(message => {
                if (!(errorMessages.includes(message)))
                    errorMessages.push(message);
            })
            for(i in erroringCells){
                const inputFieldContainer = erroringCells[i].firstElementChild;
                inputFieldContainer.classList.add("inputField-container-error");
            }
        });
        for(i in errorMessages){
            showFlashMessage(errorMessages[i] , 0 , 4000 + 2000 * i , messagesPool);
        }
    }
}

function parseStudentRecordsFromTable(){
    let studentRecords = [];
    const tableRows = document.querySelectorAll('table tbody tr');
    tableRows.forEach(row =>{
        let record = {};
        const cellsArray = Array.from(row.children).filter(cell => cell.childElementCount === 1);       
        record.studentId = row.getAttribute('student-id');
        cellsArray.forEach(cell => {
            const inputFieldContainer = cell.firstElementChild;
            const inputField = inputFieldContainer.firstElementChild;
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
        saveGrades(table.getAttribute('course'));
    })    
}
