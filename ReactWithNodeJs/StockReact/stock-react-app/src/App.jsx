  import './App.css';
  import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
  import Navbar from './components/Navbar';
  import AutoCompleteSearch from './components/AutoCompleteSearch';
  import Heading from './components/Heading';
  import Watchlist from './components/Watchlist';
  import Portfolio from './components/Portfolio';
  import { TickerProvider } from './contexts/TickerContext'; // Adjust the import path as necessary
  import 'bootstrap/dist/css/bootstrap.min.css';
  import Footer from './components/Footer';



  function App() {
    return (
      <div style={{position:"relative",minHeight:"100vh"}}>
      <div style={{paddingBottom:"2.5rem"}}>
      <TickerProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/search/home" replace={true} />} />
            <Route path="/search/home" element={<><Heading /><AutoCompleteSearch /></>} />
            <Route path="/search/:ticker" element={<><Heading /><AutoCompleteSearch /></>}/>
            <Route path="/watchlist" element={<><Watchlist /> </>} />
            <Route path="/portfolio" element={<><Portfolio /></>} />
          </Routes>
        </BrowserRouter>
      </TickerProvider>

      </div>
      <Footer />
      </div>
    );
  }

  export default App;
