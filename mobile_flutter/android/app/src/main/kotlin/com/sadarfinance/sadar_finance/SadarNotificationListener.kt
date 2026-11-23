package com.sadarfinance.sadar_finance

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class SadarNotificationListener : NotificationListenerService() {
    companion object {
        var onTransactionNotification: ((Map<String, Any>) -> Unit)? = null

        private val SUPPORTED_PACKAGES = mapOf(
            "com.gojek.app" to "gopay",
            "id.dana" to "dana",
            "ovo.id" to "ovo",
            "com.shopee.id" to "shopeepay",
            "id.bmri.livin" to "mandiri",
            "com.bca" to "bca",
            "id.co.seabank.app" to "seabank",
            "com.jago.digitalBanking" to "jago"
        )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        if (sbn == null) return
        val pkg = sbn.packageName ?: return
        val providerId = SUPPORTED_PACKAGES[pkg] ?: return

        val extras = sbn.notification?.extras ?: return
        val title = extras.getCharSequence("android.title")?.toString() ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""
        val combined = "$title $text"

        // Match Indonesian Rupiah amount e.g. "Rp 25.000", "Rp25.000", "IDR 150.000"
        val regex = Regex("""(?:Rp|IDR)\s*([0-9]{1,3}(?:[.,][0-9]{3})+|[0-9]{4,})""", RegexOption.IGNORE_CASE)
        val match = regex.find(combined) ?: return
        val digitsOnly = match.groupValues[1].replace(Regex("[^0-9]"), "")
        val amount = digitsOnly.toDoubleOrNull() ?: return
        if (amount <= 0) return

        val lower = combined.lowercase()
        val isPaymentOrTransfer = lower.contains("berhasil") ||
            lower.contains("pembayaran") ||
            lower.contains("dibayar") ||
            lower.contains("transfer") ||
            lower.contains("top up") ||
            lower.contains("qris") ||
            lower.contains("diterima")
        if (!isPaymentOrTransfer) return

        val isIncome = lower.contains("diterima") ||
            lower.contains("masuk") ||
            lower.contains("top up berhasil") ||
            lower.contains("menerima")

        val payload = mapOf(
            "providerId" to providerId,
            "packageName" to pkg,
            "amount" to amount,
            "title" to (if (title.isNotEmpty()) title else "Transaksi Otomatis"),
            "text" to text,
            "isIncome" to isIncome
        )
        onTransactionNotification?.invoke(payload)
    }
}
