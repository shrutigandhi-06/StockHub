package com.android_studio_work.stocktradingapplication;

public class PortfolioItem {
    private String ticker;
    private String quantity;
    private String marketValue;
    private String change;
    private String percentChange;

    public PortfolioItem(String ticker, String quantity, String marketValue, String change, String percentChange) {
        this.ticker = ticker;
        this.quantity = quantity;
        this.marketValue = marketValue;
        this.change = change;
        this.percentChange = percentChange;
    }


    public String getTicker() {
        return ticker;
    }

    public String getQuantity() {
        return quantity;
    }

    public String getChange() {
        return change;
    }

    public void setChange(String change) {
        this.change = change;
    }
    public void setPercentChange(String percentChange) {
        this.percentChange = percentChange;
    }
    public String getPercentChange() {
        return percentChange;
    }

    public String getMarketValue() {
        return marketValue;
    }
}
