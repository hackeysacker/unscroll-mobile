import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity
import React

@objc(FocusShieldModule)
class FocusShieldModule: NSObject {

  private let center = AuthorizationCenter.shared
  private let store = ManagedSettingsStore()

  // MARK: - Authorization

  @objc
  func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    Task {
      do {
        try await center.requestAuthorization(for: .individual)
        DispatchQueue.main.async {
          resolve(["authorized": true])
        }
      } catch {
        DispatchQueue.main.async {
          reject("AUTH_ERROR", "Failed to authorize Screen Time: \(error.localizedDescription)", error)
        }
      }
    }
  }

  @objc
  func checkAuthorizationStatus(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let status = center.authorizationStatus
    let statusString: String

    switch status {
    case .notDetermined:
      statusString = "notDetermined"
    case .denied:
      statusString = "denied"
    case .approved:
      statusString = "approved"
    @unknown default:
      statusString = "unknown"
    }

    resolve(["status": statusString])
  }

  // MARK: - Focus Shield Control

  @objc
  func enableFocusShield(_ config: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard center.authorizationStatus == .approved else {
      reject("NOT_AUTHORIZED", "Screen Time permission not granted", nil)
      return
    }

    do {
      // Parse configuration
      let blockAllApps = config["blockAllApps"] as? Bool ?? false
      let allowedAppBundleIDs = config["allowedApps"] as? [String] ?? []
      let blockedAppBundleIDs = config["blockedApps"] as? [String] ?? []

      if blockAllApps {
        // Block all apps except system and allowed apps
        store.shield.applications = .all(except: Set(allowedAppBundleIDs.map { ApplicationToken(bundleIdentifier: $0) }))
        store.shield.applicationCategories = .all()
        store.shield.webDomains = .all()
      } else if !blockedAppBundleIDs.isEmpty {
        // Block specific apps
        let blockedTokens = Set(blockedAppBundleIDs.map { ApplicationToken(bundleIdentifier: $0) })
        store.shield.applications = .specific(blockedTokens)
      }

      // Configure shield appearance
      store.shield.applicationCategories = ShieldSettings.ActivityCategoryPolicy.all()

      resolve(["success": true])
    } catch {
      reject("SHIELD_ERROR", "Failed to enable Focus Shield: \(error.localizedDescription)", error)
    }
  }

  @objc
  func disableFocusShield(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    do {
      // Clear all shields
      store.shield.applications = nil
      store.shield.applicationCategories = nil
      store.shield.webDomains = nil

      resolve(["success": true])
    } catch {
      reject("SHIELD_ERROR", "Failed to disable Focus Shield: \(error.localizedDescription)", error)
    }
  }

  // MARK: - App Selection

  @objc
  func presentAppPicker(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard center.authorizationStatus == .approved else {
      reject("NOT_AUTHORIZED", "Screen Time permission not granted", nil)
      return
    }

    DispatchQueue.main.async {
      // Present family activity picker
      // Note: This requires SwiftUI integration which we'll handle in the bridge
      resolve(["presented": true])
    }
  }

  // MARK: - Device Activity Monitoring

  @objc
  func scheduleActivityMonitoring(_ config: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard center.authorizationStatus == .approved else {
      reject("NOT_AUTHORIZED", "Screen Time permission not granted", nil)
      return
    }

    do {
      let schedule = DeviceActivitySchedule(
        intervalStart: DateComponents(hour: 0, minute: 0),
        intervalEnd: DateComponents(hour: 23, minute: 59),
        repeats: true
      )

      let activityName = DeviceActivityName("focusShieldActivity")

      try DeviceActivityCenter().startMonitoring(activityName, during: schedule)

      resolve(["success": true, "activityName": "focusShieldActivity"])
    } catch {
      reject("MONITORING_ERROR", "Failed to schedule activity monitoring: \(error.localizedDescription)", error)
    }
  }

  @objc
  func stopActivityMonitoring(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let activityName = DeviceActivityName("focusShieldActivity")
    DeviceActivityCenter().stopMonitoring([activityName])
    resolve(["success": true])
  }

  // MARK: - React Native Bridge Setup

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
