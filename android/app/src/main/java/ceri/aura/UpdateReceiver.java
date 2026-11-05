package ceri.aura;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;

/** L'esito dell'aggiornamento. Se Android vuole una conferma, la chiede quando si torna nell'app. */
public class UpdateReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE) == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            MainActivity.confirmUpdate = intent.getParcelableExtra(Intent.EXTRA_INTENT);
        }
    }
}
