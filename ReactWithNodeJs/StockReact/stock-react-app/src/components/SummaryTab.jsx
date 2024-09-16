import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { useNavigate } from 'react-router-dom';
import { useTicker } from '../contexts/TickerContext';
import './SummaryTab.css';

const SummaryTab = ({ item, fromDate, toDate}) => {
  const navigate = useNavigate();
  const [stockDetails, setStockDetails] = useState({
    highPrice: '',
    lowPrice: '',
    openPrice: '',
    prevClose: '',
    timestamp: '',
  });
  const [companyDetails, setCompanyDetails] = useState({
    IPODate: '',
    industry: '',
    webpage: '',
    peers: [],
  });

  const [chartData, setChartData] = useState([]);

  const [isOpen, setIsOpen] = useState(false);

  const isMarketOpen = (timestamp) => {
    const currentTime = Date.now(); // Current time in milliseconds
    const stockTime = new Date(timestamp * 1000); // Convert UNIX epoch time to milliseconds
    const differenceInMinutes = (currentTime - stockTime) / (1000 * 60);
    return differenceInMinutes <= 5; // Market is open if less than or equal to 5 minutes have elapsed
  };


  useEffect(() => {
    const fetchStockDetails = async () => {
        try {
            const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/quote/${item}`);
            if(response.data) {
              setIsOpen(isMarketOpen(response.data.t))
                setStockDetails({
                    highPrice: response.data.h,
                    lowPrice: response.data.l,
                    openPrice: response.data.o,
                    prevClose: response.data.pc,
                    timestamp: response.data.t,
                });
            }
        } catch (error) {
            console.error('Error fetching stock details:', error);
        }
    };

    const fetchCompanyDetails = async () => {
        try {
            const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/company/${item}`);
            if(response.data) {
                setCompanyDetails(prevState => ({
                    ...prevState,
                    IPODate: response.data.ipo,
                    industry: response.data.finnhubIndustry,
                    webpage: response.data.weburl,
                    peers: response.data.peers
                }));
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
        }
    };
    fetchStockDetails();
    fetchCompanyDetails();
  }, [item, fromDate, toDate]);

  useEffect(() => {
    if (stockDetails.timestamp) {
      fetchHistoricalData();
    }
  }, [stockDetails.timestamp]);

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/historical/${item}?timestamp=${encodeURIComponent(stockDetails.timestamp)}`);
      if (response.data && response.data.results) {
        setChartData(response.data.results.map(data => ({
          x: data.t,
          y: data.vw,
        })));
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const options = {
    chart: {
      backgroundColor: '#f0f0f0', // Set the chart's background color to gray
    },
    title: {
      text: `${item} Hourly Price Variation`,
      style: {
        color: '#808080' // Setting the title color to gray
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
        text: ''
      },
      opposite: true
    },
    series: [{
      name: 'Price',
      data: chartData,
      color: isOpen ? 'green' : 'red',
      tooltip: {
        valueDecimals: 2
      }
    }],
    tooltip: { split: true },
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

  const { ticker, setTicker } = useTicker();
  const handlePeerClick = (peer) => {
    navigate(`/search/home`);
    setTicker(peer)
  };

  return (

    <div className="container mt-3">
      <div className="row">
        <div className="col-sm-12 col-md-6">
          <div className="mb-5 margin-left-md mt-3">
            <div><strong>High Price:</strong> {stockDetails.highPrice}</div>
            <div><strong>Low Price:</strong> {stockDetails.lowPrice}</div>
            <div><strong>Open Price:</strong> {stockDetails.openPrice}</div>
            <div><strong>Prev. Close:</strong> {stockDetails.prevClose}</div>
          </div>
          <div className="mb-5 text-center">
            <h5 style={{textDecoration: 'underline'}}>About the company</h5>
            <br />
            <div style={{marginBottom:'0.25rem'}}><strong>IPO Start Date:</strong> {companyDetails.IPODate}</div>
            <div style={{marginBottom:'0.25rem'}}><strong>Industry:</strong> {companyDetails.industry}</div>
            <div style={{marginBottom:'0.25rem'}}><strong>Webpage:</strong> <a  style ={{textDecoration:'underline'}} href={companyDetails.webpage} target="_blank" rel="noopener noreferrer">{companyDetails.webpage}</a></div>
            <strong>Company peers: </strong>
            {/* <div><strong>Company peers:</strong> {companyDetails.peers.join(', ')}</div> */}
            <div style={{marginTop:'0.25rem'}}className="mb-3">

          {companyDetails.peers.map((peer, index) => (
            <button
              key={index}
              style={{ padding:'0px', margin:'0.12rem', textDecoration:'underline'}}
              onClick={() => handlePeerClick(peer)}
              className="btn btn-link"
            >{peer}</button>
          ))}
        </div>
          </div>
        </div>
        {/* The chart component should go here */}
        <div className="col-sm-12 col-md-6">
          <HighchartsReact highcharts={Highcharts} options={options} />
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
