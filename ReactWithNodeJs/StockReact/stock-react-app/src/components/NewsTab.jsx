import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsTab.css';
import { Modal, Button } from 'react-bootstrap';
import '@fortawesome/fontawesome-free/css/all.min.css';


const NewsTab = ({ item }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentNewsItem, setCurrentNewsItem] = useState(null);

  useEffect(() => {
    const fetchNewsItems = async () => {
      try {
        const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/news/${item}`);
        setNewsItems(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    if (item) {
      fetchNewsItems();
    }
  }, [item]);

  const handleCardClick = (newsItem, event) => {
    event.stopPropagation(); // Prevent event from propagating further
    setCurrentNewsItem({
        ...newsItem,
        formattedDate: formatNewsItemDate(newsItem.datetime)
      });
    setShowModal(true);

  };

  const formatNewsItemDate = (timestamp) => {
    // Assuming timestamp is your timestamp in seconds
    const dateObject = new Date(timestamp * 1000); // Convert to milliseconds
    return dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentNewsItem(null); // Reset current news item
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {newsItems.map((newsItem, index) => (
          <div key={index} className="col-lg-6 col-md-6 col-sm-12 news-item" onClick={(event) => handleCardClick(newsItem, event)}>
            <div className="card h-100" >
              <div className="card-img-container">
                <img src={newsItem.image} className="card-img-top" alt={newsItem.title} />
              </div>
              <div className="card-body">
                <p className="card-text">{newsItem.headline}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {currentNewsItem && (
  <Modal show={showModal} onHide={handleCloseModal} size="md" aria-labelledby="contained-modal-title-vcenter" centered className="top-modal">
  <Modal.Header>
    <div className="modal-title-container">
      <Modal.Title id="contained-modal-title-vcenter">
        {currentNewsItem.source}
      </Modal.Title>
      <p className="modal-subtitle">{currentNewsItem.formattedDate}</p>
    </div>
    <button type="button" className="close" aria-label="Close" onClick={handleCloseModal} style={{ outline: 'none', boxShadow: 'none' }}>
      <span aria-hidden="true" style={{ fontSize: '1rem', fontWeight: 'bold', textDecoration:'underline', color:'blue' }}>×</span>
    </button>
  </Modal.Header>
  <Modal.Body className="custom-modal-body">
    <h5>{currentNewsItem.headline}</h5>
    <p  style={{margin:'0px'}}>{currentNewsItem.summary}</p>
    <p style={{color: 'gray', margin:'0px'}}>
      For more details click <a href={currentNewsItem.url} target='_blank' style={{ textDecoration: 'underline' }}>here</a>
    </p>
  </Modal.Body>
  <Modal.Footer className="justify-content-between border rounded " style={{ margin: '1rem' }}>
    <div>
      <p>Share</p>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(currentNewsItem.headline)}%20${encodeURIComponent(currentNewsItem.url)}`} className="btn" target='_blank'>
        <i className="fab fa-x-twitter"></i>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentNewsItem.url)}`} className="btn" target='_blank'>
      <i className="fab fa-facebook-square" style={{ color: '#0866FF' }}></i>
      </a>
    </div>
  </Modal.Footer>
</Modal>

)}
    </div>
  );
};

export default NewsTab;
