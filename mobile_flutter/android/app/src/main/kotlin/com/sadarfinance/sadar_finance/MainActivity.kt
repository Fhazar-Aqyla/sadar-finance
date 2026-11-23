package com.sadarfinance.sadar_finance

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.flutter.embedding.android.FlutterFragmentActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterFragmentActivity() {
    private val locationChannelName = "com.sadarfinance.sadar_finance/location"
    private val locationPermissionRequestCode = 7401
    private var pendingLocationResult: MethodChannel.Result? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
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
