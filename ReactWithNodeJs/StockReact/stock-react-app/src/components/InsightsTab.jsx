import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import './InsightsTab.css';

const Insights = ({ item }) => {
  const [insightsData, setInsightsData] = useState({
    totalMsp: 0,
    positiveMsp: 0,
    negativeMsp: 0,
    totalChange: 0,
    positiveChange: 0,
    negativeChange: 0,
  });
  const [chartData, setChartData] = useState([]);

  const [epsData, setEpsData] = useState([]);

  useEffect(() => {
    const fetchInsightsData = async () => {
      try {
        const toDate = new Date().toISOString().split('T')[0];
        const fromDate = '2022-01-01';
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/stock/insider-sentiment`, {
          params: { item, from: fromDate, to: toDate },
        });

        let totalMsp = 0;
        let positiveMsp = 0;
        let negativeMsp = 0;
        let totalChange = 0;
        let positiveChange = 0;
        let negativeChange = 0;

        response.data.data.forEach(item => {
          totalMsp += item.mspr;
          totalChange += item.change;

          if (item.mspr > 0) {
            positiveMsp += item.mspr;
          } else {
            negativeMsp += item.mspr;
          }

          if (item.change > 0) {
            positiveChange += item.change;
          } else {
            negativeChange += item.change;
          }
        });

        setInsightsData({
          totalMsp,
          positiveMsp,
          negativeMsp,
          totalChange,
          positiveChange,
          negativeChange,
        });
      } catch (error) {
        console.error('Failed to fetch insights data:', error);
      }
    };

    fetchInsightsData();

    const fetchChartData = async () => {
      try {
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/recommendation/${item}`);
        const formattedData = response.data.map(data => ({
          period: data.period,
          buy: data.buy,
          strongBuy: data.strongBuy,
          hold: data.hold,
          sell: data.sell,
          strongSell: data.strongSell
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    fetchChartData();

    const fetchEpsData = async () => {
      try {
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/earnings/${item}`);
        setEpsData(response.data);
      } catch (error) {
        console.error('Failed to fetch EPS data:', error);
      }
    };

    fetchEpsData();


  }, [item]);


  const chartOptions = {
    legend: {
      align: 'center', // Center align the legend
      verticalAlign: 'bottom', // Position the legend at the bottom of the chart
      x: 0, // Horizontal offset of the legend, in pixels
      y: 0, // Vertical offset of the legend, in pixels
      floating: false, // Set to false so the chart doesn't overlap the legend
      shadow: false
    },
    chart: {
      type: 'column',
      backgroundColor: '#f0f0f0',
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
    ]
  };

  const epsChartOptions = {
    chart: {
      type: 'spline',
      backgroundColor: '#f0f0f0'
    },
    title: {
      text: 'Historical EPS Surprises'
    },
    xAxis: {
      categories: epsData.map(data => `${data.period}<br/> Surprise: ${data.surprise.toFixed(4)}`),
      labels: {
        useHTML: true, // This allows you to use HTML tags within labels
        style: {
          'padding-top': '10px' // This adds some space between the date and the surprise for better visual separation
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

  return (
    <div className="container-fluid">
    <h2 style={{ fontSize: '1.3rem' }} className="mt-4 mb-4 text-center">Insider Sentiments</h2>

    <div className="row justify-content-center">
      <div className="col-lg-7 col-md-10 col-12">
        <table className="table table-responsive-sm text-center my-table table-borderless mb-4 my-table-container">
        <tbody>
        <tr className='my-table-bottom-border'>
            <th>{item}</th>
            <th>MSPR</th>
            <th>Change</th>
          </tr>
          <tr className='my-table-bottom-border'>
            <td style={{ fontWeight: 'bold' }}>Total</td>
            <td>{insightsData.totalMsp.toFixed(2)}</td>
            <td>{insightsData.totalChange}</td>
          </tr>
          <tr className='my-table-bottom-border'>
            <td style={{ fontWeight: 'bold' }}>Positive</td>
            <td>{insightsData.positiveMsp.toFixed(2)}</td>
            <td>{insightsData.positiveChange}</td>
          </tr>
          <tr className='my-table-bottom-border'>
            <td style={{ fontWeight: 'bold' }}>Negative</td>
            <td>{insightsData.negativeMsp.toFixed(2)}</td>
            <td>{insightsData.negativeChange}</td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>
    <div className="row">
      <div className="col-lg-6 col-md-12 mb-4">
        <HighchartsReact
          highcharts={Highcharts}
          options={chartOptions}
        />
      </div>
      <div className="col-lg-6 col-md-12 mb-4">
        <HighchartsReact
          highcharts={Highcharts}
          options={epsChartOptions}
        />
      </div>
    </div>
  </div>


  );
};

export default Insights;
