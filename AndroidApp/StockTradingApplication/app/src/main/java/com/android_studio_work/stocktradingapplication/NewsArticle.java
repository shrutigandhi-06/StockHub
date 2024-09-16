package com.android_studio_work.stocktradingapplication;

public class NewsArticle {
    private String image;
    private String source;
    private String headline;
    private String dateTime;
    private String summary;
    private String url;

    public NewsArticle(String image, String source, String headline, String dateTime, String summary, String url) {
        this.image = image;
        this.source = source;
        this.headline = headline;
        this.dateTime = dateTime;
        this.summary = summary;
        this.url = url;
    }

    public String getImage() {
        return image;
    }

    public String getSource() {
        return source;
    }

    public String getHeadline() {
        return headline;
    }

    public String getDateTime() {
        return dateTime;
    }

    public String getSummary() {
        return summary;
    }

    public String getURL() {
        return url;
    }
}
