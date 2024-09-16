import React from "react";

function Footer() {
  return (
    <footer className="footer" style={{display:'flex', alignItems:'center'}}>
      <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
        <p className="footer-text">Powered by <a href="https://finnhub.io/" style={{textDecoration: "underline"}} target="_blank" rel="noopener noreferrer">FinnHub.io</a></p>
      </div>
    </footer>
  );
}

export default Footer;
