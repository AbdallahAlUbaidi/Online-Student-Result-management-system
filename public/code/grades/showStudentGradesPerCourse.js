const coursesTable = document.getElementById("courses-table");
if(coursesTable){
    window.addEventListener("load" , async ()=>{
        const res = await axios.get("/grades/student");
        const {fields , records , message} = res.data;
        loader.style.display = 'none';
        if(records.length === 0){
            coursesTable.style.display = 'none';
            noGradesMessage.style.display = "block";
        }
        if(message){
            coursesTable.display = 'none';
            tableContainer.appendChild(noGradesMessage);
            noGradesMessage.style.display = 'block';
            return;
        }
        makeTableHeadings(fields , coursesTable , "" ,'bg-secondary text-white col');
        const tableBody = document.createElement("tbody")
        records.forEach(record =>{
            const newTableRecord = makeTableRecord(coursesTable , record , fields , "" , "" ,  'input-course');
            tableBody.appendChild(newTableRecord);
        })
        coursesTable.appendChild(tableBody);
    })
}

