# Keep Flutter engine & plugins safe under R8
-keep class com.sadarfinance.sadar_finance.** { *; }
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.** { *; }
-keep class io.flutter.util.** { *; }
-keep class io.flutter.view.** { *; }
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn com.google.android.play.core.**

# Keep BiometricPrompt / local_auth & FragmentActivity
-keep class androidx.biometric.** { *; }
-keep class androidx.fragment.** { *; }

# Keep EncryptedSharedPreferences / Tink / Google Crypto
-keep class com.google.crypto.tink.** { *; }
-dontwarn com.google.crypto.tink.**
-dontwarn javax.annotation.**
-dontwarn org.joda.time.**
