package com.bluestoneapps.godmoments

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    
    // Create notification channel with custom sound for Android 8.0+
    createNotificationChannel()
  }
  
  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(NotificationManager::class.java)
      
      // Set custom notification sound URI
      val soundUri = Uri.parse("android.resource://${packageName}/${R.raw.church_bell}")
      val audioAttributes = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .build()
      
      // Create general notifications channel (default for most notifications)
      val generalChannel = NotificationChannel(
        "general_notifications_channel",
        "General Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "General prayer notifications"
        enableVibration(true)
        setSound(soundUri, audioAttributes)
      }
      notificationManager?.createNotificationChannel(generalChannel)
      
      // Create high importance channel for alerts
      val highImportanceChannel = NotificationChannel(
        "high_importance_channel",
        "Important Alerts",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Urgent prayer alerts"
        enableVibration(true)
        setSound(soundUri, audioAttributes)
      }
      notificationManager?.createNotificationChannel(highImportanceChannel)
      
      // Create chat messages channel
      val chatChannel = NotificationChannel(
        "chat_messages_channel",
        "Messages",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Chat and message notifications"
        enableVibration(true)
        setSound(soundUri, audioAttributes)
      }
      notificationManager?.createNotificationChannel(chatChannel)
    }
  }
}
