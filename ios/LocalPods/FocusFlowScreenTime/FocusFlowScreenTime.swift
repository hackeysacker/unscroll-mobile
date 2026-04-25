import Foundation
import FamilyControls
import ManagedSettings
import DeviceActivity

// Type aliases for React Native promise callbacks
public typealias RCTPromiseResolveBlock = (Any?) -> Void
public typealias RCTPromiseRejectBlock = (String?, String?, Error?) -> Void

@objc(FocusFlowScreenTime)
class FocusFlowScreenTime: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  @objc
  func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      let center = AuthorizationCenter.shared
      
      Task {
        do {
          try await center.requestAuthorization(for: .individual)
          resolve(["status": "authorized"])
        } catch {
          reject("AUTH_ERROR", "Failed to authorize Screen Time: \(error.localizedDescription)", error)
        }
      }
    } else {
      reject("iOS_VERSION_ERROR", "Screen Time API requires iOS 16.0 or newer", nil)
    }
  }
  
  @objc
  func getAuthorizationStatus(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.0, *) {
      let status = AuthorizationCenter.shared.authorizationStatus
      var statusString: String
      
      switch status {
      case .notDetermined:
        statusString = "notDetermined"
      case .approved:
        statusString = "approved"
      case .denied:
        statusString = "denied"
      @unknown default:
        statusString = "unknown"
      }
      
      resolve(["status": statusString])
    } else {
      resolve(["status": "notDetermined"])
    }
  }
  
  @objc
  func getTodayUsage(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Note: Actual usage data requires FamilyControls entitlement
    // This returns a placeholder for the JS layer
    resolve(["minutes": 0, "date": ISO8601DateFormatter().string(from: Date())])
  }
  
  @objc
  func setAppLimit(_ limitMinutes: Int, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Note: Setting app limits requires FamilyControls entitlement and ShieldConfigurationExtension
    // This is a placeholder for the JS layer
    resolve(["success": true, "limit": limitMinutes])
  }
  
  @objc
  func getAppLimit(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // Placeholder - returns current limit or nil
    resolve(["limit": NSNull()])
  }
}