package com.android_studio_work.stocktradingapplication;

public class WatchlistItem {
    private String ticker;
    private String companyName;
    private String currPrice;
    private String change;
    private String percentChange;

    public WatchlistItem(String ticker, String companyName, String currPrice, String change, String percentChange) {
        this.ticker = ticker;
        this.companyName = companyName;
        this.currPrice = currPrice;
        this.change = change;
        this.percentChange = percentChange;
    }

    public String getTicker() {
        return ticker;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getCurrPrice() {
        return currPrice;
    }

    public String getChange() {
        return change;
    }

    public String getPercentChange() {
        return percentChange;
    }
}
