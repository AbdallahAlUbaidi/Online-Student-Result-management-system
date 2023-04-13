const table = document.getElementById('grades-table');
const tableContainer = document.getElementById('table-container');
const loader = Array.from(document.getElementsByClassName('loader'))[0];
const submitButton = document.getElementById('faculty-submit-button');
const buttonsContainer = Array.from(document.getElementsByClassName('buttons-container'))[0];
const noGradesMessage = Array.from(document.getElementsByClassName('no-grades-message'))[0];
const tablePaginationButtonsContainer = Array.from(document.getElementsByClassName('table-pagination-buttons-container'))[0];
const filterApplyBtn = document.getElementById('filter-apply-btn');
const filterBtn = document.getElementById('filter-btn');

if(table)
{
    window.addEventListener('load' , async () => {
        const {fields , records , message , totalPages , currentPage} = await getGrades(table.attributes.role.value , table.attributes.course.value , getFilter() , 1);
        table.totalPages = totalPages;
        table.currentPage = currentPage;
        // await sleep(2000) //For Debug
        showGradesInTable(table , fields , records , message , tableContainer , noGradesMessage , loader , {} , tablePaginationButtonsContainer);
    });

    if(filterBtn){
        filterBtn.addEventListener('click' , () => {
            const filter = document.getElementsByClassName('filter')[0];
            const filterIcon = document.querySelector('.table-controls i');
            filter.classList.toggle("filter-hidden");
            filterIcon.classList.toggle("fa-filter");
            filterIcon.classList.toggle("fa-close");
        })
    }

    if(filterApplyBtn){
        filterApplyBtn.addEventListener('click' , () => {
            refreshTable(table , 1 , tablePaginationButtonsContainer);
        })
    }
}


async function getGrades(role , courseTitle , filter , page){
    try{

        const response = await axios.get(`/grades/${courseTitle}/${role}` , {
            params:{
                page,
                filter
            }
        });
        if (!response)
            throw new Error('Server did not respond');
        const {fields , records , message , totalPages , currentPage} = response.data;
        return {fields , records , message , totalPages , currentPage};
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
    }else if(!value){
                tableCell.innerHTML = `
        <div class = "input-animation">
            <input type = "text" field=${field} class = "${inputFieldClasses}" placeholder = 'Enter Score'>
            <span class="bottom span-course"></span>
            <span class="right span-course"></span>
            <span class="top span-course"></span>
            <span class="left span-course"></span>
        </div>`;
        const cellField = tableCell.firstElementChild.firstElementChild
        cellField.addEventListener('change' , ()=>{
            table.modified = true;
        });
        cellField.addEventListener('focusin' , ()=>{
            submitButton.disabled = true;
        })
        cellField.addEventListener('focusout' , ()=>{
            if(!table.modified){
                submitButton.disabled = false;
            }
        })
    }else{
        tableCell.innerHTML = `
        <div class = "input-animation">
            <input type = "text" field=${field} value = "${value}" class = "${inputFieldClasses}" placeholder = 'Enter Score'>
            <span class="bottom span-course"></span>
            <span class="right span-course"></span>
            <span class="top span-course"></span>
            <span class="left span-course"></span>
        </div>
        `;
        const cellField = tableCell.firstElementChild.firstElementChild
        cellField.addEventListener('change' , ()=>{
            table.modified = true;
        });
        cellField.addEventListener('focusin' , ()=>{
            submitButton.disabled = true;
        })
        cellField.addEventListener('focusout' , ()=>{
            if(!table.modified){
                submitButton.disabled = false;
            }
        })

    }
    return tableCell;
}

function showGradesInTable(table , fields , records , message , tableContainer , noGradesMessage , loader , filter , paginationContainer){
    loader.style.display = 'none';
    createPaginationButtons(table , filter , paginationContainer);
    if(message){
        table.display = 'none';
        paginationContainer.style.display = 'none';
        buttonsContainer.style.display = 'none';
        tableContainer.appendChild(noGradesMessage);
        noGradesMessage.style.display = 'block';
        return;
    }
    noGradesMessage.style.display = 'none';
    paginationContainer.style.display = 'flex';
    buttonsContainer.style.display = 'block';
    makeTableHeadings(fields , table , "" ,'bg-secondary text-white col');
    const tableBody = document.createElement("tbody")
    records.forEach(record =>{
        const newTableRecord = makeTableRecord(record , fields , "" , "" ,  'input-course');
        tableBody.appendChild(newTableRecord);
    })
    table.appendChild(tableBody);
}

async function refreshTable(table , page , paginationContainer){
    if(table.modified)
        saveGrades(table.getAttribute('course'));
    table.innerHTML = '';
    loader.style.display = 'block';
    table.modified = false;
    const filter = getFilter();
    const {fields , records , message , totalPages} = await getGrades(table.attributes.role.value , table.attributes.course.value , filter , page);
    if(totalPages){
        table.totalPages = totalPages;
    }
    table.currentPage = page;

    // await sleep(2000) //For Debug
    showGradesInTable(table , fields , records , message , tableContainer , noGradesMessage , loader , filter , paginationContainer);

}

function createPaginationButtons(table , filter , container) {
    container.innerHTML = '';
    for(let i = 0 ; i < table.totalPages ; i++){
        const button = document.createElement('button');
        button.id = i + 1;
        button.innerHTML = i + 1;
        button.disabled  = Boolean(table.currentPage == i + 1);
        button.addEventListener('click' , ()=>{
        refreshTable(table  , i+1 , container);
        });
        container.appendChild(button);
    }
}


function getFilter() {
    const studentName = document.getElementById("student-name").value.trim();
    const gradeStatus = document.getElementById('grade-status').value.trim();
    const IE = document.getElementById('IE').checked;
    const NE = document.getElementById('NE').checked;
    let branch = undefined;
    if(!IE || !NE)
        if(IE)
            branch = "information engineering";
        else
            branch = "network engineering";
    return {
        student:{
            studentFullName:studentName,
            branch
        },
        gradeStatus
    };

}