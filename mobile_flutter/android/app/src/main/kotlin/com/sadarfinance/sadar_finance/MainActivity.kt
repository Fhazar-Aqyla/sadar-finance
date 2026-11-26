package com.sadarfinance.sadar_finance

import android.Manifest
import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.Looper
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterFragmentActivity() {
    private val locationChannelName = "com.sadarfinance.sadar_finance/location"
    private val notificationChannelName = "com.sadarfinance.sadar_finance/notifications"
    private val pushChannelId = "sadar_finance_push_v3_high"
    private val locationPermissionRequestCode = 7401
    private val notifPermissionRequestCode = 7402
    private var pendingLocationResult: MethodChannel.Result? = null
    private val pendingNotifResults = mutableListOf<MethodChannel.Result>()
    private var queuedNotification: Triple<Int, String, String>? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        ensureNotificationChannel()

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, locationChannelName)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "getCurrentLocation" -> {
                        if (hasLocationPermission()) {
                            fetchCurrentCoordinates(result)
                        } else {
                            pendingLocationResult = result
                            ActivityCompat.requestPermissions(
                                this,
                                arrayOf(
                                    Manifest.permission.ACCESS_FINE_LOCATION,
                                    Manifest.permission.ACCESS_COARSE_LOCATION
                                ),
                                locationPermissionRequestCode
                            )
                        }
                    }
                    else -> result.notImplemented()
                }
            }

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, notificationChannelName)
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "requestPermission" -> {
                        ensureNotificationChannel()
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            val granted = ContextCompat.checkSelfPermission(
                                this,
                                Manifest.permission.POST_NOTIFICATIONS
                            ) == PackageManager.PERMISSION_GRANTED
                            if (granted) {
                                result.success(true)
                            } else {
                                val shouldAsk = pendingNotifResults.isEmpty()
                                pendingNotifResults.add(result)
                                if (shouldAsk) {
                                    ActivityCompat.requestPermissions(
                                        this,
                                        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                                        notifPermissionRequestCode
                                    )
                                }
                            }
                        } else {
                            result.success(true)
                        }
                    }
                    "showNotification" -> {
                        val id = (call.argument<Number>("id") ?: 1001).toInt()
                        val title = call.argument<String>("title") ?: "SADAR Finance"
                        val body = call.argument<String>("body") ?: ""
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            val granted = ContextCompat.checkSelfPermission(
                                this,
                                Manifest.permission.POST_NOTIFICATIONS
                            ) == PackageManager.PERMISSION_GRANTED
                            if (!granted) {
                                queuedNotification = Triple(id, title, body)
                                val shouldAsk = pendingNotifResults.isEmpty()
                                pendingNotifResults.add(result)
                                if (shouldAsk) {
                                    ActivityCompat.requestPermissions(
                                        this,
                                        arrayOf(Manifest.permission.POST_NOTIFICATIONS),
                                        notifPermissionRequestCode
                                    )
                                }
                                return@setMethodCallHandler
                            }
                        }
                        val shown = showNativePushNotification(id, title, body)
                        result.success(shown)
                    }
                    else -> result.notImplemented()
                }
            }
    }

    private fun ensureNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val channel = NotificationChannel(
                pushChannelId,
                "Notifikasi & Peringatan SADAR Finance",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Peringatan anggaran 50/30/20, tagihan rutin, piutang, dan pengumuman resmi SADAR Finance"
                enableVibration(true)
                enableLights(true)
            }
            manager.createNotificationChannel(channel)
        }
    }

    @SuppressLint("MissingPermission")
    private fun showNativePushNotification(id: Int, title: String, body: String): Boolean {
        return try {
            ensureNotificationChannel()
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val granted = ContextCompat.checkSelfPermission(
                    this,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
                if (!granted) return false
            }

            val launchIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getActivity(this, id, launchIntent, pendingFlags)

            val smallIconRes = if (applicationInfo.icon != 0) {
                applicationInfo.icon
            } else {
                android.R.drawable.ic_dialog_info
            }

            val notification = NotificationCompat.Builder(this, pushChannelId)
                .setSmallIcon(smallIconRes)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .build()

            NotificationManagerCompat.from(this).notify(id, notification)
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun hasLocationPermission(): Boolean {
        val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
        return fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == locationPermissionRequestCode) {
            val res = pendingLocationResult
            pendingLocationResult = null
            if (res != null) {
                if (hasLocationPermission()) {
                    fetchCurrentCoordinates(res)
                } else {
                    res.error("PERMISSION_DENIED", "Izin lokasi GPS tidak diberikan.", null)
                }
            }
        } else if (requestCode == notifPermissionRequestCode) {
            val granted = grantResults.isNotEmpty() &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED
            if (granted && queuedNotification != null) {
                val q = queuedNotification!!
                queuedNotification = null
                showNativePushNotification(q.first, q.second, q.third)
            } else {
                queuedNotification = null
            }
            val callbacks = pendingNotifResults.toList()
            pendingNotifResults.clear()
            for (cb in callbacks) {
                try {
                    cb.success(granted)
                } catch (_: Exception) {}
            }
        }
    }

    @SuppressLint("MissingPermission")
    private fun fetchCurrentCoordinates(result: MethodChannel.Result) {
        try {
            val lm = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val providers = listOf(
                LocationManager.GPS_PROVIDER,
                LocationManager.NETWORK_PROVIDER,
                LocationManager.PASSIVE_PROVIDER
            )
            var bestLocation: Location? = null
            for (p in providers) {
                if (lm.isProviderEnabled(p)) {
                    val loc = lm.getLastKnownLocation(p)
                    if (loc != null) {
                        if (bestLocation == null || loc.accuracy < bestLocation!!.accuracy) {
                            bestLocation = loc
                        }
                    }
                }
            }
            if (bestLocation != null) {
                result.success(
                    mapOf(
                        "lat" to bestLocation!!.latitude,
                        "lon" to bestLocation!!.longitude
                    )
                )
                return
            }

            val activeProvider = when {
                lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER) -> LocationManager.NETWORK_PROVIDER
                lm.isProviderEnabled(LocationManager.GPS_PROVIDER) -> LocationManager.GPS_PROVIDER
                else -> null
            }
            if (activeProvider == null) {
                result.error("GPS_DISABLED", "Layanan Lokasi/GPS belum aktif di perangkat Anda.", null)
                return
            }

            var replied = false
            val listener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    if (!replied) {
                        replied = true
                        lm.removeUpdates(this)
                        result.success(
                            mapOf(
                                "lat" to location.latitude,
                                "lon" to location.longitude
                            )
                        )
                    }
                }
                @Deprecated("Deprecated in Java")
                override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {}
            }
            lm.requestSingleUpdate(activeProvider, listener, Looper.getMainLooper())
        } catch (e: Exception) {
            result.error("LOCATION_ERROR", e.message ?: "Gagal membaca koordinat GPS.", null)
        }
    }
}
