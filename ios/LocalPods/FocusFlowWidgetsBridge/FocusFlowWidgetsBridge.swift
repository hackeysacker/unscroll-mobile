//
//  FocusFlowWidgetsBridge.swift
//  FocusFlowWidgetsBridge
//
//  Native module to write widget data to App Group container
//

import Foundation
import React

@objc(FocusFlowWidgetsBridge)
class FocusFlowWidgetsBridge: NSObject {

  private let appGroupIdentifier = "group.com.focusflow.app"

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func writeWidgetData(_ data: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
      reject("APP_GROUP_ERROR", "Could not access App Group container", nil)
      return
    }

    let fileURL = containerURL.appendingPathComponent("widget_data.json")

    // Convert NSDictionary to JSON data
    guard let jsonData = try? JSONSerialization.data(withJSONObject: data, options: []) else {
      reject("JSON_ERROR", "Could not serialize data to JSON", nil)
      return
    }

    do {
      try jsonData.write(to: fileURL)
      resolve(true)
    } catch {
      reject("WRITE_ERROR", "Could not write widget data: \(error.localizedDescription)", error)
    }
  }

  @objc
  func readWidgetData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupIdentifier) else {
      reject("APP_GROUP_ERROR", "Could not access App Group container", nil)
      return
    }

    let fileURL = containerURL.appendingPathComponent("widget_data.json")

    do {
      let data = try Data(contentsOf: fileURL)
      if let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
        resolve(json)
      } else {
        resolve(nil)
      }
    } catch {
      resolve(nil)
    }
  }
}
