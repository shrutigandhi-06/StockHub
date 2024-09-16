import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DetailView from './DetailView';
import Footer from './Footer';
import { useTicker } from '../contexts/TickerContext'; // Adjust the import path as necessary
import {useNavigate } from 'react-router-dom';

const AutoCompleteSearch = () => {
  // const { ticker } = useParams();
  const { ticker, setTicker } = useTicker();
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false); // State to handle loading
  const [selectedItem, setSelectedItem] = useState(null); // New state for tracking selected item

  // New useEffect to handle existing ticker from context
  useEffect(() => {
    if (ticker) {
      setInput(ticker);
      setSelectedItem(ticker);
      navigate(`/search/${ticker}`);
    }
  }, [ticker, navigate]);

  useEffect(() => {

    if(!input || ticker) return;

    if (input.length > 0) {
      setLoading(true); // Start loading
      // Debounce fetchSuggestions to limit API calls
      const timeoutId = setTimeout(async () => {
        try {
          const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/search/${input}`);
          const filteredSuggestions = response.data.result.filter(suggestion => !suggestion.displaySymbol.includes('.'));
          setSuggestions(filteredSuggestions);
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [input, ticker]);

   const handleSelectItem = (item) => {
    setSelectedItem(item.displaySymbol);
    setSuggestions([]);
    setTicker(item.displaySymbol); // Update the ticker in context
    navigate(`/search/${item.displaySymbol}`);
  };


  const handleSearch = () => {
    // Check if the input matches any filteredSuggestions' displaySymbol
    const matchedSuggestion = suggestions.find(suggestion => suggestion.displaySymbol === input);
    if (matchedSuggestion) {
      handleSelectItem(matchedSuggestion);
    } else {
      // Trigger search manually if no match found
      // Optionally, show not found message or handle as needed
      console.log("No exact match found, continuing with normal search.");
      // If you want to clear suggestions and navigate to a generic search page, uncomment the next lines:
      // setSuggestions([]);
      // navigate(`/search/${input}`);
    }
  };



  return (
    <div className="container mt-3">
      <div className="row">
        <div className="col">
          <div className="input-group search-bar">
            <input
              type="text"
              className="form-control"
              placeholder="Enter stock ticker symbol"
              aria-label="Enter stock ticker symbol"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <div className="input-group-append">
              <button className="btn" type="button" onClick={handleSearch}><i className="fas fa-search"></i></button>
              <button className="btn" type="button" onClick={() => { setInput(''); setSelectedItem(null); setSuggestions([]); navigate(`/search/home`); setTicker('')}}><i className="fas fa-times"></i></button>
            </div>
          </div>
          <div className="div-on-search" style={{display:'flex', justifyContent:'center'} }>
          {loading ? (
            <div className="loader" style={{ display: 'flex', justifyContent: 'left', marginTop: '10px' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : (
            suggestions.length > 0 ? (
              <div className="suggestions-list" style={{ maxHeight: '300px', maxWidth:'500px',overflowY: 'scroll' }}>
                {suggestions.map((suggestion, index) => (
                  <div key={index} style={{paddingTop:'0.5rem', paddingBottom:'0.5rem', cursor:'pointer'}}className="suggestion-item" onClick={() => handleSelectItem(suggestion)}>
                    {suggestion.displaySymbol} | {suggestion.description}
                </div>
                ))}
              </div>
            )
          :
          !ticker && input && !loading && (
            <div className="alert alert-danger text-center mt-5" role="alert" style={{paddingLeft:'30rem', paddingRight:'30rem'}}>
            No Data found. Please enter a valid ticker.
          </div>
          )
        )   }
          </div>
        </div>
      </div>
      {selectedItem && <DetailView item={selectedItem} />}
      {/* <Footer/> */}
    </div>
  );
};

export default AutoCompleteSearch;
