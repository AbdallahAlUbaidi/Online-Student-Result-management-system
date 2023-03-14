    axios.get('statistics/PHP-Lab/faculty')
          .then((response) => {
            // تخزين البيانات في المصفوفة المناسبة
            const data = response.data;
          })
	var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['90+', '80-89', '70-79', '60-69', '50-59', 'Below 50'],
        datasets: [{
            label: '# of Students',
            //هنا درجات السعي

            data: [3, 5, 8, 10, 12, 15],
            backgroundColor: [
                'rgba(61, 82, 213, 1)',
                'rgba(61, 82, 213, 0.8)',
                'rgba(61, 82, 213, 0.6)',
                'rgba(61, 82, 213, 0.4)',
                'rgba(61, 82, 213, 0.2)',
                'rgba(255, 0, 0, 0.8)'
            ],
            borderColor: 'white',
            borderWidth: 2,
        }]
    },
    options: {
        legend: {
            display: true,
            position: 'right'
        },
        cutoutPercentage: 70,
        responsive: false,
        maintainAspectRatio: true,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                },
                gridLines: {
                    display: false,
                    drawBorder: false,
                },
            }],
            xAxes: [{
                ticks: {
                    display: false,
                },
                gridLines: {
                    display: false,
                    drawBorder: false,
                },
            }]
        },
        tooltips: {
            enabled: false,
        },
        plugins: {
            datalabels: {
                formatter: function(value, context) {
                    return context.chart.data.labels[context.dataIndex];
                },
                color: 'white',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            }
        }
    }
});

	// البيانات التي ستظهر على الرسم البياني
  var data = {
			labels: ['90+', '80-89', '70-79', '60-69', '50-59', 'Below 50'], // عناوين المحاور الأفقية
			datasets: [{
				label: 'Result statistics',
                //هنا درجات المد
				data: [20,23,45,64,32,13,68], // بيانات الرسم البياني
                tension: 0.5, // تعديل مستوى التوتر هنا
        backgroundColor: [
                'rgba(61, 82, 213, 1)',
                'rgba(61, 82, 213, 0.9)',
                'rgba(61, 82, 213, 0.8)',
                'rgba(61, 82, 213, 0.7)',
                'rgba(61, 82, 213, 0.6)',
                'rgba(255, 0, 0, 3)'
            ],
            
				borderColor: '#3d52d5',
				borderWidth: 1
			}]
		};

		// إعدادات الرسم البياني
		var options = {
			responsive: false,
			maintainAspectRatio: true,
			legend: {
				display: false
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true
					},
					gridLines: {
						display: false
					}
				}],
				xAxes: [{
					gridLines: {
						display:false
					}
				}]
			}
		};

		// رسم الرسم البياني
		var ct = document.getElementById('Chart').getContext('2d');
		var myChart = new Chart(ct, {
			type: 'line',
			data: data,
			options: options
		});


    

       
    