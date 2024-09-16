import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import './BuyModal.css';
const BuyModal = ({ show, onClose, item, currPrice, onBuySuccess }) => {
    const [quantity, setQuantity] = useState(0);
    const [total, setTotal] = useState(0.00);
    const [wallet, setWallet] = useState('0.00');

    useEffect(() => {
        if (show) {
            fetchWalletBalance();
        }
    }, [show]); // Fetch wallet balance when modal is shown

    const fetchWalletBalance = async () => {
        try {
            const response = await axios.get('https://stock-node-server.wl.r.appspot.com/api/wallet');
            setWallet(response.data.wallet);
        } catch (error) {
            console.error('Error fetching wallet balance:', error);
        }
    };

    const updateQuantity = (newQuantity) => {
        const qty = parseInt(newQuantity);
        if (!isNaN(qty) && qty > 0) {
            setQuantity(qty);
            setTotal(qty * currPrice);
        } else {
            setQuantity(0);
            setTotal(0);
        }
    };

    const handleBuy = async () => {
        try {
            const response = await axios.post('https://stock-node-server.wl.r.appspot.com/api/portfolio/addStock', {
                stockSymbol: item,
                quantity: quantity,
                priceBought: currPrice
            });

            if (response.data.message === 'Stock added to portfolio and wallet updated' || response.data.message ==='Stock quantity and total cost updated in portfolio') {
                console.log('Purchase successful:', response.data);
                onBuySuccess();
                onClose(); // Close the modal after successful purchase
            } else {
                console.error('Purchase failed:', response.data.message);
                // Handle purchase failure (e.g., display an error message to the user)
            }
        } catch (error) {
            console.error('Error making purchase:', error);
            // Handle error (e.g., display an error message)
        }
    };


    const isBuyDisabled = () => {
        return total > parseFloat(wallet) || quantity <= 0 || quantity === '' || isNaN(quantity);
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onClose} centered className="top-buy-modal">
            <Modal.Header>
                <Modal.Title>{item}</Modal.Title>
                <button type="button" className="close" aria-label="Close" onClick={onClose} style={{ outline: 'none', boxShadow: 'none' }}>
      <span aria-hidden="true" style={{ fontSize: '1rem', fontWeight: 'bold', textDecoration:'underline', color:'blue' }}>×</span>
    </button>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group>
                        <Form.Label>Current Price: {currPrice}</Form.Label>
                        <br />
                        <Form.Label>Money in Wallet: ${parseFloat(wallet).toFixed(2)}</Form.Label>
                        <Form.Group className="mb-3" controlId="formQuantity">
                            <Form.Label>Quantity:</Form.Label>
                            <Form.Control
                                type="number"
                                value={quantity}
                                onChange={(e) => updateQuantity(e.target.value)}
                            />
                            {total>0 && isBuyDisabled() ? (
                                <Form.Text style={{ color: 'red' }}>
                                    Not enough money in the wallet
                                </Form.Text>
                            ) : null}
                        </Form.Group>
                        <br />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Form.Group>
                    <Form.Label>Total: ${total.toFixed(2)}</Form.Label>
                </Form.Group>
                <Button style={{ color: 'white', padding: '0.5rem' }} variant="success" onClick={handleBuy} disabled={isBuyDisabled()}>
                    Buy
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BuyModal;
