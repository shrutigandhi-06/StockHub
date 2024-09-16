package com.android_studio_work.stocktradingapplication;

import android.os.Bundle;
import androidx.fragment.app.Fragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class FragmentOne extends Fragment {

    private static final String ARG_SYMBOL = "symbol";
    private WebView hourlyChartWebView; // Member variable for the WebView

    public FragmentOne() {
        // Required empty public constructor
    }

    public static FragmentOne newInstance(String symbol) {
        FragmentOne fragment = new FragmentOne();
        Bundle args = new Bundle();
        args.putString(ARG_SYMBOL, symbol);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_one, container, false);
        hourlyChartWebView = view.findViewById(R.id.hourlyChart);
        Bundle args = getArguments();
        if (args != null) {
            String symbol = args.getString(ARG_SYMBOL);
            fetchStockData(symbol); // Call fetchStockData here
        }
        return view;
    }

    private void fetchStockData(String symbol) {
        OkHttpClient client = new OkHttpClient();
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
                    getActivity().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                JSONObject jsonObject = new JSONObject(responseData);
                                String timestamp = jsonObject.getString("t");
                                Double change = Double.parseDouble(jsonObject.getString("d"));
                                String color;
                                if(change>0.0d){
                                    color = "green";
                                }
                                else{
                                    color="red";
                                }
                                fetchHourlyChart(symbol, timestamp, color); // Call fetchHourlyChart with timestamp
                            } catch (Exception e) {
                                e.printStackTrace();
                            }
                        }
                    });
                }
            }
        });
    }

    public void fetchHourlyChart(String item, String timestamp, String color) {
        OkHttpClient client = new OkHttpClient();
        String url = "https://stock-node-server.wl.r.appspot.com/api/historical/" + item + "?timestamp=" + timestamp;

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace(); // Handle the error
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    String hourlyData = response.body().string();
                    try {
                        // Parse the JSON string to a JSONObject
                        JSONObject hourlyDataJson = new JSONObject(hourlyData);

                        // Add a new key-value pair
                        hourlyDataJson.put("color", color); // Add color key with value "green"

                        // Convert the JSONObject back to string if you need to pass it as a string
                        hourlyData = hourlyDataJson.toString();

                        Log.d("HourlyData", hourlyData);

                        if (getActivity() != null) {
                            String finalHourlyData = hourlyData;
                            Log.d("Hello color", finalHourlyData);
                            getActivity().runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    WebSettings rcWebSettings = hourlyChartWebView.getSettings();
                                    rcWebSettings.setJavaScriptEnabled(true);

                                    hourlyChartWebView.setWebViewClient(new WebViewClient() {
                                        @Override
                                        public void onPageFinished(WebView view, String url) {
                                            // Pass recommendation data once the page is finished loading
                                            hourlyChartWebView.evaluateJavascript("make_hourly_chart('" + finalHourlyData + "')", null);
                                        }
                                    });

                                    // Load the HTML file containing the chart
                                    hourlyChartWebView.loadUrl("file:///android_asset/chart.html");
                                }
                            });
                        }
                    } catch (Exception e) {
                        e.printStackTrace(); // Handle potential JSON parsing errors
                    }
                } else {
                    // Handle the response error
                    Log.e("HTTPError", "Server responded with: " + response.code());
                }
            }

        });
    }
}
