package com.quickerpod.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.res.Configuration;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.View;
import android.widget.RemoteViews;
import com.quickerpod.tripperble.RideKeepAliveService;
import java.util.List;

/**
 * Resizable home-screen grid of saved Tripper pods. Column and row counts follow
 * the current widget span (up to 5×4). Tap a pod to connect it without opening the app.
 */
public class RideConnectWidgetProvider extends AppWidgetProvider {
    static final int MAX_COLS = 5;
    static final int MAX_ROWS = 4;

    private static final int[] ROW_IDS = {
        R.id.pod_row_0,
        R.id.pod_row_1,
        R.id.pod_row_2,
        R.id.pod_row_3,
    };

    private static final int[] POD_IDS = {
        R.id.pod_0, R.id.pod_1, R.id.pod_2, R.id.pod_3, R.id.pod_4,
        R.id.pod_5, R.id.pod_6, R.id.pod_7, R.id.pod_8, R.id.pod_9,
        R.id.pod_10, R.id.pod_11, R.id.pod_12, R.id.pod_13, R.id.pod_14,
        R.id.pod_15, R.id.pod_16, R.id.pod_17, R.id.pod_18, R.id.pod_19,
    };

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(
        Context context,
        AppWidgetManager appWidgetManager,
        int appWidgetId,
        Bundle newOptions
    ) {
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    static void updateWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_ride_connect);
        Bundle options = manager.getAppWidgetOptions(appWidgetId);
        int widthDp = spanDp(context, options, true);
        int heightDp = spanDp(context, options, false);
        List<WidgetPodStore.Pod> pods = WidgetPodStore.load(context);
        GridPlan plan = plan(widthDp, heightDp, pods.size());

        if (plan.shown == 0) {
            views.setViewVisibility(R.id.widget_grid, View.GONE);
            views.setViewVisibility(R.id.widget_empty, View.VISIBLE);
            int emptySp = Math.min(widthDp, heightDp) >= 90 ? 16 : 12;
            views.setTextViewTextSize(R.id.widget_empty, TypedValue.COMPLEX_UNIT_SP, emptySp);
            PendingIntent open = openAppPending(context, appWidgetId * 64 + 31);
            views.setOnClickPendingIntent(R.id.widget_empty, open);
            views.setOnClickPendingIntent(R.id.widget_root, open);
        } else {
            views.setViewVisibility(R.id.widget_grid, View.VISIBLE);
            views.setViewVisibility(R.id.widget_empty, View.GONE);
            bindGrid(context, views, appWidgetId, pods, plan);
        }

        manager.updateAppWidget(appWidgetId, views);
    }

    private static void bindGrid(
        Context context,
        RemoteViews views,
        int appWidgetId,
        List<WidgetPodStore.Pod> pods,
        GridPlan plan
    ) {
        for (int row = 0; row < MAX_ROWS; row++) {
            views.setViewVisibility(ROW_IDS[row], row < plan.rows ? View.VISIBLE : View.GONE);
            for (int col = 0; col < MAX_COLS; col++) {
                int slot = row * MAX_COLS + col;
                int viewId = POD_IDS[slot];
                if (row >= plan.rows || col >= plan.cols) {
                    views.setViewVisibility(viewId, View.GONE);
                    continue;
                }
                int podIndex = row * plan.cols + col;
                if (podIndex >= plan.shown) {
                    views.setViewVisibility(viewId, View.INVISIBLE);
                    continue;
                }
                WidgetPodStore.Pod pod = pods.get(podIndex);
                views.setViewVisibility(viewId, View.VISIBLE);
                views.setTextViewText(viewId, pod.name);
                views.setTextViewTextSize(viewId, TypedValue.COMPLEX_UNIT_SP, plan.textSp);
                views.setInt(viewId, "setMaxLines", plan.maxLines);
                views.setContentDescription(viewId, pod.name);
                views.setOnClickPendingIntent(
                    viewId,
                    connectPending(context, appWidgetId, slot, pod.id, pod.name)
                );
            }
        }
    }

    private static PendingIntent openAppPending(Context context, int requestCode) {
        Intent launch = new Intent(context, MainActivity.class);
        launch.setAction(Intent.ACTION_VIEW);
        launch.setData(Uri.parse("quickerpod://ride"));
        launch.putExtra("quickerpod_action", "reconnect");
        launch.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK
                | Intent.FLAG_ACTIVITY_CLEAR_TOP
                | Intent.FLAG_ACTIVITY_SINGLE_TOP
        );
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getActivity(context, requestCode, launch, flags);
    }

    /** Starts the ride service and connects this pod. Does not bring the activity forward. */
    private static PendingIntent connectPending(
        Context context,
        int appWidgetId,
        int slot,
        String deviceId,
        String deviceName
    ) {
        Intent connect = new Intent(context, RideKeepAliveService.class);
        connect.setAction(RideKeepAliveService.ACTION_CONNECT);
        connect.putExtra(RideKeepAliveService.EXTRA_ADDRESS, deviceId);
        connect.putExtra(RideKeepAliveService.EXTRA_DEVICE_NAME, deviceName);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        int requestCode = appWidgetId * 64 + slot;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            return PendingIntent.getForegroundService(context, requestCode, connect, flags);
        }
        return PendingIntent.getService(context, requestCode, connect, flags);
    }

    /** Portrait uses min width / max height; landscape uses the swapped bounds. */
    static int spanDp(Context context, Bundle options, boolean width) {
        boolean landscape = context.getResources().getConfiguration().orientation
            == Configuration.ORIENTATION_LANDSCAPE;
        String key;
        if (width) {
            key = landscape
                ? AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH
                : AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH;
        } else {
            key = landscape
                ? AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT
                : AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT;
        }
        int value = options == null ? 0 : options.getInt(key, 0);
        if (value <= 0 && options != null) {
            value = options.getInt(
                width
                    ? AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH
                    : AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT,
                0
            );
        }
        return value > 0 ? value : 110;
    }

    /**
     * How many home-screen cells a span covers.
     * Cell n is about {@code 70n - 30} dp; rounding picks the nearest cell.
     */
    static int cellsForSize(int sizeDp) {
        if (sizeDp <= 0) return 1;
        return Math.max(1, (sizeDp + 65) / 70);
    }

    static GridPlan plan(int widthDp, int heightDp, int podCount) {
        int maxCols = Math.min(MAX_COLS, cellsForSize(widthDp));
        int maxRows = Math.min(MAX_ROWS, cellsForSize(heightDp));
        maxCols = Math.min(maxCols, Math.max(1, Math.max(widthDp, 1) / 40));
        maxRows = Math.min(maxRows, Math.max(1, Math.max(heightDp, 1) / 40));

        if (podCount <= 0) {
            return new GridPlan(1, 1, 0, 12, 2);
        }

        int shown = Math.min(podCount, maxCols * maxRows);
        int cols = Math.min(maxCols, shown);
        int rows = (int) Math.ceil(shown / (double) cols);
        if (rows > maxRows) {
            cols = maxCols;
            rows = maxRows;
            shown = Math.min(podCount, cols * rows);
        }

        int cellDp = Math.min(widthDp / cols, heightDp / Math.max(1, rows));
        int textSp = 11;
        int maxLines = 2;
        if (cellDp >= 140) {
            textSp = 20;
            maxLines = 3;
        } else if (cellDp >= 90) {
            textSp = 16;
            maxLines = 3;
        } else if (cellDp >= 64) {
            textSp = 13;
        }
        return new GridPlan(cols, rows, shown, textSp, maxLines);
    }

    static final class GridPlan {
        final int cols;
        final int rows;
        final int shown;
        final int textSp;
        final int maxLines;

        GridPlan(int cols, int rows, int shown, int textSp, int maxLines) {
            this.cols = cols;
            this.rows = rows;
            this.shown = shown;
            this.textSp = textSp;
            this.maxLines = maxLines;
        }
    }
}
