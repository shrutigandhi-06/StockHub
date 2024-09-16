package com.android_studio_work.stocktradingapplication;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.SearchView;
import androidx.appcompat.widget.Toolbar;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.ItemTouchHelper;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Canvas;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import it.xabaras.android.recyclerview.swipedecorator.RecyclerViewSwipeDecorator;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Calendar;
import java.text.SimpleDateFormat;
import java.util.Locale;

public class MainActivity extends AppCompatActivity implements PortfolioRecyclerViewInterface {

    private SearchView searchView;
    private ListView listView;
    private ArrayAdapter<String> adapter;
    private ArrayList<WatchlistItem> watchlistItems = new ArrayList<>();
    private OkHttpClient client = new OkHttpClient();
    private WatchlistAdapter watchlistAdapter;
    private ArrayList<PortfolioItem> portfolioItems = new ArrayList<>();
    private PortfolioAdapter portfolioAdapter;
    private TextView netWorthTV;
    private TextView cashBalanceTV;
    private ProgressBar progressBar;

    private RelativeLayout mainRelativeLayout;

    private boolean isPortfolioDataFetched = false;
    private boolean isWatchlistDataFetched = false;

    private RecyclerView watchlistRecyclerView;
    private RecyclerView portfolioRecyclerView;
    private boolean isInitialised = true;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mainRelativeLayout = findViewById(R.id.main);
        mainRelativeLayout.setVisibility(View.GONE);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        progressBar = findViewById(R.id.spinner);

        TextView dateTextView = findViewById(R.id.date);
        netWorthTV = findViewById(R.id.netWorthValue);
        cashBalanceTV = findViewById(R.id.cashBalanceValue);
        fetchPortfolio();
        Calendar calendar = Calendar.getInstance();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd MMMM yyyy", Locale.ENGLISH);
        String todayDate = dateFormat.format(calendar.getTime());
        dateTextView.setText(todayDate);

        TextView tvFinnhub = findViewById(R.id.tvFinnhub);
        tvFinnhub.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://finnhub.io/"));
                intent.setPackage("com.android.chrome"); // This will specifically open the Chrome browser
                try {
                    startActivity(intent);
                } catch (ActivityNotFoundException ex) {
                    // Chrome is not installed; fallback to the default browser
                    intent.setPackage(null);
                    startActivity(intent);
                }
            }
        });

        ItemTouchHelper itemTouchHelper = new ItemTouchHelper(simpleCallback);
        ItemTouchHelper itemTouchHelper1 = new ItemTouchHelper(simpleCallback1);

        watchlistRecyclerView = findViewById(R.id.recyclerViewFavourites);

        fetchWatchlistData(() -> {
            watchlistAdapter = new WatchlistAdapter(this, watchlistItems);
            watchlistRecyclerView.setAdapter(watchlistAdapter);
            watchlistRecyclerView.setLayoutManager(new LinearLayoutManager(this));
            itemTouchHelper.attachToRecyclerView(watchlistRecyclerView);
            isWatchlistDataFetched = true;
            checkDataFetched();
        });

        portfolioRecyclerView = findViewById(R.id.recyclerViewPortfolio);

        fetchPortfolioData(() -> {
            portfolioAdapter = new PortfolioAdapter(this, portfolioItems, this);
            portfolioRecyclerView.setAdapter(portfolioAdapter);
            portfolioRecyclerView.setLayoutManager(new LinearLayoutManager(this));
            itemTouchHelper1.attachToRecyclerView(portfolioRecyclerView);
            isPortfolioDataFetched = true;
            checkDataFetched();

        });

//        listView = findViewById(R.id.searchListView); // Make sure you have a ListView in your layout with this ID
//        adapter = new ArrayAdapter(this, android.R.layout.simple_list_item_1);
//        listView.setAdapter(adapter);
//
//        listView.setOnItemClickListener((parent, view, position, id) -> {
//            String symbol = adapter.getItem(position);
//            searchView.setQuery(symbol, false);
//            Intent intent = new Intent(MainActivity.this, DetailActivity.class);
//            intent.putExtra("SYMBOL", symbol.substring(0, symbol.indexOf("|")-1));
//            startActivity(intent);
//        });

    }

    @Override
    protected void onStart() {
        super.onStart();
        if(!isInitialised){
            portfolioItems.clear();
            watchlistItems.clear();
            fetchPortfolio();
            fetchWatchlistData(() -> {
                watchlistAdapter = new WatchlistAdapter(this, watchlistItems);
                watchlistRecyclerView.setAdapter(watchlistAdapter);
                watchlistRecyclerView.setLayoutManager(new LinearLayoutManager(this));
                isWatchlistDataFetched = true;
                checkDataFetched();
            });

            fetchPortfolioData(() -> {
                portfolioAdapter = new PortfolioAdapter(this, portfolioItems, this);
                portfolioRecyclerView.setAdapter(portfolioAdapter);
                portfolioRecyclerView.setLayoutManager(new LinearLayoutManager(this));
                isPortfolioDataFetched = true;
                checkDataFetched();

            });
        }
        isInitialised = false;
    }

    private void checkDataFetched() {
        if (isPortfolioDataFetched && isWatchlistDataFetched) {
            runOnUiThread(() -> {

                final Handler handler = new Handler();
                handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        mainRelativeLayout.setVisibility(View.VISIBLE); // Show the main content
                        progressBar.setVisibility(View.GONE);
                    }
                }, 1000);

            });
        }
    }

    private void fetchPortfolio() {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/portfolio")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                // Handle the error
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    final String responseData = response.body().string();
                    runOnUiThread(() -> {
                        try {
                            JSONObject json = new JSONObject(responseData);
                            double wallet = Double.parseDouble(json.getString("wallet"));
                            double totalCost = 0;
                            JSONArray stocks = json.getJSONArray("stocks");
                            for (int i = 0; i < stocks.length(); i++) {
                                JSONObject stock = stocks.getJSONObject(i);
                                totalCost += Double.parseDouble(stock.getString("totalCost"));
                            }
                            double total = wallet + totalCost;
                            Log.d("CashBalance",String.format("%.2f", total));
                            netWorthTV.setText("$" + String.format("%.2f", total));
                            cashBalanceTV.setText("$" + String.format("%.2f", wallet));
                        } catch (Exception e) {
                            e.printStackTrace();
                            // Handle the JSON parsing error
                        }
                    });
                }
            }
        });
    }

    public void removeFromWatchlist(String symbol) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/watchlist/" + symbol;

        Request request = new Request.Builder()
                .url(url)
                .delete()
                .build();

        client.newCall(request).enqueue(new okhttp3.Callback() {
            @Override
            public void onFailure(okhttp3.Call call, IOException e) {
                e.printStackTrace();
//                Toast.makeText(MainActivity.this, "Failed to remove from watchlist", Toast.LENGTH_SHORT).show();
                Log.e("removeFromWatchlist", "Error removing from watchlist", e);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
//                    Toast.makeText(MainActivity.this, "Successfully removing from watchlist", Toast.LENGTH_SHORT).show();
                } else {
                    Log.e("removeFromWatchlist", "Server responded with error: " + response.code());
                }
            }
        });
    }

    ItemTouchHelper.SimpleCallback simpleCallback1 = new ItemTouchHelper.SimpleCallback(ItemTouchHelper.UP|ItemTouchHelper.DOWN, 0){

        @Override
        public boolean onMove(@NonNull RecyclerView recyclerView, @NonNull RecyclerView.ViewHolder viewHolder, @NonNull RecyclerView.ViewHolder target) {
            int fromPos = viewHolder.getAdapterPosition();
            int toPos= target.getAdapterPosition();
            Collections.swap(portfolioItems, fromPos, toPos);
            portfolioRecyclerView.getAdapter().notifyItemMoved(fromPos, toPos);
            return false;
        }

        @Override
        public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {

        }
    };
    ItemTouchHelper.SimpleCallback simpleCallback = new ItemTouchHelper.SimpleCallback(ItemTouchHelper.UP|ItemTouchHelper.DOWN,  ItemTouchHelper.LEFT) {
        @Override
        public boolean onMove(@NonNull RecyclerView recyclerView, @ NonNull RecyclerView.ViewHolder viewHolder, @NonNull RecyclerView.ViewHolder target) {
            int fromPos = viewHolder.getAdapterPosition();
            int toPos= target.getAdapterPosition();
            Collections.swap(watchlistItems, fromPos, toPos);
            watchlistRecyclerView.getAdapter().notifyItemMoved(fromPos, toPos);
            return false;
        }

        @Override
        public void onSwiped(@NonNull RecyclerView.ViewHolder viewHolder, int direction) {
            int position = viewHolder.getAdapterPosition();
            if(direction == ItemTouchHelper.LEFT){
                String ticker = watchlistItems.get(position).getTicker();
                watchlistItems.remove(position);
                watchlistAdapter.notifyItemRemoved(position);
                removeFromWatchlist(ticker);
            }
        }

        @Override
        public void onChildDraw(@NonNull Canvas c, @NonNull RecyclerView recyclerView, @NonNull RecyclerView.ViewHolder viewHolder, float dX, float dY, int actionState, boolean isCurrentlyActive) {
            new RecyclerViewSwipeDecorator.Builder(c, recyclerView, viewHolder, dX, dY, actionState, isCurrentlyActive)
                    .addSwipeLeftBackgroundColor(ContextCompat.getColor(MainActivity.this, R.color.red))
                    .addSwipeLeftActionIcon(R.drawable.ic_baseline_delete_24)
                    .create()
                    .decorate();
            super.onChildDraw(c, recyclerView, viewHolder, dX, dY, actionState, isCurrentlyActive);
        }
    };

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        MenuItem searchMenuItem = menu.findItem(R.id.action_search);
        searchView = (SearchView) searchMenuItem.getActionView();
        searchView.setQueryHint("Search...");

        AutoCompleteTextView searchAutoComplete = searchView.findViewById(androidx.appcompat.R.id.search_src_text);

        searchView.setOnQueryTextListener(new SearchView.OnQueryTextListener() {
            @Override
            public boolean onQueryTextSubmit(String query) {
                fetchStockData(query, searchAutoComplete);
                return true;
            }

            @Override
            public boolean onQueryTextChange(String query) {
                if (!query.isEmpty()) {
                    fetchStockData(query, searchAutoComplete);

                } else {

                }
                return true;
            }
        });

        searchAutoComplete.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                String selectedItem = (String) parent.getItemAtPosition(position);
                Intent intent = new Intent(MainActivity.this, DetailActivity.class);
                intent.putExtra("SYMBOL", selectedItem.substring(0, selectedItem.indexOf("|")-1));
                startActivity(intent);

         }
});
        return true;
    }

    private void fetchStockData(String query, AutoCompleteTextView search) {


        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/search/" + query)
                .build();
        ArrayAdapter<String> newAdapter = new ArrayAdapter<>(this,
                android.R.layout.simple_dropdown_item_1line);

        client.newCall(request).enqueue(new okhttp3.Callback() {
            @Override
            public void onFailure(okhttp3.Call call, java.io.IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Failed to fetch data", Toast.LENGTH_SHORT).show());
//                showProgressBar(false);
            }

            @Override
            public void onResponse(okhttp3.Call call, Response response) throws java.io.IOException {
                if (!response.isSuccessful()) throw new java.io.IOException("Unexpected code " + response);
                final String responseData = response.body().string();
                try {
                    JSONObject jsonObject = new JSONObject(responseData);
                    JSONArray results = jsonObject.getJSONArray("result");
                    ArrayList<String> displaySymbols = new ArrayList<>();
                    ArrayList<String> companyNames = new ArrayList<>();
                    for (int i = 0; i < results.length(); i++) {
                        JSONObject stock = results.getJSONObject(i);
                        String displaySymbol = stock.getString("displaySymbol");
                        String companyName = stock.getString("description");
                        if (!displaySymbol.contains(".")) {
                            displaySymbols.add(displaySymbol+" | "+companyName);
                        }
                    }
                    runOnUiThread(() -> {
                        newAdapter.addAll(displaySymbols);
                        search.setAdapter(newAdapter);
                        search.showDropDown();
                    });
                } catch (Exception e) {
                    e.printStackTrace();
                    runOnUiThread(() -> Toast.makeText(MainActivity.this, "Error parsing data", Toast.LENGTH_SHORT).show());
//                    showProgressBar(false);
                }
            }
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.action_search) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onBackPressed() {
        if (!searchView.isIconified()) {
            searchView.setQuery("", false);
            searchView.setIconified(true);
            listView.setVisibility(View.GONE); // Optionally hide the ListView
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public void onItemClick(int position) {
        Intent intent = new Intent(MainActivity.this, DetailActivity.class);
        intent.putExtra("SYMBOL", portfolioItems.get(position).getTicker());
        startActivity(intent);
    }

    interface DataFetchListener {
        void onDataFetched();
    }

    private void fetchWatchlistData(DataFetchListener listener) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/watchlist/")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Failed to fetch data", Toast.LENGTH_SHORT).show());
                listener.onDataFetched();
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                }
                else{
                    final String responseData = response.body().string();
                    Log.d("ResponseData", responseData);
                    MainActivity.this.runOnUiThread(new Runnable() {
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

    private void parseJsonData(String responseData) {
        try {
            JSONArray jsonArray = new JSONArray(responseData);
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject jsonItem = jsonArray.getJSONObject(i);
                WatchlistItem item = new WatchlistItem(
                        jsonItem.getString("ticker"),
                        jsonItem.getString("name"),
                         String.format("$%.2f", Double.parseDouble(jsonItem.getString("currPrice"))),
                        jsonItem.getString("change"),
                        "("+String.format("%.2f", Double.parseDouble(jsonItem.getString("percentChange")))+"%)"
                );
                watchlistItems.add(item);
            }

        } catch (JSONException e) {
            e.printStackTrace();
            runOnUiThread(() -> Toast.makeText(MainActivity.this, "Error parsing watchlist data", Toast.LENGTH_SHORT).show());
        }
    }

    interface PortfolioDataFetchListener {
        void onDataFetched();
    }

    private void fetchPortfolioData(PortfolioDataFetchListener listener) {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url("https://stock-node-server.wl.r.appspot.com/api/portfolio")
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> Toast.makeText(MainActivity.this, "Failed to fetch data", Toast.LENGTH_SHORT).show());
                listener.onDataFetched();
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                }
                else{
                    final String responseData = response.body().string();
                    Log.d("ResponseData", responseData);
                    MainActivity.this.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                JSONObject jsonObject = new JSONObject(responseData);
                                JSONArray stocksArray = jsonObject.getJSONArray("stocks");
                                parsePortfolioJsonData(stocksArray);
                                listener.onDataFetched();

                            } catch (JSONException e) {
                                e.printStackTrace();
                                Toast.makeText(MainActivity.this, "Error parsing data", Toast.LENGTH_SHORT).show();
                            }

                        }
                    });
                }

            }
        });
    }

    public interface StockCallback {
        void onStockInfoReceived(String formattedChange, String formattedPercentChange);
        void onError(String message);
    }

    private void fetchStockDetails(String symbol, String quantity, String avgPurchasePrice, StockCallback callback) {
        String url = "https://stock-node-server.wl.r.appspot.com/api/quote/" + symbol;

        Request request = new Request.Builder()
                .url(url)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                runOnUiThread(() -> callback.onError("Failed to fetch stock data for " + symbol));
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    throw new IOException("Unexpected code " + response);
                } else {
                    final String responseData = response.body().string();
                    runOnUiThread(() -> {
                        try {
                            JSONObject jsonObject = new JSONObject(responseData);
                            String currPrice = jsonObject.getString("c");
                            Double c = (Double.parseDouble(currPrice) - Double.parseDouble(avgPurchasePrice)) * Integer.parseInt(quantity);

                            Double tc = Double.parseDouble(avgPurchasePrice) * Integer.parseInt(quantity);
                            Double ctc = Double.parseDouble(currPrice) * Integer.parseInt(quantity);
                            Double pc = ((ctc - tc) / tc) * 100;

                            String formattedChange = String.format("%.2f", c);
                            String formattedPercentChange = String.format("%.2f", pc);
                            callback.onStockInfoReceived(formattedChange, "("+formattedPercentChange+"%)");
                        } catch (JSONException e) {
                            e.printStackTrace();
                            callback.onError("Failed to parse stock data");
                        }
                    });
                }
            }
        });
    }

    private void parsePortfolioJsonData(JSONArray jsonArray) {
        try {
            for (int i = 0; i < jsonArray.length(); i++) {
                JSONObject jsonItem = jsonArray.getJSONObject(i);
                String stockSymbol = jsonItem.getString("stockSymbol");
                String quantity = jsonItem.getString("quantity");
                String averageCost = String.valueOf(Double.parseDouble(jsonItem.getString("totalCost")) / Integer.parseInt(quantity));
                String totalCost ="$"+String.format("%.2f", Double.parseDouble(averageCost)*Integer.parseInt(quantity));

                // Fetch stock details asynchronously
                fetchStockDetails(stockSymbol, quantity, averageCost, new StockCallback() {
                    @Override
                    public void onStockInfoReceived(String formattedChange, String formattedPercentChange) {
                        // Create the PortfolioItem object here after receiving stock info
                        PortfolioItem item = new PortfolioItem(
                                stockSymbol,
                                quantity,
                                totalCost,
                                formattedChange,
                                formattedPercentChange
                        );

                        System.out.println(item.toString());

                        // Add to the list, ensure thread safety if needed
                        synchronized (portfolioItems) {
                            portfolioItems.add(item);
                            portfolioAdapter.notifyDataSetChanged();
                        }
                        System.out.println("Change: " + formattedChange);
                        System.out.println("Percent Change: " + formattedPercentChange);
                    }

                    @Override
                    public void onError(String message) {
                        System.err.println(message);
                        // Handle error in fetching or parsing stock data
                    }
                });
            }

        } catch (JSONException e) {
            e.printStackTrace();
            runOnUiThread(() -> Toast.makeText(MainActivity.this, "Error parsing watchlist data", Toast.LENGTH_SHORT).show());
        }
    }

}
