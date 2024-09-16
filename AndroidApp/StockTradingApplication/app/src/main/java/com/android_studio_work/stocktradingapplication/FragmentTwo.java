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

import java.io.IOException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class FragmentTwo extends Fragment {

    private static final String ARG_SYMBOL = "symbol";

    private WebView historicalChartWebView;
    public FragmentTwo() {
        // Required empty public constructor
    }

    public static FragmentTwo newInstance(String symbol) {
        FragmentTwo fragment = new FragmentTwo();
        Bundle args = new Bundle();
        args.putString(ARG_SYMBOL, symbol);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_two, container, false);
        historicalChartWebView = view.findViewById(R.id.historicalChart);
        Bundle args = getArguments();
        if (args != null) {
            String symbol = args.getString(ARG_SYMBOL);
            fetchHistoricalChart(symbol);
        }
        return view;
    }

    public void fetchHistoricalChart(String item) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/polygon/historical/" + item)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace(); // Handle the error
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    String historicalData = response.body().string();
                    Log.d("RecommendationData", historicalData);

                    if (getActivity() != null) { // Check if the fragment is currently attached to an activity
                        getActivity().runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                WebSettings rcWebSettings = historicalChartWebView.getSettings();
                                rcWebSettings.setJavaScriptEnabled(true);

                                historicalChartWebView.setWebViewClient(new WebViewClient() {
                                    @Override
                                    public void onPageFinished(WebView view, String url) {
                                        historicalChartWebView.evaluateJavascript("make_historical_chart('" + historicalData + "')", null);
                                    }
                                });

                                historicalChartWebView.loadUrl("file:///android_asset/chart.html");
                            }
                        });
                    }
                } else {
                    // Handle the response error
                }
            }
        });
    }
}
