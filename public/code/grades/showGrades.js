const table = document.getElementById('grades-table');

if(table)
{
    window.addEventListener('load' , async ()=>{
        const {fields , records} = await getGrades(table.attributes.role.value , table.attributes.course.value);
        makeTableHeadings(fields , table);
        records.forEach(record =>{
            const newTableRecord = makeTableRecord(record , fields);
            table.appendChild(newTableRecord);
        })
    });
}


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
