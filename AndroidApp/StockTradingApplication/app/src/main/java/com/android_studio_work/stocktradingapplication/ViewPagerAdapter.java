package com.android_studio_work.stocktradingapplication;

import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

public class ViewPagerAdapter extends FragmentStateAdapter {
    private String symbol;

    public ViewPagerAdapter(FragmentActivity fa,String symbol) {
        super(fa);
        this.symbol = symbol;
    }

    @Override
    public Fragment createFragment(int position) {
        // Here you return the Fragment associated with the position
        switch (position) {
            case 0:
                return FragmentOne.newInstance(symbol); // Replace FragmentOne with your actual Fragment class
            case 1:
                return  FragmentTwo.newInstance(symbol); // Replace FragmentTwo with your actual Fragment class
            default:
                return null; // Replace FragmentThree with your actual Fragment class
        }
    }

    @Override
    public int getItemCount() {
        return 2; // the number of tabs
    }
}
