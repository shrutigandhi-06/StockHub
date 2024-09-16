package com.android_studio_work.stocktradingapplication;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.viewpager2.widget.ViewPager2;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.text.Editable;
import android.text.SpannableString;
import android.text.Spanned;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.text.style.UnderlineSpan;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.ImageView;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.RequestBody;
import okhttp3.Response;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Text;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import android.app.Dialog;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.widget.Toast;

import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;
import com.squareup.picasso.Picasso;

public class DetailActivity extends AppCompatActivity implements NewsRecyclerViewInterface{

    private OkHttpClient client = new OkHttpClient();
    private TextView openPriceTextView;
    private TextView highPriceTextView;
    private TextView lowPriceTextView;
    private TextView prevCloseTextView;

    private TextView ipoStartDateTextView;
    private TextView industryTextView;
    private TextView webpageTextView;
//    private TextView companyPeersTextView;

    private LinearLayout linearLayout;

    private TextView totalMSRPTV;
    private TextView totalChangeTV;
    private TextView positiveMSRPTV;
    private TextView negativeMSRPTV;
    private TextView positiveChangeTV;
    private TextView negativeChangeTV;

    private String companyName;

    private ArrayList<NewsArticle> newsArticles = new ArrayList<>();
    private boolean isFavorite = false;
    private String currentPrice;
    private String change;
    private String percentChange;
    private String symbol;
    private int availableQuantity = 0;

    private TabLayout tabLayout;
    private ViewPager2 viewPager;
    private ViewPagerAdapter adapter;

    private ImageView newsImageBig;
    private TextView newsSourceBig;
    private TextView newsTimeBig;
    private TextView newsTitleBig;

    private TextView stockNameTV;

    private TextView companyNameTV;

    private TextView currPriceTV;

    private TextView stockPriceChangeTV;

    private TextView stockChangePercentageTV;
    private ImageView trendingUpOrDownIV;

    private TextView sharesOwnedTV;
    private TextView avgCostPerShareTV;
    private TextView totalCostTV;
    private TextView portfolioChangeTv;
    private TextView marketValueTV;

    private ProgressBar progressBar;

    private LinearLayout mainLayout;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_detail);

        progressBar = findViewById(R.id.progressBar);
        mainLayout = findViewById(R.id.mainLayout);

        symbol = getIntent().getStringExtra("SYMBOL");
        Log.d("SYMBOL", symbol);
        fetchStockData(symbol);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle(symbol);
        }
        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                onBackPressed();
            }
        });

        final ImageView starImageView = findViewById(R.id.star);
        starImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                toggleFavoriteAndUpdateWatchlist(starImageView);
            }
        });


        viewPager = findViewById(R.id.view_pager);
        tabLayout = findViewById(R.id.tabs);
        adapter = new ViewPagerAdapter(this, symbol);
        viewPager.setAdapter(adapter);

        new TabLayoutMediator(tabLayout, viewPager, new TabLayoutMediator.TabConfigurationStrategy() {
            @Override
            public void onConfigureTab(TabLayout.Tab tab, int position) {

                if (position == 0){
                    tab.setIcon(R.drawable.chart_hour);
                }
                else if (position == 1)
                    tab.setIcon(R.drawable.chart_historical);
            }
        }).attach();

        fetchRecommendationChartData(symbol);

        fetchEPSChartData(symbol);

        fetchCompanyProfile(symbol);

        checkWatchlist(symbol, starImageView);


        stockNameTV = findViewById(R.id.stockName);
        stockNameTV.setText(symbol);
        companyNameTV = findViewById(R.id.companyName);
        currPriceTV = findViewById(R.id.currentPrice);
        stockPriceChangeTV = findViewById(R.id.stockPriceChange);
        stockChangePercentageTV = findViewById(R.id.stockChangePercentage);
        trendingUpOrDownIV = findViewById(R.id.trendingImg);
        sharesOwnedTV = findViewById(R.id.quantity);
        avgCostPerShareTV = findViewById(R.id.costPerShare);
        totalCostTV = findViewById(R.id.totalCost);
        portfolioChangeTv = findViewById(R.id.change);
        marketValueTV = findViewById(R.id.marketValue);

        openPriceTextView = findViewById(R.id.openPrice);
        highPriceTextView = findViewById(R.id.highPrice);
        lowPriceTextView = findViewById(R.id.lowPrice);
        prevCloseTextView = findViewById(R.id.prevClose);

        ipoStartDateTextView = findViewById(R.id.ipoStartDate);
        industryTextView = findViewById(R.id.industry);
        webpageTextView = findViewById(R.id.webpage);
        linearLayout = findViewById(R.id.horizontal_layout);

        fetchCompanyData(symbol);

        totalMSRPTV = findViewById(R.id.totalMSRP);
        totalChangeTV = findViewById(R.id.totalChange);
        positiveMSRPTV = findViewById(R.id.positiveMSRP);
        negativeMSRPTV = findViewById(R.id.negativeMSRP);
        positiveChangeTV = findViewById(R.id.positiveChange);
        negativeChangeTV = findViewById(R.id.negativeChange);

        fetchInsightsData(symbol);

        newsTitleBig = findViewById(R.id.newsTitleBig);
        newsSourceBig = findViewById(R.id.newsSourceBig);
        newsImageBig = findViewById(R.id.newsImageBig);
        newsTimeBig = findViewById(R.id.newsTimeBig);

        webpageTextView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openWebPageInChrome(webpageTextView.getText().toString());
            }
        });

        fetchPortfolioData(symbol);

        RecyclerView newsRecyclerView = findViewById(R.id.newsRecyclerView);

        fetchNewsData(symbol, ()->{
            NewsAdapter newsAdapter = new NewsAdapter(this, newsArticles, this);
            newsRecyclerView.setAdapter(newsAdapter);
            newsRecyclerView.setLayoutManager(new LinearLayoutManager(this));
        });

        Button tradeButton = findViewById(R.id.tradeButton);
        tradeButton.setOnClickListener(view -> {
            // Code to execute when the button is clicked
            tradeStock(currentPrice);
        });
        checkDataFetched();
    }

    private void checkDataFetched() {

            runOnUiThread(() -> {

                final Handler handler = new Handler();
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        mainLayout.setVisibility(View.VISIBLE); // Show the main content
                        progressBar.setVisibility(View.GONE); // Hide the progress bar
                    }
                }, 1000);

            });

    }

    private void fetchPortfolioData(String symbol) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/portfolio/"+symbol;
        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("fetchAvailableQuantity", "Error fetching available quantity", e);

                sharesOwnedTV.setText("0");
                totalCostTV.setText("$0.00");
                marketValueTV.setText("$0.00");
                avgCostPerShareTV.setText("$0.00");
                portfolioChangeTv.setText("$0.00");
            }
            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.d("ResponseInFetchPortfolio", response.toString());
                if (!response.isSuccessful()) {
                    Log.e("fetchAvailableQuantity", "Response not successful: " + response);
                } else {
                    try {
                        String responseData = response.body().string();
                        JSONObject jsonObject = new JSONObject(responseData);
                        Log.d("JSONObject", responseData);

                        if (jsonObject.has("error")) {

                            sharesOwnedTV.setText("0");
                            totalCostTV.setText("$0.00");
                            marketValueTV.setText("$0.00");
                            avgCostPerShareTV.setText("$0.00");
                            portfolioChangeTv.setText("$0.00");

                        } else {
                            JSONObject stockObject = jsonObject.getJSONObject("stock");
                            String availableQuantity = stockObject.getString("quantity");

                            String totalCost = "$"+String.format("%.2f", Double.parseDouble(stockObject.getString("totalCost")));
                            Double avgCostPerShare = stockObject.getDouble("totalCost") / stockObject.getInt("quantity");
                            String avgCost = "$"+String.format("%.2f", avgCostPerShare);
//                            Log.d("CurrPrice", currentPrice);
//                            Log.d("AvgCost", avgCostPerShare+"");

                            // Run updates on the UI thread
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    marketValueTV.setText("$"+String.format("%.2f", Double.parseDouble(currentPrice)*Integer.parseInt(availableQuantity)));
                                    sharesOwnedTV.setText(availableQuantity);
                                    totalCostTV.setText(totalCost);
                                    avgCostPerShareTV.setText(avgCost);
                                    portfolioChangeTv.setText("$"+String.format("%.2f",Math.abs(Double.parseDouble(currentPrice)-avgCostPerShare)));
                                    Log.d("Heyyy",""+(String.format("%.2f", Double.parseDouble(currentPrice)-avgCostPerShare)+""));

                                    if(String.format("%.2f", Double.parseDouble(currentPrice)-avgCostPerShare).equals("0.00")|| String.format("%.2f", Double.parseDouble(currentPrice)-avgCostPerShare).equals("-0.00")){
                                        portfolioChangeTv.setTextColor(Color.parseColor("#000000"));
                                        marketValueTV.setTextColor(Color.parseColor("#000000"));
                                    }
                                    else if((int)Double.parseDouble(currentPrice)-avgCostPerShare>0){
                                        portfolioChangeTv.setTextColor(Color.parseColor("#40a46c"));
                                        marketValueTV.setTextColor(Color.parseColor("#40a46c"));
                                    }
                                    else{
                                        portfolioChangeTv.setTextColor(Color.parseColor("#ec3301"));
                                        marketValueTV.setTextColor(Color.parseColor("#ec3301"));
                                    }
                                }
                            });

                        }
                    } catch (JSONException e) {
                        Log.e("fetchAvailableQuantity", "JSON parsing error", e);
                    }
                }
            }

        });
    }

    public void fetchRecommendationChartData(String item) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/recommendation/" + item)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace(); // Handle the error
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    String recommendationData = response.body().string();
                    Log.d("RecommendationData", recommendationData);
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            WebView recommendationWebView = findViewById(R.id.recommendationChart);
                            WebSettings rcWebSettings = recommendationWebView.getSettings();
                            rcWebSettings.setJavaScriptEnabled(true);

                            recommendationWebView.setWebViewClient(new WebViewClient() {
                                @Override
                                public void onPageFinished(WebView view, String url) {
                                    // Pass recommendation data once the page is finished loading
                                    recommendationWebView.evaluateJavascript("make_recommendation_chart('" + recommendationData + "')", null);
                                }
                            });

                            // Load the HTML file containing the chart
                            recommendationWebView.loadUrl("file:///android_asset/chart.html");
                        }
                    });
                } else {
                    // Handle the response error
                }
            }
        });
    }

    public void fetchEPSChartData(String item) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/earnings/" + item)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace(); // Handle the error
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    String EPSData = response.body().string();
                    Log.d("EPSData", EPSData);
//                    Toast.makeText(DetailActivity.this, recommendationData, Toast.LENGTH_LONG).show();
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            WebView EPSWebView = findViewById(R.id.EPSChart);
                            WebSettings rcWebSettings = EPSWebView.getSettings();
                            rcWebSettings.setJavaScriptEnabled(true);

                            EPSWebView.setWebViewClient(new WebViewClient() {
                                @Override
                                public void onPageFinished(WebView view, String url) {
                                    // Pass recommendation data once the page is finished loading
                                    EPSWebView.evaluateJavascript("make_eps_charts('" + EPSData + "')", null);
                                }
                            });

                            // Load the HTML file containing the chart
                            EPSWebView.loadUrl("file:///android_asset/chart.html");
                        }
                    });
                } else {
                    // Handle the response error
                }
            }
        });
    }

    private void openWebPageInChrome(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.setPackage("com.android.chrome");
        try {
            startActivity(intent);
        } catch (ActivityNotFoundException ex) {
            intent.setPackage(null);
            startActivity(intent);
        }
    }

    public interface WalletBalanceCallback {
        void onBalanceFetched(String balance);
        void onError(String error);
    }

    private void fetchWalletBalance(WalletBalanceCallback callback) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/wallet";
        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("fetchWalletBalance", "Error fetching wallet balance", e);
                if (callback != null) {
                    callback.onError("Failed to fetch wallet balance");
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("fetchWalletBalance", "Response not successful: " + response);
                    if (callback != null) {
                        callback.onError("Error fetching wallet balance");
                    }
                } else {
                    try {
                        String responseData = response.body().string();
                        JSONObject jsonObject = new JSONObject(responseData);
                        String walletBalance = jsonObject.getString("wallet");
                        if (callback != null) {
                            callback.onBalanceFetched(walletBalance);
                        }
                    } catch (JSONException e) {
                        Log.e("fetchWalletBalance", "JSON parsing error", e);
                        if (callback != null) {
                            callback.onError("JSON parsing error");
                        }
                    }
                }
            }
        });
    }

    public interface AvailableQuantityCallback {
        void onAvailableQuantityFetched(int availableQuantity);
        void onError(String error);
    }

    private void fetchAvailableQuantity(AvailableQuantityCallback callback) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/portfolio/"+symbol;
        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("fetchAvailableQuantity", "Error fetching available quantity", e);
                if (callback != null) {
                    callback.onAvailableQuantityFetched(0);
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("fetchAvailableQuantity", "Response not successful: " + response);
                    if (callback != null) {
                        callback.onAvailableQuantityFetched(Integer.parseInt("0"));
                    }
                } else {
                    try {
                        String responseData = response.body().string();
                        JSONObject jsonObject = new JSONObject(responseData);
                        JSONObject stockObject = jsonObject.getJSONObject("stock");
                        String availableQuantity = stockObject.getString("quantity");
                        if (callback != null) {
                            callback.onAvailableQuantityFetched(Integer.parseInt(availableQuantity));
                        }
                    } catch (JSONException e) {
                        Log.e("fetchAvailableQuantity", "JSON parsing error", e);
                        if (callback != null) {
                            callback.onError("JSON parsing error");
                        }
                    }
                }
            }
        });
    }

    private void handleSell(String stockSymbol, int quantitySold, double sellPrice, Dialog dialog) {
        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        OkHttpClient client = new OkHttpClient();
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("symbol", stockSymbol);
            jsonObject.put("quantitySold", quantitySold);
            jsonObject.put("sellPrice", sellPrice);
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(this, "Error creating JSON data for selling.", Toast.LENGTH_SHORT).show();
            return;
        }

        RequestBody body = RequestBody.create(jsonObject.toString(), JSON);
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/portfolio/sellStock")
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                runOnUiThread(() -> {
                    Toast.makeText(DetailActivity.this, "Failed to execute sell request.", Toast.LENGTH_SHORT).show();
                });
                Log.e("handleSell", "Error making sell request:", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("handleSell", "Unexpected code " + response);
                    runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Sell failed.", Toast.LENGTH_SHORT).show());
                    return;
                }
                try {
                    String responseData = response.body().string();
                    JSONObject jsonResponse = new JSONObject(responseData);
                    String message = jsonResponse.getString("message");
                    runOnUiThread(() -> {
                        dialog.dismiss();
                        String msg = String.format("You have successfully sold %d shares of %s.", quantitySold, stockSymbol);
                        showSuccessDialog(msg);
                    });
                } catch (JSONException e) {
                    Log.e("handleSell", "JSON parsing error", e);
                    runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Error parsing sell response.", Toast.LENGTH_SHORT).show());
                }
            }
        });
    }

    public void handleBuy(String stockSymbol, int quantity, double priceBought, Dialog dialog) {
        OkHttpClient client = new OkHttpClient();
        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        JSONObject jsonObject = new JSONObject();
        try {
            jsonObject.put("stockSymbol", stockSymbol);
            jsonObject.put("quantity", quantity);
            jsonObject.put("priceBought", priceBought);
        } catch (JSONException e) {
            e.printStackTrace();
            Toast.makeText(this, "Error creating JSON data.", Toast.LENGTH_SHORT).show();
            return;
        }

        RequestBody body = RequestBody.create(jsonObject.toString(), JSON);
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/portfolio/addStock")
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                runOnUiThread(() -> {
                    Toast.makeText(DetailActivity.this, "Failed to execute purchase request.", Toast.LENGTH_SHORT).show();
                });
                Log.e("handleBuy", "Error making purchase:", e);
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    Log.e("handleBuy", "Unexpected code " + response);
                    runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Purchase failed.", Toast.LENGTH_SHORT).show());
                    return;
                }
                try {
                    String responseData = response.body().string();
                    JSONObject jsonResponse = new JSONObject(responseData);
                    String message = jsonResponse.getString("message");
                    runOnUiThread(() -> {
                        if (message.equals("Stock added to portfolio and wallet updated") || message.equals("Stock quantity and total cost updated in portfolio")) {
                            dialog.dismiss();
                            marketValueTV.setText("$"+String.format("%.2f", Double.parseDouble(currentPrice)*quantity));
                            String msg = String.format("You have successfully bought %d shares of %s.", quantity, stockSymbol);
                            showSuccessDialog(msg);
                        } else {
                            Toast.makeText(DetailActivity.this, "Purchase failed: " + message, Toast.LENGTH_SHORT).show();
                        }
                    });
                } catch (JSONException e) {
                    Log.e("handleBuy", "JSON parsing error", e);
                    runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Error parsing purchase response.", Toast.LENGTH_SHORT).show());
                }
            }
        });
    }

    private void showSuccessDialog(String message) {
        Dialog successDialog = new Dialog(this);
        successDialog.setContentView(R.layout.stock_bought_popup); // Assume you have a layout `layout_success_dialog.xml`

        successDialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        successDialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        successDialog.getWindow().setGravity(Gravity.CENTER);
        successDialog.setCanceledOnTouchOutside(true);

        Button okButton = successDialog.findViewById(R.id.buttonDone);
        okButton.setOnClickListener(v -> successDialog.dismiss());
        okButton.setOnClickListener(v -> {
            successDialog.dismiss();  // Dismiss the dialog
            // Add any additional actions here

            fetchPortfolioData(symbol);  // This is an example method call
        });

        TextView successDialogMessage = successDialog.findViewById(R.id.successDialogMessage);

        successDialogMessage.setText(message);

        successDialog.show();
    }

    public void tradeStock(String currentPrice) {
        Dialog dialog = new Dialog(this);

        LayoutInflater inflater = getLayoutInflater();
        View popupView = inflater.inflate(R.layout.trade_stock_popup, null);

        dialog.setContentView(popupView);

        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));
        dialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        dialog.getWindow().setGravity(Gravity.CENTER); // Set the position of the dialog

        dialog.setCanceledOnTouchOutside(true);
        TextView walletTextView = popupView.findViewById(R.id.textViewWallet);

        EditText numberOfSharesEditText = popupView.findViewById(R.id.editTextNumberOfShares);

        TextView companyTextView = popupView.findViewById(R.id.textViewCompanyName);
        TextView symbolTextView = popupView.findViewById(R.id.textViewSymbol);
        TextView sharesTextView = popupView.findViewById(R.id.textViewShares);
        TextView stockPriceTextView = popupView.findViewById(R.id.textViewStockPrice);
        TextView totalPriceTextView = popupView.findViewById(R.id.textViewTotalPrice);
        companyTextView.setText(companyName);
        symbolTextView.setText(symbol);
        sharesTextView.setText("0");
        stockPriceTextView.setText(currentPrice);

        // Fetch wallet balance and update TextView within dialog
        fetchWalletBalance(new WalletBalanceCallback() {
            @Override
            public void onBalanceFetched(String balance) {
                double balanceValue = Double.parseDouble(balance);
                String formattedBalance = String.format(Locale.US, "%,.2f", balanceValue);
                runOnUiThread(() -> walletTextView.setText(formattedBalance));
            }

            @Override
            public void onError(String error) {
                runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Failed to fetch wallet balance: " + error, Toast.LENGTH_SHORT).show());
            }
        });

        fetchAvailableQuantity(new AvailableQuantityCallback() {
            @Override
            public void onAvailableQuantityFetched(int quantity) {
                availableQuantity = quantity;
            }

            @Override
            public void onError(String error) {
                runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Failed to fetch wallet balance: " + error, Toast.LENGTH_SHORT).show());
            }
        });

        numberOfSharesEditText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                updateTotalPrice();
            }

            @Override
            public void afterTextChanged(Editable s) {
            }

            private void updateTotalPrice() {
                String sharesStr = numberOfSharesEditText.getText().toString().trim();
                if (!sharesStr.isEmpty() && TextUtils.isDigitsOnly(sharesStr)) {
                    int shares = Integer.parseInt(sharesStr);
                    double pricePerShare = Double.parseDouble(stockPriceTextView.getText().toString());
                    double totalPrice = shares * pricePerShare;
                    sharesTextView.setText(sharesStr);
                    totalPriceTextView.setText(String.format(Locale.US, "%,.2f", totalPrice));
                } else {
                    totalPriceTextView.setText("0.00");
                }
            }
        });


        Button buyButton = popupView.findViewById(R.id.buttonBuy);
        Button sellButton = popupView.findViewById(R.id.buttonSell);


        View.OnClickListener validateAndTradeListener = new View.OnClickListener() {

            @Override
            public void onClick(View v) {
                String numberOfSharesStr = numberOfSharesEditText.getText().toString().trim();
                if (numberOfSharesStr.isEmpty() || Integer.parseInt(numberOfSharesStr) == 0) {
                    Toast.makeText(DetailActivity.this, "Please enter valid value", Toast.LENGTH_LONG).show();
                }
                else if (Double.parseDouble(totalPriceTextView.getText().toString().replace(",", "")) > Double.parseDouble(walletTextView.getText().toString().replace(",", ""))) {
                    Toast.makeText(DetailActivity.this, "Not enough money to buy stock.", Toast.LENGTH_LONG).show();
                }
                else {

                    int quantity = Integer.parseInt(numberOfSharesStr);
                    double priceBought = Double.parseDouble(currentPrice);
                    handleBuy(symbol, quantity, priceBought, dialog);
                }
            }
        };

        sellButton.setOnClickListener(view -> {
            String numberOfSharesStr = numberOfSharesEditText.getText().toString().trim();
            if (numberOfSharesStr.isEmpty() || Integer.parseInt(numberOfSharesStr) == 0) {
                Toast.makeText(DetailActivity.this, "Please enter a valid value.", Toast.LENGTH_LONG).show();
            }
            else if(Integer.parseInt(numberOfSharesStr)>availableQuantity){
                Toast.makeText(DetailActivity.this, "Not enough stock to sell.", Toast.LENGTH_LONG).show();
            }
            else {
                int quantity = Integer.parseInt(numberOfSharesStr);
                if(availableQuantity-quantity==0){
                    Log.d("Heyyyyy", "Inside if");

                    DetailActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            sharesOwnedTV.setText("0");
                            totalCostTV.setText("$0.00");
                            marketValueTV.setText("$0.00");
                            avgCostPerShareTV.setText("$0.00");
                            portfolioChangeTv.setText("$0.00");
                        }
                    });


                }
                double priceSold = Double.parseDouble(currentPrice);  // Ensure currentPrice is appropriately set and parsed
                handleSell(symbol, quantity, priceSold, dialog);
            }
        });

        buyButton.setOnClickListener(validateAndTradeListener);

        dialog.show();
    }

    private void toggleFavoriteAndUpdateWatchlist(ImageView star) {
        isFavorite = !isFavorite;
        star.setImageResource(isFavorite ? R.drawable.full_star : R.drawable.star_border);
        String toastMessage = symbol + (isFavorite ? " added to favourites." : " removed from favourites.");
        Toast.makeText(this, toastMessage, Toast.LENGTH_SHORT).show();

        if (isFavorite) {
            try {
                JSONObject stockData = new JSONObject();
                try {
                    stockData.put("ticker", symbol);
                    stockData.put("name", companyName);
                    stockData.put("currPrice", currentPrice);
                    stockData.put("change", change);
                    stockData.put("percentChange", percentChange);
                } catch (JSONException e) {
                    e.printStackTrace();
                }

                String url = "https://stock-node-server.wl.r.appspot.com/api/watchlist";
                MediaType JSON = MediaType.parse("application/json; charset=utf-8");

                OkHttpClient client = new OkHttpClient();
                RequestBody body = RequestBody.create(JSON, stockData.toString());
                Request request = new Request.Builder()
                        .url(url)
                        .post(body)
                        .build();

                client.newCall(request).enqueue(new Callback() {
                    @Override
                    public void onFailure(Call call, IOException e) {
                        e.printStackTrace();
                        // Handle the failure case
//                        runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Error adding to watchlist", Toast.LENGTH_SHORT).show());
                    }

                    @Override
                    public void onResponse(Call call, Response response) throws IOException {
                        if (!response.isSuccessful()) {
                            throw new IOException("Unexpected code " + response);
                        } else {
                            // Handle the success case
//                            runOnUiThread(() -> Toast.makeText(DetailActivity.this, "Added to watchlist successfully", Toast.LENGTH_SHORT).show());
                        }
                    }
                });
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        if(!isFavorite){
            removeFromWatchlist(symbol);
        }
    }

    public void removeFromWatchlist(String symbol) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/watchlist/" + symbol;

        Request request = new Request.Builder()
                .url(url)
                .delete() // This makes it a DELETE request
                .build();

        // Asynchronously perform the network request
        client.newCall(request).enqueue(new okhttp3.Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                e.printStackTrace();
                // Handle the error
                Log.e("removeFromWatchlist", "Error removing from watchlist", e);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    // Handle success
                } else {
                    Log.e("removeFromWatchlist", "Server responded with error: " + response.code());
                }
            }
        });
    }

    public void checkWatchlist(String symbol, ImageView star) {
        // Define the URL for the GET request
        String url = "https://stock-node-server.wl.r.appspot.com/api/watchlist/check/" + symbol;

        // Create a GET request
        Request request = new Request.Builder()
                .url(url)
                .build();

        // Asynchronously perform the network request
        client.newCall(request).enqueue(new okhttp3.Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                e.printStackTrace();
                // Handle the error, possibly update the UI to show an error message
                Log.e("checkWatchlist", "Error checking watchlist status", e);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    try {
                        String responseData = response.body().string();
                        JSONObject json = new JSONObject(responseData);
                        final boolean isInWatchlist = json.optBoolean("isInWatchlist");
                        Log.d("IsInWatchlist", Boolean.toString(isInWatchlist));
                        isFavorite = isInWatchlist;
                        star.setImageResource(isFavorite ? R.drawable.full_star : R.drawable.star_border);

                    } catch (JSONException e) {
                        e.printStackTrace();
                    }
                } else {
                    Log.e("checkWatchlist", "Server responded with error: " + response.code());
                }
            }
        });
    }

    public void showPopup(String source, String dateTime, String headline, String summary, String url) {
        // Create a Dialog instance
        Dialog dialog = new Dialog(this);

        // Inflate the custom layout
        LayoutInflater inflater = getLayoutInflater();
        View popupView = inflater.inflate(R.layout.news_article_popup, null);

        // Set the custom layout as the dialog content
        dialog.setContentView(popupView);

        // Customize the dialog features
        dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT)); // Make the background of the dialog transparent
        dialog.getWindow().setLayout(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT); // Set the size of the dialog to match the parent width
        dialog.getWindow().setGravity(Gravity.CENTER); // Set the position of the dialog

        // Set the dialog to dismiss when touched outside
        dialog.setCanceledOnTouchOutside(true);

        // Find the title text view and set its text
        TextView headlineTextView = popupView.findViewById(R.id.headline_text_view);
        TextView sourceTextView = popupView.findViewById(R.id.source_text_view);
        TextView dateTextView = popupView.findViewById(R.id.date_text_view);
        TextView summaryTextView = popupView.findViewById(R.id.summary_text_view);
        headlineTextView.setText(headline);
        sourceTextView.setText(source);
        dateTextView.setText(dateTime);
        summaryTextView.setText(summary);

        ImageView chromeImageView = popupView.findViewById(R.id.image_chrome);
        chromeImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openWebPage(url);
            }
        });

        ImageView twitterImageView = popupView.findViewById(R.id.image_cross);
        twitterImageView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tweetArticle(headline, url);
            }
        });

        ImageView facebookImageView = popupView.findViewById(R.id.image_facebook);
        facebookImageView.setOnClickListener((new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                facebookArticle(headline, url);
            }
        }));

        // Show the dialog
        dialog.show();
    }

    private void openWebPage(String url) {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(url));
        startActivity(intent);
    }

    private void facebookArticle(String headline, String url){
        String encodedUrl = Uri.encode(url); // URL encode the article URL
        String facebookUrl = "https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl;

        Intent shareIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(facebookUrl));
        shareIntent.setPackage("com.android.chrome"); // Try to open in Chrome if installed

        try {
            startActivity(shareIntent);
        } catch (ActivityNotFoundException ex) {
            // Fallback if Chrome is not installed, attempt to open in the default browser
            shareIntent.setPackage(null); // Clear the package
            startActivity(Intent.createChooser(shareIntent, "Open with:"));
        }
    }
    private void tweetArticle(String headline, String url) {
        String tweetText = headline + " " + url; // Format the tweet
        String encodedTweetText = Uri.encode(tweetText); // URL encode the tweet text
        String twitterUrl = "https://twitter.com/intent/tweet?text=" + encodedTweetText; // Create the URL

        Intent tweetIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(twitterUrl));
        tweetIntent.setPackage("com.android.chrome"); // Set the package to Chrome if installed

        try {
            startActivity(tweetIntent);
        } catch (ActivityNotFoundException ex) {
            // Fallback if Chrome is not installed, attempt to open in default browser
            tweetIntent.setPackage(null); // Clear the package
            startActivity(Intent.createChooser(tweetIntent, "Open with:"));
        }

//                String tweetText = headline + " " + url; // Format the tweet
//                String encodedTweetText = Uri.encode(tweetText); // URL encode the tweet text
//                String twitterUrl = "https://twitter.com/intent/tweet?text=" + encodedTweetText; // Create the URL
//
//                Intent tweetIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(twitterUrl));
//                tweetIntent.setPackage("com.android.chrome"); // Set the package to Chrome if installed
//
//                DetailActivity.this.startActivity(tweetIntent);

            }



    interface NewsDataFetchListener {
        void onDataFetched();
    }
    private void fetchNewsData(String symbol, NewsDataFetchListener listener) {
        OkHttpClient client = new OkHttpClient();
        String url = "https://api-dot-web-tech-assignment-3-418407.uc.r.appspot.com/stock/news/"+symbol;
        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                // Handle the error
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                } else {
                    final String responseData = response.body().string();

                    DetailActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            parseJsonData(responseData);
                            listener.onDataFetched();
                        }
                    });
                }
            }
        });
    }

    private void parseJsonData(String jsonData) {
        try {
            Log.d("NewsArticles", jsonData);
            JSONArray jsonArray = new JSONArray(jsonData);
            newsTitleBig.setText(jsonArray.getJSONObject(0).optString("headline"));
            newsSourceBig.setText(jsonArray.getJSONObject(0).optString("source"));
            String dtBig="";
            LocalDateTime dateTimeBig = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                dateTimeBig = LocalDateTime.ofInstant(Instant.ofEpochSecond(Long.parseLong(jsonArray.getJSONObject(0).optString("datetime"))), ZoneId.systemDefault());
            }
            LocalDateTime nowBig = null;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                nowBig = LocalDateTime.now();
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                dtBig = ChronoUnit.HOURS.between(dateTimeBig, nowBig)+" hours ago";
            }
            newsTimeBig.setText(dtBig);
            Picasso.get().load(jsonArray.getJSONObject(0).optString("image")).resize(1080, 1080).into(newsImageBig);
            for (int i = 1; i <jsonArray.length(); i++) {
                JSONObject jsonObject = jsonArray.getJSONObject(i);

                String image = jsonObject.optString("image");
                String source = jsonObject.optString("source");
                String headline = jsonObject.optString("headline");
                String summary = jsonObject.optString("summary");
                String datetime ="";
                String url = jsonObject.optString("url");


                LocalDateTime dateTime = null;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    dateTime = LocalDateTime.ofInstant(Instant.ofEpochSecond(Long.parseLong(jsonObject.optString("datetime"))), ZoneId.systemDefault());
                }
                LocalDateTime now = null;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    now = LocalDateTime.now();
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    datetime = ChronoUnit.HOURS.between(dateTime, now)+" hours ago";
                }

                NewsArticle article = new NewsArticle(image, source, headline, datetime, summary, url);

                newsArticles.add(article);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void fetchStockData(String symbol) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/quote/" + symbol;

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                } else {
                    final String responseData = response.body().string();
                    DetailActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                JSONObject jsonObject = new JSONObject(responseData);
                                String openPrice = jsonObject.getString("o");
                                String highPrice = jsonObject.getString("h");
                                String lowPrice = jsonObject.getString("l");
                                String prevClose = jsonObject.getString("pc");
                                currentPrice = jsonObject.getString("c");
                                change = jsonObject.getString("d");
                                percentChange = jsonObject.getString("dp");

                                openPriceTextView.setText("$" + openPrice);
                                highPriceTextView.setText("$" + highPrice);
                                lowPriceTextView.setText("$" + lowPrice);
                                prevCloseTextView.setText("$" + prevClose);

                                currPriceTV.setText("$ "+String.format(Locale.US, "%,.2f", Double.parseDouble(currentPrice)));
                                stockPriceChangeTV.setText("$"+String.format(Locale.US, "%,.2f", Double.parseDouble(change)));
                                stockChangePercentageTV.setText("("+String.format(Locale.US, "%,.2f", Double.parseDouble(percentChange))+"%)");


                                if(Double.parseDouble(change)>0){
                                    stockPriceChangeTV.setTextColor(Color.parseColor("#40a46c"));
                                    stockChangePercentageTV.setTextColor(Color.parseColor("#40a46c"));
//                                    marketValueTV.setTextColor(Color.parseColor("#40a46c"));
//                                    portfolioChangeTv.setTextColor(Color.parseColor("#40a46c"));
                                    trendingUpOrDownIV.setImageResource(R.drawable.trending_up);
                                }
                                else if(Double.parseDouble(change)<0){
                                    stockPriceChangeTV.setTextColor(Color.parseColor("#F44336"));
                                    stockChangePercentageTV.setTextColor(Color.parseColor("#F44336"));
                                    trendingUpOrDownIV.setImageResource(R.drawable.trending_down);
//                                    marketValueTV.setTextColor(Color.parseColor("#F44336"));
//                                    portfolioChangeTv.setTextColor(Color.parseColor("#F44336"));
                                }
                                else{
                                    stockPriceChangeTV.setTextColor(Color.parseColor("#000000"));
                                    stockChangePercentageTV.setTextColor(Color.parseColor("#000000"));
                                    trendingUpOrDownIV.setImageResource(R.drawable.default_white);
//                                    marketValueTV.setTextColor(Color.parseColor("#000000"));
//                                    portfolioChangeTv.setTextColor(Color.parseColor("#000000"));
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }
        });
    }

    private void fetchCompanyProfile(String symbol) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/profile/" + symbol;

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                // Handle the failure case
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                } else {
                    final String responseData = response.body().string();
                    DetailActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                JSONObject jsonObject = new JSONObject(responseData);
                                companyName = jsonObject.optString("name");
                                companyNameTV.setText(companyName);
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }
        });
    }

    private void fetchCompanyData(String symbol) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/company/" + symbol;

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                // Handle the failure case
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                } else {
                    final String responseData = response.body().string();
                    DetailActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                JSONObject jsonObject = new JSONObject(responseData);
                                String ipoStartDate = jsonObject.optString("ipo");
                                String industry = jsonObject.optString("finnhubIndustry");
                                String webpage = jsonObject.optString("weburl");
                                JSONArray peersArray = jsonObject.optJSONArray("peers");

                                // Convert JSONArray to a comma-separated String
                                String peers = joinJSONArray(peersArray, ", ");

                                ipoStartDateTextView.setText(ipoStartDate);
                                industryTextView.setText(industry);
                                webpageTextView.setText(webpage);
                                SpannableString spannableString = new SpannableString(webpage);

                                spannableString.setSpan(new UnderlineSpan(), 0, webpage.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

                                webpageTextView.setText(spannableString);

                                for (int i = 0; i < peersArray.length(); i++) {
                                    String stockName = peersArray.getString(i); // Get the string at each index

                                    // Create a TextView for each stock name
                                    TextView textView = new TextView(DetailActivity.this);
                                    textView.setText(stockName);
                                    textView.setTextSize(16f);
                                    textView.setTextColor(Color.parseColor("#0000FF"));
                                    textView.setClickable(true);

                                    SpannableString stockSpannableString = new SpannableString(stockName);
                                    stockSpannableString.setSpan(new UnderlineSpan(), 0, stockName.length(), Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                                    textView.setText(stockSpannableString);
                                    textView.setOnClickListener(new View.OnClickListener() {
                                        @Override
                                        public void onClick(View v) {
                                            // Handle the click event
                                            Intent intent = new Intent(DetailActivity.this, DetailActivity.class);
                                            intent.putExtra("SYMBOL",stockName);
                                            startActivity(intent);
                                        }});

                                    LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                                            LinearLayout.LayoutParams.WRAP_CONTENT,
                                            LinearLayout.LayoutParams.WRAP_CONTENT);
                                    layoutParams.setMarginEnd(10);
                                    textView.setLayoutParams(layoutParams);

                                    // Add the TextView to the LinearLayout
                                    linearLayout.addView(textView);
                                }
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }
        });
    }

    private void fetchInsightsData(String symbol) {
        String url = "https://stock-node-server.wl.r.appspot.com/stock/insider-sentiment?item=" + symbol + "&from=2022-01-01&to=2024-05-02";

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                } else {
                    final String responseData = response.body().string();
                    DetailActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                JSONObject jsonObject = new JSONObject(responseData);
                                JSONArray dataArray = jsonObject.getJSONArray("data");
                                int totalMSRP = 0;
                                int totalChange = 0;
                                int positiveMSRP = 0;
                                int negativeMSRP = 0;
                                int positiveChange = 0;
                                int negativeChange= 0;

                                for (int i = 0; i < dataArray.length(); i++) {
                                    JSONObject item = dataArray.getJSONObject(i);
                                    int msrp = item.getInt("mspr");
                                    int change = item.getInt("change");
                                    totalMSRP += msrp;
                                    totalChange += change;

                                    if (msrp > 0) {
                                        positiveMSRP += msrp;
                                    } else {
                                        negativeMSRP += msrp;
                                    }
                                    if (change > 0) {
                                        positiveChange += change;
                                    } else {
                                        negativeChange += change;
                                    }
                                }

                                totalMSRPTV.setText(String.valueOf(totalMSRP));
                                totalChangeTV.setText(String.valueOf(totalChange));
                                positiveMSRPTV.setText(String.valueOf(positiveMSRP));
                                negativeMSRPTV.setText(String.valueOf(negativeMSRP));
                                positiveChangeTV.setText(String.valueOf(positiveChange));
                                negativeChangeTV.setText(String.valueOf(negativeChange));
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }
        });
    }

    private String joinJSONArray(JSONArray jsonArray, String delimiter) {
        if (jsonArray == null) return "";
        List<String> list = new ArrayList<>();
        for (int i = 0; i < jsonArray.length(); i++) {
            list.add(jsonArray.optString(i));
        }
        return TextUtils.join(delimiter, list);
    }

    @Override
    public boolean onSupportNavigateUp() {
        onBackPressed();
        return true;
    }

    @Override
    public void onItemClick(int position) {
        showPopup(newsArticles.get(position).getSource(), newsArticles.get(position).getDateTime(), newsArticles.get(position).getHeadline(), newsArticles.get(position).getSummary(), newsArticles.get(position).getURL());
    }
}
