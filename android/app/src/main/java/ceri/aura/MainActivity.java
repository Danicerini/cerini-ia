package ceri.aura;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.DownloadManager;
import android.app.PendingIntent;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInstaller;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.OpenableColumns;
import android.util.Base64;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.URLUtil;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Aura in un guscio Android: l'app web a tutto schermo, più quello che dal browser non si può fare. */
public class MainActivity extends Activity {
    private static final int REQ_FILES = 1;
    private static final int REQ_MIC = 2;
    private static final int MAX_SHARE_BYTES = 25 * 1024 * 1024;

    private WebView web;
    private String home = "";
    private ValueCallback<Uri[]> pendingFiles;
    private PermissionRequest pendingMic;
    private String pendingShare;
    private volatile int readyUpdate = -1;
    private boolean checking;
    private volatile boolean stopped;
    static volatile Intent confirmUpdate;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        web = new WebView(this);
        web.setBackgroundColor(getColor(R.color.fondo));
        setContentView(web, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setup();
        readShare(getIntent());
        if (saved != null) {
            web.restoreState(saved);
        }
        SharedPreferences prefs = getSharedPreferences("aura", MODE_PRIVATE);
        home = prefs.getString("server", BuildConfig.SERVER_URL);
        if (home == null || home.isEmpty()) {
            askServer(prefs);
        } else if (saved == null) {
            web.loadUrl(home);
        }
    }

    /** Se l'APK non ha un indirizzo dentro, lo chiede la prima volta. */
    private void askServer(SharedPreferences prefs) {
        EditText field = new EditText(this);
        field.setHint("https://…");
        new AlertDialog.Builder(this).setTitle("Indirizzo di Aura").setView(field).setCancelable(false)
                .setPositiveButton("Apri", (d, w) -> {
                    String url = field.getText().toString().trim();
                    if (!url.startsWith("https://")) {
                        Toast.makeText(this, "Deve iniziare con https://", Toast.LENGTH_LONG).show();
                        askServer(prefs);
                        return;
                    }
                    home = url;
                    prefs.edit().putString("server", url).apply();
                    web.loadUrl(url);
                }).show();
    }

    private boolean ours(Uri uri) {
        String host = uri.getHost();
        return host != null && host.equalsIgnoreCase(Uri.parse(home).getHost()) && "https".equals(uri.getScheme());
    }

    private void setup() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setAllowFileAccess(false);
        s.setUserAgentString(s.getUserAgentString() + " AuraAndroid/" + BuildConfig.VERSION_CODE);
        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri uri = req.getUrl();
                if (ours(uri)) {
                    return false;
                }
                // tutto il resto (link esterni, mail, telefono) lo apre l'app giusta del telefono: dentro Aura gira solo Aura
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (ActivityNotFoundException e) {
                    Toast.makeText(MainActivity.this, "Nessuna app per aprire questo link", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                deliverShare();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) {
                    view.loadData("<!doctype html><meta name=viewport content='width=device-width'><body style='background:#141518;color:#ddd;font:16px sans-serif;"
                            + "display:grid;place-items:center;height:90vh;text-align:center'><div><p>Non riesco a raggiungere Aura.</p>"
                            + "<p style='color:#999'>Controlla la connessione.</p><button style='font:inherit;padding:10px 20px' onclick='history.back();location.reload()'>Riprova</button></div>",
                            "text/html", "utf-8");
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingFiles != null) {
                    pendingFiles.onReceiveValue(null);
                }
                pendingFiles = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILES);
                } catch (ActivityNotFoundException e) {
                    pendingFiles = null;
                    return false;
                }
                return true;
            }

            // il microfono per dettare e per la voce: solo al sito di Aura, solo se il telefono lo permette
            @Override
            public void onPermissionRequest(PermissionRequest req) {
                boolean audio = false;
                for (String r : req.getResources()) {
                    audio |= PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r);
                }
                if (!audio || !ours(req.getOrigin())) {
                    req.deny();
                } else if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                    req.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                } else {
                    pendingMic = req;
                    requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_MIC);
                }
            }
        });

        web.setDownloadListener((url, agent, disposition, mime, length) -> {
            Uri uri = Uri.parse(url);
            if (!ours(uri)) {
                Toast.makeText(this, "Questo file non si può scaricare da qui", Toast.LENGTH_SHORT).show();
                return;
            }
            String name = URLUtil.guessFileName(url, disposition, mime);
            DownloadManager.Request r = new DownloadManager.Request(uri).setMimeType(mime).setTitle(name)
                    .addRequestHeader("Cookie", CookieManager.getInstance().getCookie(url))
                    .addRequestHeader("User-Agent", agent)
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    .setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, name);
            ((DownloadManager) getSystemService(Context.DOWNLOAD_SERVICE)).enqueue(r);
            Toast.makeText(this, "Scarico " + name, Toast.LENGTH_SHORT).show();
        });
    }

    // ---- Condividi con Aura: testo e file arrivano nella casella della chat, non parte niente da solo
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        readShare(intent);
        deliverShare();
    }

    private void readShare(Intent intent) {
        String action = intent == null ? null : intent.getAction();
        if (!Intent.ACTION_SEND.equals(action) && !Intent.ACTION_SEND_MULTIPLE.equals(action)) {
            return;
        }
        List<Uri> uris = new ArrayList<>();
        ClipData clip = intent.getClipData();
        if (clip != null) {
            for (int i = 0; i < clip.getItemCount(); i++) {
                if (clip.getItemAt(i).getUri() != null) {
                    uris.add(clip.getItemAt(i).getUri());
                }
            }
        }
        Uri single = intent.getParcelableExtra(Intent.EXTRA_STREAM);
        if (uris.isEmpty() && single != null) {
            uris.add(single);
        }
        try {
            JSONArray files = new JSONArray();
            int total = 0;
            for (Uri uri : uris) {
                byte[] data = readAll(uri, MAX_SHARE_BYTES - total);
                if (data == null) {
                    Toast.makeText(this, "File troppo grande: non l'ho aggiunto", Toast.LENGTH_LONG).show();
                    continue;
                }
                total += data.length;
                files.put(new JSONObject().put("name", fileName(uri)).put("type", getContentResolver().getType(uri)).put("b64", Base64.encodeToString(data, Base64.NO_WRAP)));
            }
            pendingShare = new JSONObject().put("text", intent.getStringExtra(Intent.EXTRA_TEXT)).put("files", files).toString();
        } catch (Exception e) {
            Toast.makeText(this, "Non riesco a leggere quello che hai condiviso", Toast.LENGTH_LONG).show();
        }
        intent.setAction(Intent.ACTION_MAIN);   // se l'app si ricrea non riaggiunge la stessa cosa
    }

    private byte[] readAll(Uri uri, int max) throws Exception {
        try (InputStream in = getContentResolver().openInputStream(uri); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            byte[] buf = new byte[65536];
            int n;
            while ((n = in.read(buf)) > 0) {
                out.write(buf, 0, n);
                if (out.size() > max) {
                    return null;
                }
            }
            return out.toByteArray();
        }
    }

    private String fileName(Uri uri) {
        try (Cursor c = getContentResolver().query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (c != null && c.moveToFirst() && !c.isNull(0)) {
                return c.getString(0);
            }
        } catch (Exception ignored) {
        }
        return "file";
    }

    /** evaluateJavascript parla solo con la pagina principale di Aura. */
    private void deliverShare() {
        String url = web.getUrl();
        if (pendingShare == null || url == null || !ours(Uri.parse(url))) {
            return;
        }
        String data = pendingShare;
        web.evaluateJavascript("window.auraShared ? (window.auraShared(" + JSONObject.quote(data) + "), 'ok') : 'no'", r -> {
            if ("\"ok\"".equals(r) && data.equals(pendingShare)) {
                pendingShare = null;
            }
        });
    }

    @Override
    protected void onActivityResult(int request, int result, Intent data) {
        if (request == REQ_FILES && pendingFiles != null) {
            pendingFiles.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result, data));
            pendingFiles = null;
        }
        super.onActivityResult(request, result, data);
    }

    @Override
    public void onRequestPermissionsResult(int request, String[] perms, int[] results) {
        if (request == REQ_MIC && pendingMic != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
                pendingMic.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            } else {
                pendingMic.deny();
            }
            pendingMic = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    // ---- Aggiornamento da solo: l'APK nuovo si scarica in sottofondo e si installa quando esci dall'app, così non ti interrompe mai.
    // Android lo fa senza chiedere niente solo se l'installazione di prima l'ha fatta l'app stessa: la prima volta chiede una conferma.
    @Override
    protected void onResume() {
        super.onResume();
        stopped = false;
        Intent ask = confirmUpdate;
        if (ask != null) {
            confirmUpdate = null;
            ask.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                startActivity(ask);
            } catch (ActivityNotFoundException ignored) {
            }
        }
        checkUpdate();
    }

    @Override
    protected void onStop() {
        super.onStop();
        stopped = true;
        installUpdate();
    }

    private HttpURLConnection open(String path) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(home + path).openConnection();
        c.setConnectTimeout(15000);
        c.setReadTimeout(60000);
        c.setRequestProperty("Cookie", String.valueOf(CookieManager.getInstance().getCookie(home)));
        return c;
    }

    private void checkUpdate() {
        SharedPreferences prefs = getSharedPreferences("aura", MODE_PRIVATE);
        long now = System.currentTimeMillis();
        if (home.isEmpty() || checking || readyUpdate >= 0 || now - prefs.getLong("update_check", 0) < 6 * 3600 * 1000L) {
            return;
        }
        checking = true;
        new Thread(() -> {
            int id = -1;
            PackageInstaller installer = getPackageManager().getPackageInstaller();
            try {
                HttpURLConnection info = open("/api/app/android/info");
                if (info.getResponseCode() != 200) {
                    return;   // non ancora entrato: si riprova alla prossima apertura
                }
                JSONObject d;
                try (InputStream in = info.getInputStream(); ByteArrayOutputStream text = new ByteArrayOutputStream()) {
                    copy(in, text);
                    d = new JSONObject(new String(text.toByteArray(), StandardCharsets.UTF_8));
                }
                prefs.edit().putLong("update_check", now).apply();
                if (!d.optBoolean("available") || d.optInt("version") <= BuildConfig.VERSION_CODE) {
                    return;
                }
                for (PackageInstaller.SessionInfo old : installer.getMySessions()) {
                    installer.abandonSession(old.getSessionId());
                }
                PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
                params.setAppPackageName(getPackageName());
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    params.setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED);
                }
                id = installer.createSession(params);
                HttpURLConnection apk = open("/api/app/android");
                if (apk.getResponseCode() != 200) {
                    throw new IllegalStateException("download");
                }
                try (PackageInstaller.Session session = installer.openSession(id); InputStream in = apk.getInputStream();
                     OutputStream out = session.openWrite("aura.apk", 0, -1)) {
                    copy(in, out);
                    session.fsync(out);
                }
                readyUpdate = id;
                id = -1;
                runOnUiThread(() -> {
                    if (stopped) {   // sei uscito mentre scaricava
                        installUpdate();
                    }
                });
            } catch (Exception e) {
                if (id >= 0) {
                    try {
                        installer.abandonSession(id);
                    } catch (Exception ignored) {
                    }
                }
            } finally {
                checking = false;
            }
        }).start();
    }

    private static void copy(InputStream in, OutputStream out) throws Exception {
        byte[] buf = new byte[65536];
        int n;
        while ((n = in.read(buf)) > 0) {
            out.write(buf, 0, n);
        }
    }

    private void installUpdate() {
        int id = readyUpdate;
        if (id < 0) {
            return;
        }
        readyUpdate = -1;
        try (PackageInstaller.Session session = getPackageManager().getPackageInstaller().openSession(id)) {
            PendingIntent done = PendingIntent.getBroadcast(this, 0, new Intent(this, UpdateReceiver.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);
            session.commit(done.getIntentSender());
        } catch (Exception ignored) {
        }
    }

    @Override
    protected void onPause() {
        CookieManager.getInstance().flush();   // si resta dentro anche dopo aver chiuso l'app
        super.onPause();
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }
}
