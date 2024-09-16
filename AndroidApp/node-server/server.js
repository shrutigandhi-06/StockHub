import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { MongoClient } from 'mongodb';

dotenv.config();
const app = express();
const port = process.env.PORT || 3002;
app.use(cors());
app.use(express.json());

let database;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
var CONNECTION_STRING = "mongodb+srv://shrutigandhi682001:jYmTdNsqHe5FP5Z6@cluster0.5ohxj45.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(CONNECTION_STRING);


app.get('/api/search/:query', async (req, res) => {
    const query = req.params.query;
    const url = `https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

app.get('/api/quote/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching stock details:', error);
        res.status(500).json({ error: 'Failed to fetch stock details' });
    }
});

app.get('/api/company/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;
    const peersUrl = `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    try {
        const [profileResponse, peersResponse] = await Promise.all([
            axios.get(profileUrl),
            axios.get(peersUrl)
        ]);
        const data = {
            ...profileResponse.data,
            peers: peersResponse.data
        };

        res.json(data);
    } catch (error) {
        console.error('Error fetching company details:', error);
        res.status(500).json({ error: 'Failed to fetch company details' });
    }
});

app.get('/api/profile/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const profileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    try {
      const profileResponse = await axios.get(profileUrl);
      const data = {
        ticker: profileResponse.data.ticker,
        name: profileResponse.data.name,
        exchange: profileResponse.data.exchange,
        logo: profileResponse.data.logo,
      };

      res.json(data);
    } catch (error) {
      console.error('Error fetching company profile:', error);
      res.status(500).json({ error: 'Failed to fetch company profile' });
    }
  });

  app.get('/api/historical/:symbol', async (req, res) => {
    const { symbol } = req.params;
    const { timestamp } = req.query;
    const date = new Date(timestamp * 1000);

    const previousDateObj = new Date(date.getTime() - (24 * 60 * 60 * 1000));

    const formattedDate = date.toISOString().split('T')[0];
    const previousDate = previousDateObj.toISOString().split('T')[0];


    const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/hour/${previousDate}/${formattedDate}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
    try {
      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      res.status(500).json({ error: 'Failed to fetch historical data' });
    }
  });

app.get('/api/news/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const today = new Date().toISOString().split('T')[0];
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=2024-03-10&to=2024-03-17&token=${FINNHUB_API_KEY}`;

    try {
        const response = await axios.get(url);
        const filteredData = response.data.filter(item =>
            item.image && item.headline && item.url && item.datetime && item.summary && item.source
        ).slice(0, 20);
        res.json(filteredData);

    } catch (error) {
        console.error('Error fetching company news:', error);
        res.status(500).json({ error: 'Failed to fetch company news' });
    }
});

app.get('/api/polygon/historical/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const toDate = new Date();
  const fromDate = new Date();
  fromDate.setFullYear(fromDate.getFullYear() - 2); // Set to 2 years back

  const from = fromDate.toISOString().split('T')[0];
  const to = toDate.toISOString().split('T')[0];
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${POLYGON_API_KEY}`;
  try {
      const response = await axios.get(url);
      res.json(response.data);
  } catch (error) {
      console.error('Error fetching historical data from Polygon:', error);
      res.status(500).json({ error: 'Failed to fetch historical data from Polygon' });
  }
});


app.get('/stock/insider-sentiment', async (req, res) => {
    const { item, from, to } = req.query;
    const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${item}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`; // Replace with the actual API endpoint

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching insider sentiment:', error);
        res.status(500).json({ error: 'Failed to fetch insider sentiment' });
    }
});

app.get('/api/recommendation/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    try {
      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching recommendation trends:', error);
      res.status(500).json({ error: 'Failed to fetch recommendation trends' });
    }
  });

  app.get('/api/earnings/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const url = `https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    try {
      const response = await axios.get(url);
      res.json(response.data);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
      res.status(500).json({ error: 'Failed to fetch earnings data' });
    }
});

//insert
app.post('/api/watchlist', async (req, res) => {
    const { ticker, name, currPrice, change, percentChange } = req.body;

    try {
      const result = await database.collection('watchlist').insertOne({
        ticker,
        name,
        currPrice,
        change,
        percentChange,
        addedAt: new Date() // Optionally add the current date when adding to the watchlist
      });

      res.json({ message: 'Stock added to watchlist', result: result });
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
      res.status(500).json({ error: 'Failed to add stock to watchlist' });
    }
  });

  //check
  app.get('/api/watchlist/check/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
      const stock = await database.collection('watchlist').findOne({ ticker: ticker });
      const isInWatchlist = stock !== null; // true if found, false if not found
      res.json({ isInWatchlist });
    } catch (error) {
      console.error('Error checking watchlist:', error);
      res.status(500).json({ error: 'Failed to check watchlist' });
    }
  });

  //delete
  app.delete('/api/watchlist/:ticker', async (req, res) => {
    const { ticker } = req.params;

    try {
      const result = await database.collection('watchlist').deleteOne({ ticker: ticker });
      if (result.deletedCount === 1) {
        res.json({ message: 'Ticker removed from watchlist' });
      } else {
        res.status(404).json({ message: 'Ticker not found in watchlist' });
      }
    } catch (error) {
      console.error('Error removing ticker from watchlist:', error);
      res.status(500).json({ error: 'Failed to remove ticker from watchlist' });
    }
  });

  //fetch all watchlist items
  app.get('/api/watchlist', async (req, res) => {
    try {
      const watchlistItems = await database.collection('watchlist').find({}).toArray(); // Fetch all items
      res.json(watchlistItems);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
  });

  //fetch wallet value
  app.get('/api/wallet', async (req, res) => {
    try {
        const userPortfolio = await database.collection('portfolio').findOne({});
        if (userPortfolio) {
            res.json({ wallet: userPortfolio.wallet });
        } else {
            res.status(404).json({ error: 'Portfolio not found' });
        }
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ error: 'Failed to fetch wallet' });
    }
});

//buy stock
// Add stock to portfolio endpoint
app.post('/api/portfolio/addStock', async (req, res) => {
  const { stockSymbol, quantity, priceBought } = req.body;

  try {
      const portfolio = await database.collection('portfolio').findOne({});
      if (!portfolio) {
          return res.status(404).json({ message: 'Portfolio not found' });
      }

      const totalPurchaseAmount = quantity * priceBought;
      let newWalletBalance = parseFloat(portfolio.wallet) - totalPurchaseAmount;

      // Check if the stockSymbol already exists in the portfolio
      const stockIndex = portfolio.stocks.findIndex(stock => stock.stockSymbol === stockSymbol);

      if (stockIndex > -1) {
          // Stock exists, update its quantity and totalCost
          let stock = portfolio.stocks[stockIndex];
          stock.quantity += quantity;
          stock.totalCost += totalPurchaseAmount;

          // MongoDB's $set to update an item in an array at a specific index
          const updateResult = await database.collection('portfolio').updateOne(
              {},
              {
                  $set: {
                      [`stocks.${stockIndex}`]: stock,
                      wallet: newWalletBalance.toString()
                  }
              }
          );

          if (updateResult.modifiedCount === 1) {
              res.json({ message: 'Stock quantity and total cost updated in portfolio' });
          } else {
              res.status(404).json({ message: 'Failed to update stock in portfolio' });
          }
      } else {
          // Stock does not exist, push it to the stocks array
          const updateResult = await database.collection('portfolio').updateOne(
              {},
              {
                  $push: {
                      stocks: {
                          stockSymbol: stockSymbol,
                          quantity: quantity,
                          totalCost: totalPurchaseAmount,
                      }
                  },
                  $set: {
                      wallet: newWalletBalance.toString()
                  }
              }
          );

          if (updateResult.modifiedCount === 1) {
              res.json({ message: 'Stock added to portfolio and wallet updated' });
          } else {
              res.status(404).json({ message: 'Failed to update portfolio' });
          }
      }
  } catch (error) {
      console.error('Error updating portfolio:', error);
      res.status(500).json({ error: 'Failed to update stock in portfolio' });
  }
});

//check if stock exists in portfolio
app.get('/api/portfolio/hasStock/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const portfolio = await database.collection('portfolio').findOne({});
    const stockExists = portfolio.stocks.some(stock => stock.stockSymbol === symbol);
    res.json({ hasStock: stockExists });
  } catch (error) {
    console.error('Error checking if stock exists in portfolio:', error);
    res.status(500).json({ error: 'Failed to check if stock exists in portfolio' });
  }
});

//fetch stock details for sell
app.get('/api/portfolio/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
      const portfolio = await database.collection('portfolio').findOne({ "stocks.stockSymbol": symbol });
      if (portfolio) {
          const stock = portfolio.stocks.find(s => s.stockSymbol === symbol);
          // Directly sending the stock's quantity along with the wallet balance and stock info
          res.json({ wallet: portfolio.wallet, stock: stock ? stock : { stockSymbol: symbol, quantity: 0 } });
      } else {
          res.status(404).json({ error: 'Stock not found in portfolio' });
      }
  } catch (error) {
      console.error('Error fetching portfolio data:', error);
      res.status(500).json({ error: 'Failed to fetch portfolio data' });
  }
});


// sell stock endpoint
app.post('/api/portfolio/sellStock', async (req, res) => {
  const { symbol, quantitySold, sellPrice } = req.body;

  try {
      const portfolio = await database.collection('portfolio').findOne({ "stocks.stockSymbol": symbol });
      if (!portfolio) {
          return res.status(404).json({ error: 'Portfolio not found' });
      }

      const stockIndex = portfolio.stocks.findIndex(stock => stock.stockSymbol === symbol);
      if (stockIndex === -1) {
          return res.status(404).json({ error: 'Stock not found in portfolio' });
      }

      let stock = portfolio.stocks[stockIndex];
      const totalSellAmount = quantitySold * sellPrice;
      let newWalletBalance = parseFloat(portfolio.wallet) + totalSellAmount;

      if (stock.quantity < quantitySold) {
          return res.status(400).json({ error: 'Not enough stock quantity to sell' });
      }

      stock.quantity -= quantitySold;
      stock.totalCost -= totalSellAmount;

      if (stock.quantity === 0) {
          // Remove the stock from the portfolio if quantity is 0
          await database.collection('portfolio').updateOne(
              { "_id": portfolio._id },
              { $pull: { stocks: { stockSymbol: symbol } }, $set: { wallet: newWalletBalance.toString() } }
          );
      } else {
          // Update the portfolio with the new stock quantity and total cost
          await database.collection('portfolio').updateOne(
              { "_id": portfolio._id },
              { $set: { [`stocks.${stockIndex}`]: stock, wallet: newWalletBalance.toString() } }
          );
      }

      res.json({ message: 'Stock sold and portfolio updated' });
  } catch (error) {
      console.error('Error selling stock:', error);
      res.status(500).json({ error: 'Failed to sell stock' });
  }
});


//fetch portfolio
app.get('/api/portfolio', async (req, res) => {
  try {
    const portfolio = await database.collection('portfolio').findOne({});
    if (portfolio) {
      res.json({ wallet: portfolio.wallet, stocks: portfolio.stocks });
    } else {
      res.status(404).json({ error: 'Portfolio not found' });
    }
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

var DATABASENAME = "HW3";
app.listen(port, async () => {
    try {
        await client.connect();
        database = client.db(DATABASENAME); // This sets the database object
        console.log("Connected to MongoDB Atlas");
        console.log(`Server running on port ${port}`);
    } catch (error) {
        console.error("Could not connect to MongoDB Atlas:", error);
        process.exit(1); // Exit the process if unable to connect
    }
});
