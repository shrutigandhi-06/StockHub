import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import HC_more from 'highcharts/highcharts-more';
import HC_exporting from 'highcharts/modules/exporting';
import HC_exportData from 'highcharts/modules/export-data';
import IndicatorsAll from 'highcharts/indicators/indicators-all';

HC_more(Highcharts);
HC_exporting(Highcharts);
HC_exportData(Highcharts);
IndicatorsAll(Highcharts);

const ChartsTab = ({ item }) => {
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    console.log("Fetching"+item);
    const fetchData = async () => {
      try {
        // const response = await axios.get('https://demo-live-data.highcharts.com/aapl-ohlcv.json');
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/polygon/historical/${item}`);
        const options = createChartOptions(transformData(response.data.results));
        // const options = createChartOptions(response.data);

        console.log(response.data);
        setChartOptions(options);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, []);

  const transformData = (data) => {
    return data.map((item) => {
      return [item.t, item.o, item.h, item.l, item.c, item.v];
    });
  };

  const createChartOptions = (data) => {
    const ohlc = [];
    const volume = [];

    // Assuming data is an array of [date, open, high, low, close, volume]
    data.forEach(point => {
      ohlc.push([point[0], point[1], point[2], point[3], point[4]]);
      volume.push([point[0], point[5]]);
    });

    const groupingUnits = [['week', [1]], ['month', [1, 2, 3, 4, 6]]];

    const options = {
      chart: {
        backgroundColor: '#f0f0f0',
        height: 500

      },
      title: { text: item+' Historical' },
      subtitle: { text: 'With SMA and Volume by Price technical indicators' },
      exporting: { enabled: false },
      yAxis: [{
        labels: { align: 'right', x: -3 },
        title: { text: 'OHLC' },
        height: '60%',
        lineWidth: 2,
        resize: { enabled: true }
      }, {
        labels: { align: 'right', x: -3 },
        title: { text: 'Volume' },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2
      }],
      tooltip: { split: true },
      plotOptions: {
        series: { dataGrouping: { units: groupingUnits } }
      },
      series: [{
        type: 'candlestick',
        name: item,
        id: item,
        zIndex: 2,
        data: ohlc,
      }, {
        type: 'column',
        name: 'Volume',
        id: 'volume',
        data: volume,
        yAxis: 1
      }, {
        type: 'vbp',
        linkedTo: item,
        params: { volumeSeriesID: 'volume' },
        dataLabels: { enabled: false },
        zoneLines: { enabled: false }
      }, {
        type: 'sma',
        linkedTo: item,
        zIndex: 1,
        marker: { enabled: false }
      }]
    };

    return options;
  };

  return (
    <div className='mt-3 mb-3'>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={chartOptions}
      />
    </div>
  );
};

export default ChartsTab;
