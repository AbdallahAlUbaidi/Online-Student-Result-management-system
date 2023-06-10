const uploadBtn = document.querySelector(".upload-excel-file");

const excelName = {
    "studentId":"studentId",
    "تقييم يومي":"evaluationScore",
    "امتحان فصلي":"midTermScore",
    "امتحان نهائي":"finalExamScore",
};

if(uploadBtn)
    uploadBtn.addEventListener("click" , ()=> {
        const fileInput = document.createElement('input');
        const courseTitle = table.getAttribute("course");
        const role = table.getAttribute("role");
        fileInput.type = "file";
        fileInput.accept = '.xlsx, .xls';
        fileInput.click();
        fileInput.addEventListener('change', async () => {
            const selectedFile = fileInput.files[0];
            const fileReader = new FileReader();
            fileReader.onload = async (e)=>{
                const fileData = new Uint8Array(e.target.result);
                const workbook = XLSX.read(fileData, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                let jsonData = XLSX.utils.sheet_to_json(worksheet);
                jsonData = jsonData.map(record => {
                    if(!record.studentId){
                        return "Invalid";
                    }
                    let newRecord = {};
                    const fields = Object.keys(record);
                    fields.forEach(field => {
                        newRecord["studentId"] = record["studentId"];
                        if(excelName[field])
                            newRecord[excelName[field]] = record[field];
                        else
                            delete newRecord[field]
                    });
                    return newRecord;
                }).filter(r=>r);
                if(jsonData.includes("Invalid")){
                    showFlashMessage("Invalid xlsx or xsx format" , 0  , 5000 , messagesPool);
                    return
                }
                const url = `/grades/${courseTitle}/save?role=${role}`;
                try{
                    const response = await axios({
                        method:'post',
                        url,
                        data:jsonData
                    });
                    if(response.name === "AxiosError")
                throw(response);
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
                    if(submitButton)
                        submitButton.disabled = false;
                    table.modified = false;
                    return;
                }
                showFlashMessage("Grades saved successfully" , 1  , 5000 , messagesPool);
                Array.from(document.getElementsByClassName("input-animation")).forEach(inputDiv => {
                    inputDiv.classList.remove('inputField-container-error');
                });
                if(submitButton)
                    submitButton.disabled = false;
                table.modified = false;
                refreshTable(table , table.currentPage , tablePaginationButtonsContainer);
                }catch(err){
                    if(!err.response || !err.response.data.errors){
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
                    });
                    for(i in errorMessages){
                        showFlashMessage(errorMessages[i] , 0 , 4000 + 2000 * i , messagesPool);
                    }
                }
                
            }
            fileReader.readAsArrayBuffer(selectedFile);
        });

    });
