//Recommendation Chart

 function make_recommendation_chart(d) {
   // Parse the JSON data

   var JSONdata = JSON.parse(d);

   const chartData = JSONdata.map(data => ({
       period: data.period,
       buy: data.buy,
       strongBuy: data.strongBuy,
       hold: data.hold,
       sell: data.sell,
       strongSell: data.strongSell
   }));

   const options = {
       chart: {
           type: 'column',
           renderTo: 'chartsContainer'
       },
       title: {
           text: 'Recommendation Trends'
       },
       xAxis: {
           categories: chartData.map(data => data.period)
       },
       yAxis: {
           min: 0,
           title: {
               text: '# Analysts'
           },
           stackLabels: {
               enabled: true,
               style: {
                   fontWeight: 'bold',
                   color: (Highcharts.defaultOptions.title.style && Highcharts.defaultOptions.title.style.color) || 'gray'
               }
           }
       },
       tooltip: {
           headerFormat: '<b>{point.x}</b><br/>',
           pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
       },
       plotOptions: {
           column: {
               stacking: 'normal',
               dataLabels: {
                   enabled: true
               }
           }
       },
       series: [
           { name: 'Strong Buy', data: chartData.map(data => data.strongBuy), color: '#186f37' },
           { name: 'Buy', data: chartData.map(data => data.buy), color: '#1eb953' },
           { name: 'Hold', data: chartData.map(data => data.hold), color: '#ba8b1d' },
           { name: 'Sell', data: chartData.map(data => data.sell), color: '#e15e57' },
           { name: 'Strong Sell', data: chartData.map(data => data.strongSell), color: '#7a2e2f'}
       ],
       legend: {
           align: 'center',
           verticalAlign: 'bottom',
           x: 0,
           y: 0,
           floating: false,
           shadow: false
       }
   };

   Highcharts.chart(options);
 }


 function make_eps_charts(d) {
   var epsData = JSON.parse(d);

   const options = {
       chart: {
           type: 'spline',
           renderTo: 'chartsContainer' // Make sure this matches the ID of the container in the HTML
       },
       title: {
           text: 'Historical EPS Surprises'
       },
       xAxis: {
           categories: epsData.map(data => `${data.period}<br/>Surprise: ${data.surprise.toFixed(4)}`),
           labels: {
               useHTML: true,
               style: {
                   'padding-top': '10px'
               }
           },
           crosshair: true
       },
       yAxis: {
           title: {
               text: 'Quarterly EPS'
           }
       },
       tooltip: {
           shared: true,
           crosshairs: true,
           pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
           valueSuffix: ' units'
       },
       plotOptions: {
           spline: {
               marker: {
                   radius: 4,
                   lineColor: '#666666',
                   lineWidth: 1
               }
           }
       },
       series: [{
           name: 'Actual',
           marker: {
               symbol: 'diamond'
           },
           data: epsData.map(data => ({
               y: data.actual,
               change: data.surprisePercent
           }))
       }, {
           name: 'Estimate',
           marker: {
               symbol: 'square'
           },
           data: epsData.map(data => ({
               y: data.estimate,
               change: data.surprisePercent
           }))
       }]
   };

   Highcharts.chart(options); // Create the chart
 }

  function make_historical_chart(d) {
  console.log(d);
    try{
    data = JSON.parse(d);
    }catch(e){
    console.log("Error parsing JSON in historical chart", e);
    }
    let ohlc_data = [];
    let time_vs_volume = [];
    data.results.forEach((x) => {
      ohlc_data.push([x.t, x.o, x.h, x.l, x.c]);
      time_vs_volume.push([x.t, x.v]);
    });
    options = {
      accessibility: {
        enabled: false,
      },

      legend: {
        enabled: false,
      },
      title: {
        text: data.ticker + " Historical",
      },

      subtitle: {
        text: "With SMA and Volume by Price technical indicators",
      },

      navigator: {
        enabled: true,
      },

      chart: {
        height: "400px",
        // width: '100%',
      },

      stockTools: {
        gui: {
          enabled: true,
          buttons: ["rangeSelector", "datepicker"],
        },
      },

      xAxis: {
        type: "datetime",
        range: 6 * 30 * 24 * 3600 * 1000,
      },

      yAxis: [
        {
          startOnTick: false,
          endOnTick: false,
          labels: {
            align: "right",
            x: -3,
          },
          title: {
            text: "OHLC",
          },
          height: "65%",
          lineWidth: 2,
          resize: {
            enabled: true,
          },
          opposite: true,
        },
        {
          labels: {
            align: "right",
            x: -3,
          },
          title: {
            text: "Volume",
          },
          top: "70%",
          height: "30%",
          offset: 0,
          lineWidth: 2,
          opposite: true,
        },
      ],

      tooltip: {
        split: true,
      },

      rangeSelector: {
        selected: 0,
        enabled: true,
        inputEnabled: true,
        buttons: [
          {
            type: "month",
            count: 1,
            text: "1m",
          },
          {
            type: "month",
            count: 3,
            text: "3m",
          },
          {
            type: "month",
            count: 6,
            text: "6m",
          },
          {
          type:"year",
          count: 1,
          text: "1y"
          },
          {
            type: "all",
            text: "All",
          },
        ],
      },

      series: [
        {
          type: "candlestick",
          name: data.ticker,
          id: "OHLC",
          zIndex: 2,
          pointWidth: 5,
          data: ohlc_data,
        },
        {
          type: "column",
          name: "Volume",
          id: "volume",
          data: time_vs_volume,
          yAxis: 1,
        },
        {
          type: "vbp",
          linkedTo: "OHLC",
          params: {
            volumeSeriesID: "volume",
          },
          dataLabels: {
            enabled: false,
          },
          zoneLines: {
            enabled: false,
          },
        },
        {
          type: "sma",
          linkedTo: "OHLC",
          zIndex: 1,
          marker: {
            enabled: false,
          },
        },
      ],
    };
    Highcharts.stockChart("chartsContainer", options);
  }

   function make_hourly_chart(d) {
//     const response = '{"ticker":"AAPL","queryCount":835,"resultsCount":16,"adjusted":true,"results":[{"v":122052,"vw":171.7015,"o":170.49,"c":172.13,"h":172.22,"l":170.49,"t":1714377600000,"n":2549},{"v":79833,"vw":172.1681,"o":172,"c":172.2,"h":172.32,"l":171.87,"t":1714381200000,"n":1492},{"v":110784,"vw":172.6165,"o":172.2,"c":172.7,"h":173,"l":172.18,"t":1714384800000,"n":2221},{"v":303634,"vw":172.9577,"o":172.7,"c":173.65,"h":173.68,"l":172.16,"t":1714388400000,"n":5771},{"v":472003,"vw":173.175,"o":173.65,"c":173.47,"h":173.75,"l":170.25,"t":1714392000000,"n":9579},{"v":15427918,"vw":174.904,"o":173.55,"c":175.19,"h":176.03,"l":172.79,"t":1714395600000,"n":165516},{"v":9829906,"vw":175.0965,"o":175.2,"c":174.8625,"h":175.99,"l":174.38,"t":1714399200000,"n":175186},{"v":7417634,"vw":174.4821,"o":174.87,"c":174.6701,"h":175.13,"l":173.98,"t":1714402800000,"n":172502},{"v":4391082,"vw":174.4536,"o":174.68,"c":174.55,"h":174.825,"l":174.22,"t":1714406400000,"n":53487},{"v":4612996,"vw":174.6988,"o":174.555,"c":174.81,"h":175.105,"l":174.39,"t":1714410000000,"n":55453},{"v":4871646,"vw":174.3518,"o":174.805,"c":174.62,"h":174.8064,"l":173.945,"t":1714413600000,"n":56154},{"v":9228470,"vw":173.6384,"o":174.62,"c":173.53,"h":174.85,"l":173.1,"t":1714417200000,"n":101506},{"v":1966836,"vw":173.5042,"o":173.5,"c":173.5,"h":173.75,"l":173.49,"t":1714420800000,"n":2219},{"v":43127,"vw":173.6187,"o":173.67,"c":173.6,"h":173.7,"l":173.5,"t":1714424400000,"n":1118},{"v":1755863,"vw":173.5008,"o":173.64,"c":173.6,"h":173.64,"l":173.52,"t":1714428000000,"n":563},{"v":28117,"vw":173.6269,"o":173.57,"c":173.52,"h":173.77,"l":173.52,"t":1714431600000,"n":762}],"status":"DELAYED","request_id":"6baf112ddad83e33b5a6f0a3ad2cc640","count":16}';
     const JSONresponse = JSON.parse(d);
     const chartData = JSONresponse.results.map(data => ({
       x: data.t,
       y: data.vw,
     }));

     const options = {
       chart: {
         renderTo: 'chartsContainer',
       },
       title: {
         text: JSONresponse.ticker+" Hourly Price Variation",
         style: {
           color: '#808080'
         }
       },
       xAxis: {
         type: 'datetime',
         dateTimeLabelFormats: {
           hour: '%H:%M',
           minute: '%H:%M'
         },
       },
       yAxis: {
         title: {
           text: 'Price (USD)'
         },
         opposite: true
       },
       series: [{
         name: JSONresponse.ticker+' Stock Price',
         data: chartData,
         color: JSONresponse.color,
         tooltip: {
           valueDecimals: 2
         }
       }],
       tooltip: {
         split: true
       },
       plotOptions: {
         series: {
           marker: {
             enabled: false
           }
         }
       },
       legend: {
         enabled: false
       },
     };

     Highcharts.chart(options);
   }
