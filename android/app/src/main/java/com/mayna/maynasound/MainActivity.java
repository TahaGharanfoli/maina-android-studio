package com.mayna.maynasound;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        try {
            // Configure WebView settings for better compatibility
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                
                // Enable JavaScript
                settings.setJavaScriptEnabled(true);
                
                // Enable DOM storage
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                
                // Enable mixed content (HTTP/HTTPS)
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                
                // Enable file access
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);
                
                // Enable geolocation
                settings.setGeolocationEnabled(true);
                
                // Set user agent
                settings.setUserAgentString(settings.getUserAgentString() + " MaynaSound/1.0");

                
                // Set WebViewClient with error handling
                webView.setWebViewClient(new WebViewClient() {
                    @Override
                    public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                        Log.e(TAG, "WebView Error: " + errorCode + " - " + description + " at " + failingUrl);
                        super.onReceivedError(view, errorCode, description, failingUrl);
                    }
                    
                    @Override
                    public boolean shouldOverrideUrlLoading(WebView view, String url) {
                        Log.d(TAG, "Loading URL: " + url);
                        return false; // Let WebView handle the URL
                    }
                });
                
                Log.d(TAG, "WebView configured successfully");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error configuring WebView: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void onBackPressed() {
        WebView webView = getBridge().getWebView();
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
