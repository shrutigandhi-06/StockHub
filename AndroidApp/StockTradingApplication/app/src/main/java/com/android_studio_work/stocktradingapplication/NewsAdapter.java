package com.android_studio_work.stocktradingapplication;

import android.content.Context;
import android.os.Build;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;
import com.squareup.picasso.Picasso;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

public class NewsAdapter extends RecyclerView.Adapter<NewsAdapter.NewsViewHolder> {

    Context context;
    private ArrayList<NewsArticle> articles;
    private final NewsRecyclerViewInterface newsRecyclerViewInterface;

    public NewsAdapter(Context context, ArrayList<NewsArticle> articles, NewsRecyclerViewInterface newsRecyclerViewInterface) {
        this.context = context;
        this.articles = articles;
        this.newsRecyclerViewInterface = newsRecyclerViewInterface;
    }

    @Override
    public NewsAdapter.NewsViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        LayoutInflater inflater = LayoutInflater.from(context);
        View view = inflater.inflate(R.layout.item_news, parent, false);
        return new NewsAdapter.NewsViewHolder(view, newsRecyclerViewInterface);
    }

    @Override
    public void onBindViewHolder(NewsViewHolder holder, int position) {
        holder.newsSource.setText(articles.get(position).getSource());
        holder.newsHeadline.setText(articles.get(position).getHeadline());
        holder.newsDateTime.setText(articles.get(position).getDateTime());
        Picasso.get().load(articles.get(position).getImage()).resize(300, 300).into(holder.newsImage);

    }

    @Override
    public int getItemCount() {
        return articles.size();
    }


    public static class NewsViewHolder extends RecyclerView.ViewHolder {
        public ImageView newsImage;
        public TextView newsSource, newsHeadline, newsDateTime;

        public NewsViewHolder(View itemView, NewsRecyclerViewInterface newsRecyclerViewInterface) {
            super(itemView);
            newsImage = itemView.findViewById(R.id.newsImage);
            newsSource = itemView.findViewById(R.id.newsSource);
            newsHeadline = itemView.findViewById(R.id.newsHeadline);
            newsDateTime = itemView.findViewById(R.id.newsDateTime);

            itemView.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if(newsRecyclerViewInterface!=null){
                        int pos = getAdapterPosition();
                        if(pos!= RecyclerView.NO_POSITION){
                            newsRecyclerViewInterface.onItemClick(pos);
                        }
                    }
                }
            });
        }
    }
}
