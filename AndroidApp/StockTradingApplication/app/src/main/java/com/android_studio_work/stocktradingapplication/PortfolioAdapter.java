package com.android_studio_work.stocktradingapplication;
import android.content.Context;
import android.graphics.Color;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import java.util.List;

public class PortfolioAdapter extends RecyclerView.Adapter<PortfolioAdapter.PortfolioAdapterViewHolder> {
    Context context;
    private List<PortfolioItem> portfolioItems;
    private final PortfolioRecyclerViewInterface portfolioRecyclerViewInterface;

    public PortfolioAdapter(Context context, List<PortfolioItem> portfolioItems, PortfolioRecyclerViewInterface portfolioRecyclerViewInterface) {
        this.context = context;
        this.portfolioItems = portfolioItems;
        this.portfolioRecyclerViewInterface = portfolioRecyclerViewInterface;
    }

    @NonNull
    @Override
    public PortfolioAdapterViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(context);
        View view = inflater.inflate(R.layout.list_item_portfolio, parent, false);
        return new PortfolioAdapter.PortfolioAdapterViewHolder(view, portfolioRecyclerViewInterface);
    }

    @Override
    public void onBindViewHolder(@NonNull PortfolioAdapterViewHolder holder, int position) {
        holder.tickerTV.setText(portfolioItems.get(position).getTicker());
        holder.quantityTV.setText(portfolioItems.get(position).getQuantity()+" shares");
        holder.priceTV.setText(portfolioItems.get(position).getMarketValue());
        holder.priceChangeTV.setText(portfolioItems.get(position).getChange());
        holder.pricePercentageTV.setText(portfolioItems.get(position).getPercentChange());
        Log.d("Changevalue", portfolioItems.get(position).getChange().trim());
        if(Double.parseDouble(portfolioItems.get(position).getChange().trim())>0.0d){
            holder.priceChangeTV.setTextColor(Color.parseColor("#40a46c"));
            holder.pricePercentageTV.setTextColor(Color.parseColor("#40a46c"));
            holder.changeIndicatorIV.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.trending_up));
        }
        else if(Double.parseDouble(portfolioItems.get(position).getChange().trim())<0.0d){
            holder.priceChangeTV.setTextColor(Color.RED);
            holder.pricePercentageTV.setTextColor(Color.RED);
            holder.changeIndicatorIV.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.trending_down));
        }
        else{
            holder.priceChangeTV.setTextColor(Color.BLACK);
            holder.pricePercentageTV.setTextColor(Color.BLACK);
            holder.changeIndicatorIV.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.default_white));
        }
    }

    @Override
    public int getItemCount() {
        return portfolioItems.size();
    }

    public static class PortfolioAdapterViewHolder extends RecyclerView.ViewHolder {
        private final TextView tickerTV;
        private final TextView quantityTV;
        private final TextView priceTV;
        private final TextView priceChangeTV;
        private final TextView pricePercentageTV;
        private final ImageView changeIndicatorIV;

        public PortfolioAdapterViewHolder(View itemView, PortfolioRecyclerViewInterface portfolioRecyclerViewInterface) {
            super(itemView);
            tickerTV = itemView.findViewById(R.id.tvTicker);
            quantityTV = itemView.findViewById(R.id.tvQuantity);
            priceTV = itemView.findViewById(R.id.tvPrice);
            priceChangeTV = itemView.findViewById(R.id.tvPriceChangeAmount);
            pricePercentageTV = itemView.findViewById(R.id.tvPriceChangePercentage);
            changeIndicatorIV = itemView.findViewById(R.id.ivChangeIndicator);

            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    portfolioRecyclerViewInterface.onItemClick(getAdapterPosition());
                }
            });
        }
    }
}
