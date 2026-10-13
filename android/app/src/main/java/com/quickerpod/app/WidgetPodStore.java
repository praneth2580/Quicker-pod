package com.quickerpod.app;

import android.content.Context;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Saved Tripper pods mirrored from the web layer into app prefs so the
 * home-screen widget can read them without starting the WebView.
 * Contract: prefs {@code quickerpod_widget}, key {@code pods}, JSON array of
 * {@code {"id","name"}} ordered most-recently connected first.
 */
public final class WidgetPodStore {
    static final String PREFS = "quickerpod_widget";
    static final String KEY_PODS = "pods";

    public static final class Pod {
        public final String id;
        public final String name;

        public Pod(String id, String name) {
            this.id = id;
            this.name = name;
        }
    }

    private WidgetPodStore() {}

    public static List<Pod> load(Context context) {
        String raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_PODS, "[]");
        if (raw == null || raw.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            JSONArray arr = new JSONArray(raw);
            ArrayList<Pod> pods = new ArrayList<>(arr.length());
            for (int i = 0; i < arr.length(); i++) {
                JSONObject obj = arr.optJSONObject(i);
                if (obj == null) continue;
                String id = obj.optString("id", "").trim();
                if (id.isEmpty()) continue;
                String name = obj.optString("name", "").trim();
                if (name.isEmpty()) name = "Tripper";
                pods.add(new Pod(id, name));
            }
            return pods;
        } catch (Exception ignored) {
            return Collections.emptyList();
        }
    }
}
