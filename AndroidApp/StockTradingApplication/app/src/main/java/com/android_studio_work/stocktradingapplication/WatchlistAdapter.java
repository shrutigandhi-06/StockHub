package com.android_studio_work.stocktradingapplication;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import com.android_studio_work.stocktradingapplication.WatchlistItem;

import java.util.ArrayList;
import java.util.List;

public class WatchlistAdapter extends RecyclerView.Adapter<WatchlistAdapter.WatchlistViewHolder> {
    Context context;
    private List<WatchlistItem> watchlistItems;

    public WatchlistAdapter(Context context, List<WatchlistItem> watchlistItems) {
        this.context = context;
        this.watchlistItems = watchlistItems;
    }

    @NonNull
    @Override
    public WatchlistViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(context);
        View view = inflater.inflate(R.layout.list_item_watchlist, parent, false);
        return new WatchlistAdapter.WatchlistViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull WatchlistViewHolder holder, int position) {
        holder.tickerTV.setText(watchlistItems.get(position).getTicker());
        holder.companyNameTV.setText(watchlistItems.get(position).getCompanyName());
        holder.priceTV.setText(watchlistItems.get(position).getCurrPrice());
        holder.priceChangeAmountTV.setText(watchlistItems.get(position).getChange());
        holder.priceChangePercentageTV.setText(watchlistItems.get(position).getPercentChange());

        if(Double.parseDouble(watchlistItems.get(position).getChange().trim())>0.0d){
            holder.priceChangeAmountTV.setTextColor(Color.parseColor("#40a46c"));
            holder.priceChangePercentageTV.setTextColor(Color.parseColor("#40a46c"));
            holder.changeIndicatorIV.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.trending_up));
        }
        else if(Double.parseDouble(watchlistItems.get(position).getChange().trim())<0.0d){
            holder.priceChangeAmountTV.setTextColor(Color.RED);
            holder.priceChangePercentageTV.setTextColor(Color.RED);
            holder.changeIndicatorIV.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.trending_down));
        }
        else{
            holder.priceChangeAmountTV.setTextColor(Color.BLACK);
            holder.priceChangePercentageTV.setTextColor(Color.BLACK);
            holder.changeIndicatorIV.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.default_white));
        }
    }

    @Override
    public int getItemCount() {
        return watchlistItems.size();
    }

    public static class WatchlistViewHolder extends RecyclerView.ViewHolder {
        private final TextView tickerTV;
        private final TextView companyNameTV;
        private final TextView priceTV;
        private final TextView priceChangeAmountTV;
        private final TextView priceChangePercentageTV;
        private final ImageView changeIndicatorIV;

        public WatchlistViewHolder(View itemView) {
            super(itemView);
            tickerTV = itemView.findViewById(R.id.tvTicker);
            companyNameTV = itemView.findViewById(R.id.tvCompanyName);
            priceTV = itemView.findViewById(R.id.tvPrice);
            priceChangeAmountTV = itemView.findViewById(R.id.tvPriceChangeAmount);
            priceChangePercentageTV = itemView.findViewById(R.id.tvPriceChangePercentage);
            changeIndicatorIV = itemView.findViewById(R.id.ivChangeIndicator);
        }
    }
}
