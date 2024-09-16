import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, ListGroup, ListGroupItem, Container, Row, Col, Spinner } from 'react-bootstrap';
import BuyModal from './BuyModal';
import SellModal from './SellModal';

const Portfolio = () => {
    const [wallet, setWallet] = useState(0);
    const [stocks, setStocks] = useState([]);
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showSellModal, setShowSellModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [boughtStock, setBoughtStock] = useState('');
    const [soldStock, setSoldStock] = useState('');


    const toggleBuyModal = () => setShowBuyModal(!showBuyModal);
    const toggleSellModal = () => setShowSellModal(!showSellModal);

    const [showBuySuccessMessage, setShowBuySuccessMessage] = useState(false);

  const handleBuySuccess = async() => {
    setShowBuySuccessMessage(true);
    setTimeout(() => setShowBuySuccessMessage(false), 5000); // Hide after 5 seconds
    await fetchPortfolio();
  };

  const [showSellSuccessMessage, setShowSellSuccessMessage] = useState(false);

  const handleSellSuccess = async () => {
    setShowSellSuccessMessage(true);
    setTimeout(() => setShowSellSuccessMessage(false), 5000); // Hide after 5 seconds
    await fetchPortfolio();
  };

  const fetchPortfolio = async () => {
    setIsLoading(true);
    try {
        const response = await axios.get('https://stock-node-server.wl.r.appspot.com/api/portfolio');
        setWallet(response.data.wallet);
        const stocksData = response.data.stocks;

        const stocksWithCurrentPrice = await Promise.all(stocksData.map(async (stock) => {
            const quoteResponse = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/quote/${stock.stockSymbol}`);
            const currentPrice = quoteResponse.data.c;
            const profileResponse = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/profile/${stock.stockSymbol}`);
            return {
                ...stock,
                currentPrice,
                name: profileResponse.data.name,
                change: currentPrice - (stock.totalCost / stock.quantity),
                marketValue: currentPrice * stock.quantity
            };
        }));

        setStocks(stocksWithCurrentPrice);
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
    }
    finally {
        setIsLoading(false); // End loading
    }
};


    useEffect(() => {
        fetchPortfolio();
    }, []);

    const formatCurrency = (value) => parseFloat(value).toFixed(2);

    if (isLoading) {
        return (
            <Container className='p-5 d-flex justify-content-center align-items-center' style={{ minHeight: "100vh" }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </Container>
        );
    }


    return (
        <Container className='p-5'>
             {showBuySuccessMessage && (
                <div className="alert alert-success alert-dismissible fade show text-center mt-2" role="alert">
                    {boughtStock} bought successfully.
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setShowBuySuccessMessage(false)}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}
            {showSellSuccessMessage && (
                <div className="alert alert-danger alert-dismissible fade show text-center mt-2" role="alert">
                    {soldStock} sold successfully.
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setShowSellSuccessMessage(false)}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}
            <h2>My Portfolio</h2>
            <h4>Money in Wallet: ${formatCurrency(wallet)}</h4>
            {stocks.length === 0 && (
                <div class="alert alert-warning text-center" role="alert" id="no-stocks-alert" style={{ width: '100%' }}>
                    Currently, you don't have any stock.
                </div>
            )}

            {stocks.map((stock, index) => (

                <>
                {console.log(stock.change)}
                    <Card key={index} className="mb-3" style={{ fontWeight: 'bold' }}>
                        <Card.Header>
                            <Card.Title>{stock.stockSymbol} <span style={{ color: 'gray', fontSize: '1.0rem' }}>{stock.name}</span></Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col xs={12} md={6} lg={6}>
                                    <ListGroup className="list-group-flush">
                                        <ListGroupItem style={{ padding: '0px' }}>Quantity: {stock.quantity}</ListGroupItem>
                                        <ListGroupItem style={{ padding: '0px' }}>Avg. Cost / Share: {formatCurrency(stock.totalCost / stock.quantity)}</ListGroupItem>
                                        <ListGroupItem style={{ padding: '0px' }}>Total Cost: {formatCurrency(stock.totalCost)}</ListGroupItem>
                                    </ListGroup>
                                </Col>
                                <Col xs={12} md={6} lg={4}>
                                    <ListGroup className="list-group-flush">
                                        <ListGroupItem style={{ padding: '0px' }}>
                                            Change:
                                            <span className={`ms-2 ${stock.change > 0 ? 'text-success' : stock.change < 0 ? 'text-danger' : 'text-dark'}`}>
                                                {stock.change > 0 ? `+${formatCurrency(stock.change)}` : formatCurrency(stock.change)}
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem style={{ padding: '0px' }}>
                                            Current Price:
                                            <span className={`ms-2 ${stock.change > 0 ? 'text-success' : stock.change < 0 ? 'text-danger' : 'text-dark'}`}>
                                                {formatCurrency(stock.currentPrice)}
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem style={{ padding: '0px' }}>
                                            Market Value:
                                            <span className={`ms-2 ${stock.change > 0 ? 'text-success' : stock.change < 0 ? 'text-danger' : 'text-dark'}`}>
                                                {formatCurrency(stock.marketValue)}
                                            </span>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Col>
                            </Row>
                        </Card.Body>
                        <Card.Footer>
                            <Button style={{ color: 'white', paddingTop: '0.25rem', paddingBottom: '0.25rem', paddingLeft: '0.75rem', paddingRight: '0.75rem', marginRight: '0.5rem' }} variant="primary" onClick={() => {
    toggleBuyModal();
    setBoughtStock(stock.stockSymbol);
  }}>Buy</Button>
                            <Button style={{ color: 'white', paddingTop: '0.25rem', paddingBottom: '0.25rem', paddingLeft: '0.75rem', paddingRight: '0.75rem' }} variant="danger" onClick={() => {
    toggleSellModal();
    setSoldStock(stock.stockSymbol);
  }}>Sell</Button>
                        </Card.Footer>
                    </Card>
                    <SellModal
                        show={showSellModal}
                        onClose={() => {
                            toggleSellModal();
                        }}
                        item={stock.stockSymbol}
                        currPrice={stock.currentPrice}
                        onSellSuccess={handleSellSuccess}
                    />

                    <BuyModal
                        show={showBuyModal}
                        onClose={() => {
                            toggleBuyModal();
                        }}
                        item={stock.stockSymbol}
                        currPrice={stock.currentPrice}
                        onBuySuccess={handleBuySuccess}
                    />
                </>

            ))}
        </Container>
    );
};

export default Portfolio;
