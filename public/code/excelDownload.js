const downloadBtn = document.querySelector(".download-excel-file");
const excelDisplayName = {
    studentFullName:"اسم الطالب",
    evaluationScore:"تقييم يومي",
    midTermScore:"امتحان فصلي",
    preFinalScore:"سعي نهائي",
    finalExamScore:"امتحان نهائي",
    totalScore:"درجة نهائية"
};

downloadBtn.addEventListener("click" , async ()=> {
    let filters = [
        {
            gradeStatus: "",
            student:{
                branch:"information engineering",
                study:"morning",
                stage:undefined,
                studentFullName:undefined
            }
        },
        {
            gradeStatus: "",
            student:{
                branch:"information engineering",
                study:"evening",
                stage:undefined,
                studentFullName:undefined
            }
        },
        {
            gradeStatus: "",
            student:{
                branch:"network engineering",
                study:"morning",
                stage:undefined,
                studentFullName:undefined
            }
        },
        {
            gradeStatus: "",
            student:{
                branch:"network engineering",
                study:"evening",
                stage:undefined,
                studentFullName:undefined
            }
        }
    ]
    filters.forEach(async (filter) => {
        const {records , fileName} = await getGradesAsExcel(filter);
        if(records)
            convertJsonToExcel(records , fileName);
    });
});

async function getGradesAsExcel(filter){
    const courseTitle = table.getAttribute("course");
    const role = table.getAttribute("role");
    const branchName = filter.student.branch;
    const study = filter.student.study;
    let fileName = `${courseTitle.replace(/-/gi , " ")}-${branchName}-${study} study`;
    const url = `/grades/${courseTitle}/${role}`
    const response = await axios(url , {
        params:{
            page:0,
            filter
        }
    });
    let {records , fields} = response.data;
    fields = fields.filter(f => f.name !== "gradeStatus").map(field => field.name);
    records = records.map(record => {
        let newRecord = {};
        newRecord.studentId = record.studentId;
        fields.forEach(field => {
            newRecord[excelDisplayName[field]] = record[field].value;
        });
        return newRecord;
    });
    return {records , fileName};
}

function convertJsonToExcel(jsonData, filename) {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(jsonData);
    const hiddenColumn = XLSX.utils.decode_range(worksheet['!ref']).s.c;
    worksheet['!cols'] = [{ width: 0, hidden: true, __rowNum__ : hiddenColumn }];
    XLSX.utils.book_append_sheet(workbook, worksheet, "sheet1");
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = filename;
    downloadLink.click();
  }