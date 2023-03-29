const statisticContainer = document.getElementById('statistics-container')
const fieldNames = {
  midTerm: 'Mid Term Exam',
  preFinal: 'Pre Final Score',
  finalExam: 'Final Exam',
  totalScore: 'Total Score'
}


if(statisticContainer){
    window.addEventListener('load' , async () => {
        const role = statisticContainer.getAttribute('role');
        const courseTitle = statisticContainer.getAttribute('courseTitle');
        const result = await getStatisticsData(role , courseTitle);
        if(result.message){
          statisticContainer.innerHTML = `<p>${result.message}</p>`;
          return;
        }
        const fields = Object.keys(result);
        fields.forEach(field => {
          const {failPercentage , criticalFailPercentage , percentageOfAbsence , scores , maxScore , standardDeviation , meanValue} = result[field];
          const filteredScores = scores.filter(score => typeof score === "number");
          const {fieldContainer , canvases} = makeFieldStatistics(
              result[field] , 
              field , 
              fieldNames[field] , 
              Boolean(percentageOfAbsence) , 
              filteredScores.length , 
              standardDeviation.toFixed(2) , 
              meanValue.toFixed(2) , 
              ['chart-container'] , //Chart container classes
              ['shadow' , 'chart-canvas'] , //Canvas classes
              ['field-container'] , //Field container classes
              ['field-div' , 'shadow' , "titl"], //Field Title Classes
              ['field-div' , 'shadow' , 'sub1'] , //Field Total Students Classes
              ['field-div' , 'shadow' , 'sub2'] , //Field Mean Classes
              ['field-div' , 'shadow','sub3']   //Field stdDev Classess
          );
          statisticContainer.appendChild(fieldContainer);
          makeDoughnutChart(canvases[0] , failPercentage , criticalFailPercentage , percentageOfAbsence);
          makeHistogramChart(canvases[1] , scores , maxScore);
        })
    })
}



async function getStatisticsData(role , courseTitle) {
    try{
        const response = await axios.get(`/courses/statistics/${courseTitle}/faculty`);
        return response.data;
        
    }catch(err){
        console.log(err);
    }
}


function makeFieldStatistics(field , fieldName , fieldText , isExam , totalNum , stdDev , meanValue , chartContainerClasses = [] , canvasClasses = [] , fieldContainerClasses = [] , fieldTitleClasses = [] , fieldTotalClasses = [] , fieldMeanClasses = [] , fieldStdDevClasses = []) {
  const charts = ['doughtnut' , 'histogram'];
  let canvases = [];
  const fieldContainer = createDiv(`${fieldName}-statistics-container` , '' , fieldContainerClasses);
  const fieldTitleDiv = createDiv(`${fieldName}-field-title` , fieldText , fieldTitleClasses,['fas fa-clipboard-list']);
  const totalNumDiv = createDiv( `${fieldName}-title-div` , `Total Number of ${isExam ? "Participants" :"Students"} : ${totalNum}` ,fieldTotalClasses ,['fas fa-user-graduate']);
  const standardDeviationDiv = createDiv( `${fieldName}-stdDev-div` , `Standard Deviation : ${stdDev}` , fieldStdDevClasses,['fa fa-bar-chart fa-bar-chart-title']);
  const meanValueDiv = createDiv( `${fieldName}-meanValue-div` , `Mean Value : ${meanValue}` , fieldMeanClasses,['fas fa-angle-double-down']);
  fieldContainer.appendChild(fieldTitleDiv);
  fieldContainer.appendChild(totalNumDiv);
  fieldContainer.appendChild(standardDeviationDiv);
  fieldContainer.appendChild(meanValueDiv);
  charts.forEach(chartName => {
    const chartContainer = createDiv(`${chartName}-chart-container` , '' , chartContainerClasses);
    const canvas = document.createElement('canvas');
    canvasClasses.forEach(className => {canvas.classList.add(className)});
    canvas.id = `${chartName}-canvas`;
    canvases.push(canvas);
    chartContainer.appendChild(canvas);
    fieldContainer.appendChild(chartContainer);
  });
  return {fieldContainer , canvases};
}

function makeHistogramChart(canvas , scores , maxScore){
    const filteredScores = scores.filter(score => typeof score === "number");
    const {binWidth , numBins} = calculateBinWidth(filteredScores , maxScore);
    const ranges = calculateBinRanges(binWidth , numBins);
    const {distripution , distriputionInPercentage} = distriputeScores(ranges , filteredScores);
    const labels = ranges.map(range => `${range[0]}-${range[1]}`);
    const config = {
      type: "line",
      data: {
        datasets: [
          {
            label:'Percentage of students',
            data: distriputionInPercentage,
            fill: false,
            tension:0.3,
            backgroundColor: [
              'rgba(65,80,214,255)'
            ],
            borderWidth: 2,
            borderColor:"rgba(65,80,214,255)"
          },
        ],
        labels,
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return value.toFixed(2) + "%";
              },
            },
          },
        },
        plugins:{
          tooltip:{
            callbacks:{
              label:function(tooltipItem) {
                let label = tooltipItem.dataset.label || '';;
                if(label)
                  label += ': ';
                  if (tooltipItem.parsed.y !== null) {
                    label += tooltipItem.parsed.y + "%";
                }
                return label;
              }
            }
          }
        },
      },
      responsive: true,
      maintainAspectRatio: false
    };
    const chart = new Chart(canvas.getContext('2d'), config);    
}

function makeDoughnutChart(canvas , failPercentage , criticalFailPercentage , percentageOfAbsence){
  let absence = percentageOfAbsence ? percentageOfAbsence : 0;
  let passPercentage = 100 - (failPercentage + absence);
  const outerData = [passPercentage , failPercentage , 0];
  const labels = ['Pass' , 'Fail' , 'Critical Fail'];
  const innerData = [passPercentage , failPercentage - criticalFailPercentage , criticalFailPercentage]
  
  if(percentageOfAbsence !== null && percentageOfAbsence !== undefined){
    outerData.push(absence);
    labels.push('Absent');
    innerData.push(absence);
  }
  const config = {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data:outerData,
          backgroundColor: ['#3e52d5', '#fe3233', '#981e1f' , '#adb7ec'],
          hoverBackgroundColor: ['#4c66d8', '#c62828', '#6e0b0b' , '#c5cae9']
        },
        {
          data:innerData,
          backgroundColor: ['#3e52d5', '#fe3233', '#981e1f' , '#adb7ec'],
          hoverBackgroundColor: ['#4c66d8', '#c62828', '#6e0b0b' , '#c5cae9']
        }
      ],
    options:{
      responsive: true,
      maintainAspectRatio: false
    }
    },
    
  };
  const chart = new Chart(canvas.getContext('2d'), config);    


}

function calculateBinWidth(scores, maxScore) {
  const sortedScores = scores.sort((a, b) => a - b);
  const q1 = sortedScores[Math.floor(sortedScores.length / 4)];
  const q3 = sortedScores[Math.floor(sortedScores.length * 3 / 4)];
  const iqr = q3 - q1;
  const n = scores.length;
  const binWidth = Math.floor(2 * iqr / Math.pow(n, 1/3));
  const numBins = Math.ceil(maxScore / binWidth);
  return { binWidth, numBins };
}

function calculateBinRanges(binWidth , numBins){
  let ranges = [];
  for(let i = binWidth ; i <= numBins * binWidth; i += binWidth){
      const bin = [i - binWidth , i];
      ranges.push(bin); 
  }
  return ranges;
}

function distriputeScores(ranges , scores){
  const distripution = new Array(ranges.length).fill(0);
  scores.forEach(score => {
      for(binIndex in ranges){
        const range = ranges[binIndex];
        if(binIndex == ranges.length - 1){
            if(score >= range[0] && score <= range[1])
                distripution[binIndex]++;
        }
        else{
            if(score >= range[0] && score < range[1])
                distripution[binIndex]++;
        }
      }
  });
  let distriputionInPercentage = [];
  distripution.forEach(binCount =>{
      distriputionInPercentage.push(((binCount / scores.length) * 100).toFixed(2));
  })
  return {distripution , distriputionInPercentage};
}
function createDiv(id , text = '' , classes = [] , iconClasses = []){
  const div = document.createElement('div');
  let icon = "";
  if(iconClasses.length !== 0){
    icon =  `<i class="${iconClasses.join(' ')}"></i>`;
  }
  div.id = id;
  if(text)
  div.innerHTML =` ${icon} ${text}`;
  classes.forEach(className => {div.classList.add(className)});
  return div;
}