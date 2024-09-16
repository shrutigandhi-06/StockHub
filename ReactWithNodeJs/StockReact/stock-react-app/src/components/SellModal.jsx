import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';
import './BuyModal.css';

const SellModal = ({ show, onClose, item, currPrice, onSellSuccess }) => {
    const [quantity, setQuantity] = useState(0);
    const [total, setTotal] = useState(0.00);
    const [wallet, setWallet] = useState('0.00');
    const [availableQuantity, setAvailableQuantity] = useState(0);

    useEffect(() => {
        if (show) {
            fetchWalletAndStockQuantity();
        }
    }, [show, item]);

    const fetchWalletAndStockQuantity = async () => {
        try {
            // Assuming 'portfolio' is the name of the database collection
            const response = await axios.get(`https://stock-node-server.wl.r.appspot.com/api/portfolio/${item}`);
            setWallet(response.data.wallet);
            // Directly setting the available quantity from response
            setAvailableQuantity(response.data.stock.quantity);
        } catch (error) {
            console.error('Error fetching wallet and stock quantity:', error);
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

    const handleSell = async () => {
        try {
            const response = await axios.post('https://stock-node-server.wl.r.appspot.com/api/portfolio/sellStock', {
                symbol: item,
                quantitySold: quantity,
                sellPrice: currPrice
            });

            if (response.status === 200) {
                console.log('Stock sold successfully:', response.data.message);
                // Update local state or re-fetch data to reflect the changes
                onSellSuccess();
                onClose(); // Close the modal
            }
        } catch (error) {
            console.error('Error selling stock:', error);
        }
    };
    const isSellDisabled = () => quantity <= 0 || quantity > availableQuantity;

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
                            {total>0 && isSellDisabled() ? (
                                <Form.Text style={{ color: 'red' }}>
                                    You cannot sell the stocks that you don't have!
                                </Form.Text>
                            ) : null}
                        </Form.Group>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Form.Group>
                    <Form.Label>Total: ${total.toFixed(2)}</Form.Label>
                </Form.Group>
                <Button style={{ color: 'white', padding: '0.5rem' }} variant="danger" onClick={handleSell} disabled={isSellDisabled()}>
                    Sell
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SellModal;
