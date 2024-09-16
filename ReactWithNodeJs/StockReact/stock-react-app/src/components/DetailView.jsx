import React, { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SummaryTab from './SummaryTab';
import Box from '@mui/material/Box';
import NewsTab from './NewsTab';
import ChartsTab from './ChartsTab';
import InsightsTab from './InsightsTab';
import axios from 'axios';
import BuyModal from './BuyModal';
import { Spinner } from 'react-bootstrap';
import SellModal from './SellModal';
import Footer from './Footer';
const DetailView = ({ item }) => {
  const [activeTab, setActiveTab] = useState("summary");

  const [isStarred, setIsStarred] = useState(false);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);

  const toggleBuyModal = () => setShowBuyModal(!showBuyModal);
  const toggleSellModal = () => setShowSellModal(!showSellModal);
  const [showSellButton, setShowSellButton] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const tabStyle = {
    flex: 1,
    textAlign: 'center',
    borderBottom: '3px solid transparent', // Default no underline
  };

  const activeTabStyle = {
    ...tabStyle,
    borderBottom: '3px solid #000080', // Active tab has a blue underline
  };

  const [stockDetails, setStockDetails] = useState({
    currPrice: '',
    change: '',
    percentChange: '',
    timestamp: '',
    isOpen: true
  });

  const [profile, setProfile] = useState({
    ticker: '',
    name: '',
    exchange: '',
    logo: '',
  });

  // const fetchData = async () => {
  //   setIsLoading(true);
  //   await fetchStockDetails();
  //   await fetchProfile();
  //   setIsLoading(false);
  // };


  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatNumber = (value) => {
    // Check if the value is a number and not null or undefined
    return isNaN(value) ? '' : Number(value).toFixed(2);
  };

  const yellowStarStyle = {
    filter: 'invert(67%) sepia(95%) saturate(708%) hue-rotate(2deg) brightness(103%) contrast(101%)',
  };

  const isMarketOpen = (timestamp) => {
    const currentTime = Date.now(); // Current time in milliseconds
    const stockTime = new Date(timestamp * 1000); // Convert UNIX epoch time to milliseconds
    const differenceInMinutes = (currentTime - stockTime) / (1000 * 60);
    return differenceInMinutes <= 5; // Market is open if less than or equal to 5 minutes have elapsed
  };

  useEffect(() => {

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/profile/${item}`);
        if (response.data) {
          setProfile({
            ticker: response.data.ticker,
            name: response.data.name,
            exchange: response.data.exchange,
            logo: response.data.logo,
          });
          fetchStockDetails();
          checkWatchlist();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const checkWatchlist = async () => {
      try {
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/watchlist/check/${item}`);
        if (response.data.isInWatchlist) {
          setIsStarred(true);
        } else {
          setIsStarred(false);
        }

        checkIfStockExistsInPortfolio();
      } catch (error) {
        console.error('Error checking watchlist status:', error);
      }
    };

    const checkIfStockExistsInPortfolio = async () => {
      try {
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/portfolio/hasStock/${item}`);
        if (response.data.hasStock) {
          console.log("Stock has already been bought");
          setShowSellButton(true);
        } else {
          setShowSellButton(false);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking if stock exists in portfolio:', error);
      }
    };

    fetchProfile();
    // checkWatchlist();
    // checkIfStockExistsInPortfolio();
  }, [item]);

  const fetchStockDetails = async () => {
    try {
      const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/quote/${item}`);
      if (response.data) {
        const marketStatus = isMarketOpen(response.data.t);
        setStockDetails({
          currPrice: formatNumber(response.data.c),
          change: formatNumber(response.data.d),
          percentChange: formatNumber(response.data.dp),
          timestamp: response.data.t,
          isOpen: marketStatus,
        });
      }
    } catch (error) {
      console.error('Error fetching stock details:', error);
    }
  };

  useEffect(() => {
    // Function to fetch stock details and update market status
    const fetchStockDetailsAndUpdateMarketStatus = async () => {
      if (stockDetails.isOpen) {
        await fetchStockDetails();
      }
    };

    // Setup interval if market is open
    if (stockDetails.isOpen) {
      const intervalId = setInterval(() => {
        fetchStockDetailsAndUpdateMarketStatus();
      }, 15000); // 15 seconds interval

      // Cleanup interval on component unmount or when market closes
      return () => clearInterval(intervalId);
    }
  }, [stockDetails.isOpen, item]); // Depend on market open status and item to re-evaluate when they change


  const openOrCloseStyle = {
    color: stockDetails.isOpen ? 'green' : 'red',
    fontWeight: 'bold'
  };

  const date = new Date(stockDetails.timestamp * 1000);
  const formattedTodayDate = formatDate(date);

  // Get one day before the given timestamp
  const oneDayBefore = new Date(date.getTime() - (24 * 60 * 60 * 1000));
  const formattedDateOneDayBefore = formatDate(oneDayBefore);

  const toggleStar = async () => {
    if (!isStarred) {
      // Data to be sent to the server
      const stockData = {
        ticker: profile.ticker,
        name: profile.name,
        currPrice: stockDetails.currPrice,
        change: stockDetails.change,
        percentChange: stockDetails.percentChange
      };

      try {
        // Send a POST request to the server to add the stock to the watchlist
        await axios.post('https://stock-node-server.wl.r.appspot.com/api/watchlist', stockData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setShowWatchlistSuccessMessage(true);
        setTimeout(() => setShowWatchlistSuccessMessage(false), 5000);
      } catch (error) {
        console.error('Error adding to watchlist:', error);
      }
    }
    // Toggle the star status
    setIsStarred(!isStarred);
  };

  const [showBuySuccessMessage, setShowBuySuccessMessage] = useState(false);

  const handleBuySuccess = () => {
    setShowBuySuccessMessage(true);
    setShowSellButton(true);
    setTimeout(() => setShowBuySuccessMessage(false), 5000); // Hide after 5 seconds
  };

  const [showSellSuccessMessage, setShowSellSuccessMessage] = useState(false);

  const handleSellSuccess = async () => {
    try {
      const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/portfolio/hasStock/${item}`);
      if (response.data.hasStock) {
        console.log("Stock has already been bought");
        setShowSellButton(true);
      } else {
        setShowSellButton(false);
      }
    } catch (error) {
      console.error('Error checking if stock exists in portfolio:', error);
    }
    setShowSellSuccessMessage(true);
    setTimeout(() => setShowSellSuccessMessage(false), 5000); // Hide after 5 seconds
  };

  const [showWatchlistSuccessMessage, setShowWatchlistSuccessMessage] = useState(false);


  if (isLoading) {
    return (
      <div className='container d-flex justify-content-center align-items-center' style={{ height: "100vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  const tabContainerStyle = {
    '.MuiTabs-flexContainer': {
      display: 'flex',
      // Assuming a minimum width for each tab for it to look good
      // Adjust based on your UI requirements
      '.MuiButtonBase-root': {
        flex: '1 1 auto', // Changed to make tabs flexible in width
        minWidth: '120px', // Set a minimum width for smaller screens/devices
        textAlign: 'center',
      },
    },
    width: '100%', // Ensure the container takes up full width
    overflow: 'auto', // Enable horizontal scrolling
  };

  const CustomTab = ({ label, isActive }) => {
    const activeTabStyle = {
      borderBottom: '3px solid #000080', // Active tab has a blue underline
      // Add more styles as needed
    };

    return (
      <Tab
        label={label}
        style={isActive ? activeTabStyle : {}}
      />
    );
  };



  return (
    <>
      <div className='container mt-3 mb-3'>
        {showWatchlistSuccessMessage && (
          <div className="alert alert-success alert-dismissible fade show text-center mt-2" role="alert">
            {item} added to watchlist.
            <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setShowWatchlistSuccessMessage(false)}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}

        {showBuySuccessMessage && (
          <div className="alert alert-success alert-dismissible fade show text-center mt-2" role="alert">
            {item} bought successfully.
            <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setShowBuySuccessMessage(false)}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}
        {showSellSuccessMessage && (
          <div className="alert alert-danger alert-dismissible fade show text-center mt-2" role="alert">
            {item} sold successfully.
            <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setShowSellSuccessMessage(false)}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}

        <div className='row stock-header align-items-center'>
          <div className='col stock-profile  text-center'>
            <h3 style={{ color: 'black', marginBottom: '0px' }}>{profile.ticker}
              <button
                className="btn"
                onClick={toggleStar}
                style={{ background: 'none', padding: 0, border: 'none', verticalAlign: 'top', marginLeft: '0.5rem', }}
              >
                {isStarred ? (
                  <img src="https://icons.getbootstrap.com/assets/icons/star-fill.svg" alt="Filled Star" style={yellowStarStyle} />
                ) : (
                  <img src="https://icons.getbootstrap.com/assets/icons/star.svg" alt="Star" />
                )}
              </button>
            </h3>
            <h5 style={{ color: 'gray' }}>{profile.name}</h5>
            <p style={{ color: 'gray', fontSize: '0.8rem' }}>{profile.exchange}</p>
            <div className='row justify-content-center'>
              <button type="button" class="btn btn-success" onClick={toggleBuyModal} style={{ width: '4rem', color: 'white', paddingTop: '0.3rem', paddingBottom: '0.3rem', paddingLeft: '0.8rem', paddingRight: '0.8rem', marginRight: '0.8rem' }}>Buy</button>
              {showSellButton && (
                <button type="button" className="btn btn-danger" onClick={toggleSellModal} style={{ width: '4rem', color: 'white', paddingTop: '0.3rem', paddingBottom: '0.3rem', paddingLeft: '0.8rem', paddingRight: '0.8rem' }}>Sell</button>
              )}
            </div>
          </div>
          <div className='col stock-img text-center'>
            <img src={profile.logo} alt="" className="img-fluid" style={{ width: '25%', height: '25%' }} />
          </div>
          <div className='col stock-price text-center'>
            <p className="mb-0" style={{ ...openOrCloseStyle, fontSize: '1.8rem' }}>{stockDetails.currPrice}</p>
            <i className={`fas ${stockDetails.isOpen ? 'fa-caret-up' : 'fa-caret-down'}`}
              style={{ color: stockDetails.isOpen ? 'green' : 'red', paddingRight: '0.2rem' }}></i>

            <span style={openOrCloseStyle}>{stockDetails.change} ({stockDetails.percentChange}%)</span>
            <div style={{ fontSize: '0.8rem' }}>{formatDateTime(new Date(stockDetails.timestamp * 1000))}</div>
          </div>
        </div>
        <div className='row'>
          <div className='col text-center mt-2'>
            <p style={{ ...openOrCloseStyle }}>
              {stockDetails.isOpen ? 'Market is open' : `Market is closed on ${formatDateTime(new Date(stockDetails.timestamp * 1000))}`}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Box sx={tabContainerStyle}>
          <Tabs
            value={activeTab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="scrollable auto tabs example"
          >
            <Tab value="summary" label="Summary" />
            <Tab value="topNews" label="Top News" />
            <Tab value="charts" label="Charts" />
            <Tab value="insights" label="Insights" />
          </Tabs>
        </Box>


        {/* Tab Content */}
        {activeTab === "summary" && <SummaryTab item={item} fromDate={formattedDateOneDayBefore} toDate={formattedTodayDate} />}
        {activeTab === "topNews" && <NewsTab item={item} />}
        {activeTab === "charts" && <ChartsTab item={item} />}
        {activeTab === "insights" && <InsightsTab item={item} />}

        <SellModal
          show={showSellModal}
          onClose={() => {
            toggleSellModal();
          }}
          item={item}
          currPrice={stockDetails.currPrice}
          onSellSuccess={handleSellSuccess}
        />

        <BuyModal
          show={showBuyModal}
          onClose={() => {
            toggleBuyModal();
          }}
          item={item}
          currPrice={stockDetails.currPrice}
          onBuySuccess={handleBuySuccess}
        />




      </div>

    </>


  );
};

export default DetailView;
