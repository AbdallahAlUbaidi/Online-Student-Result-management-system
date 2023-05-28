const uploadBtn = document.querySelector(".upload-excel-file");

const excelName = {
    "studentId":"studentId",
    "تقييم يومي":"evaluationScore",
    "امتحان فصلي":"midTermScore",
    "امتحان نهائي":"finalExamScore",
};


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
            const url = `/grades/${courseTitle}/save?role=${role}`;
            const response = await axios({
                method:'post',
                url,
                data:jsonData
            });
            console.log({response});
        }
        fileReader.readAsArrayBuffer(selectedFile);
    });

});
