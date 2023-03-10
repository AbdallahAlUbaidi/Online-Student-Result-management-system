const table = document.getElementById('grades-table');

if(table)
{
    window.addEventListener('load' , async ()=>{
        const {fields , records} = await getGrades(table.attributes.role.value , table.attributes.course.value);
        makeTableHeadings(fields , table , "" ,'bg-secondary text-white col');
        const tableBody = document.createElement("tbody")
        records.forEach(record =>{
            const newTableRecord = makeTableRecord(record , fields , "" , "" ,  'input-course');
            tableBody.appendChild(newTableRecord);
        })
        table.appendChild(tableBody);
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

function makeTableHeadings(fields , table  , tableHeadingCellClasses = "" , tableHeadingClasses = ""){
    const thClasses = tableHeadingCellClasses.trim().split(' ');
    const tHeadClasses = tableHeadingClasses.trim().split(' ');
    const tHead = document.createElement('thead')
    tHeadClasses.forEach(className =>{
        tHead.classList.add(className)
    })
    const thRow = document.createElement('tr')
    fields.forEach(field =>{
        const tableHeading = document.createElement('th');
        tableHeading.innerHTML = field.displayName;
        if(tableHeadingCellClasses)
        thClasses.forEach(className =>{
                tableHeading.classList.add(className)
            })
            tableHeading.scope = 'col'
        thRow.appendChild(tableHeading);
        tHead.appendChild(thRow)
    })
    table.appendChild(tHead)
}


function makeTableRecord(recordValues , fields , tableRecordClasses = '' , tableCellClasses = '' , inputFieldClasses = ''){
    const tableRecord = document.createElement('tr');
    tableRecord.setAttribute('student-id' , recordValues.studentId);
    if(tableRecordClasses)
        tableRecord.classList.add(tableRecordClasses);
    fields.forEach(field =>{
        const {value , isWritable} = recordValues[field.name];
        const tableCell = makeTableCell(value , isWritable ,  field.name , tableCellClasses , inputFieldClasses);
        tableRecord.appendChild(tableCell);
    })
    return tableRecord;
}

function makeTableCell(value , isWritable  , field , tableCellClasses = '' , inputFieldClasses = ''){
    const tableCell = document.createElement('td');
    const tdClasses = tableCellClasses.trim().split(' ')
    if(tableCellClasses){
        tdClasses.forEach(className =>{
            tableCell.classList.add(className)
        })
    }
    if(!isWritable)
    {
        tableCell.innerHTML = value? value: '';
        tableCell.scope = 'row'
    }
    else if(!value)
        tableCell.innerHTML = `
        <div class = "input-animation">
            <input type = "text" field=${field} class = "${inputFieldClasses}" placeholder = 'Enter Score'>
            <span class="bottom span-course"></span>
            <span class="right span-course"></span>
            <span class="top span-course"></span>
            <span class="left span-course"></span>
        </div>`;
    else
        tableCell.innerHTML = `
        <div class = "input-animation">
            <input type = "text" field=${field} value = "${value}" class = "${inputFieldClasses}" placeholder = 'Enter Score'>
            <span class="bottom span-course"></span>
            <span class="right span-course"></span>
            <span class="top span-course"></span>
            <span class="left span-course"></span>
        </div>
        `;
    return tableCell;
}
