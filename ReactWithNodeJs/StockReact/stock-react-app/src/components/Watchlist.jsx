import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Watchlist.css'
import {Container,Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTicker } from '../contexts/TickerContext';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { ticker, setTicker } = useTicker();

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://stock-node-server.wl.r.appspot.com/api/watchlist');
      setWatchlist(response.data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    }
    finally{
      setIsLoading(false);
    }
  };

  const removeFromWatchlist = async (ticker) => {
    try {
      await axios.delete(`https://stock-node-server.wl.r.appspot.com/api/watchlist/${ticker}`);
      fetchWatchlist(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error removing from watchlist:', error);
    }
  };

  if (isLoading) {
    return (
        <Container className='p-5 d-flex justify-content-center align-items-center' style={{ minHeight: "100vh" }}>
            <Spinner animation="border" role="status" variant="primary">
                <span className="sr-only">Loading...</span>
            </Spinner>
        </Container>
    );
}

const handleCardClick = (ticker) => {
  setTicker(ticker);
  navigate(`/search/${ticker}`);

};


  return (
    <div>
      <div class=" container" style={{width:'60%'}}>
      <h2 className="my-4">My Watchlist</h2>
      </div>
      {watchlist.length === 0 && (
        <div class="alert alert-warning text-center" role="alert" id="no-stocks-alert">
        Currently, you don't have any stock in your watchlist.
      </div>
    )}
      {watchlist.map((item, index) => (
        <div class="d-flex justify-content-center">
          <div class="d-flex container mt-3 justify-content-start custom-container" style={{border: '1px solid #e7e7e7', borderRadius:'0.25rem', width:'60%'}}>
            <div class="card col-12 col-lg-10" style={{paddingTop:'1rem', paddingBottom:'0.5rem', paddingLeft: '0rem',border:'none'}} key={index} onClick={() => handleCardClick(item.ticker)}>
              <div className="button">
              <button
                type="button"
                className="btn-close position-absolute top-0 start-1"
                aria-label="Close"
                style={{ height: 'fit-content',
                  padding: '0.18rem',
                  marginTop:' 0.8rem'}}
                onClick={() => removeFromWatchlist(item.ticker)}
                >
              </button>
              </div>
              <div class="card-body" style={{ marginLeft: '0rem', cursor:'pointer'}} onClick={() => handleCardClick(item.ticker)}>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="ms-5">
                    <h1 class="mb-2" style={{fontSize:'1.8rem'}}>{item.ticker}</h1>
                    <h3 class="card-subtitle">{item.name}</h3>
                  </div>
                  <div class="text-start me-5 price-info" style={{color: item.change > 0 ? 'green' : item.change < 0 ? 'red' : 'black',}}>
                    <h5 class="mb-2" style={{fontWeight:'bold', fontSize:'1.5rem'}}>{item.currPrice}</h5>
                    <small style={{fontWeight:'bold'}}>
                    <i className={`fas ${item.change>0 ? 'fa-caret-up' : item.change<0? 'fa-caret-down': ''}`}
   style={{color: item.change>0 ? 'green' : item.change<0?'red': 'black', paddingRight:'0.2rem'}}></i> {item.change} ({item.percentChange}%)
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Watchlist;
