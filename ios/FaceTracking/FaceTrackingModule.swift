import Foundation
import React
import ARKit

// MARK: - React Native Bridge Module
/// Exposes face tracking functionality to React Native
@objc(FaceTrackingModule)
class FaceTrackingModule: RCTEventEmitter {

    private var viewModel: FaceTrackingViewModel?
    private var updateTimer: Timer?
    private var hasListeners = false

    override init() {
        super.init()
    }

    @MainActor
    private func getOrCreateViewModel() -> FaceTrackingViewModel {
        if viewModel == nil {
            viewModel = FaceTrackingViewModel()
        }
        return viewModel!
    }

    // MARK: - Module Setup
    override static func moduleName() -> String! {
        return "FaceTrackingModule"
    }

    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["onFaceTrackingUpdate", "onAttentionChange", "onFacePresenceChange"]
    }

    override func startObserving() {
        hasListeners = true
    }

    override func stopObserving() {
        hasListeners = false
    }

    // MARK: - Exported Methods

    @objc
    func requestPermission(_ resolve: @escaping RCTPromiseResolveBlock,
                          rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            let vm = getOrCreateViewModel()
            let granted = await vm.requestPermission()
            resolve(granted)
        }
    }

    @objc
    func startTracking(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            let vm = getOrCreateViewModel()

            if vm.permissionStatus != .authorized {
                reject("PERMISSION_DENIED", "Camera permission not granted", nil)
                return
            }

            vm.startTracking()

            // Start sending updates
            startUpdateTimer()

            resolve([
                "success": true,
                "trackingMode": vm.trackingMode.rawValue
            ])
        }
    }

    @objc
    func stopTracking(_ resolve: @escaping RCTPromiseResolveBlock,
                     rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            viewModel?.stopTracking()
            stopUpdateTimer()
            resolve(true)
        }
    }

    @objc
    func getTrackingData(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            guard let vm = viewModel else {
                resolve(getEmptyData())
                return
            }

            resolve(getTrackingDataDict(from: vm))
        }
    }

    /// Check if any face tracking (ARKit or Vision) is supported
    @objc
    func isSupported(_ resolve: @escaping RCTPromiseResolveBlock,
                    rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            // Face tracking is supported on all iOS devices with a front camera
            // ARKit provides better tracking on TrueDepth devices
            // Vision provides fallback on older devices
            let hasFrontCamera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front) != nil
            resolve(hasFrontCamera)
        }
    }

    /// Check if ARKit TrueDepth face tracking is available (iPhone X+)
    @objc
    func isARKitSupported(_ resolve: @escaping RCTPromiseResolveBlock,
                         rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            let supported = ARFaceTrackingConfiguration.isSupported
            resolve(supported)
        }
    }

    /// Get the current tracking mode being used
    @objc
    func getTrackingMode(_ resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task { @MainActor in
            guard let vm = viewModel else {
                resolve("none")
                return
            }
            resolve(vm.trackingMode.rawValue)
        }
    }

    // MARK: - Timer for Updates

    @MainActor
    private func startUpdateTimer() {
        stopUpdateTimer()

        updateTimer = Timer.scheduledTimer(withTimeInterval: 1.0/15.0, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.sendUpdate()
            }
        }
    }

    private func stopUpdateTimer() {
        updateTimer?.invalidate()
        updateTimer = nil
    }

    @MainActor
    private func sendUpdate() {
        guard hasListeners, let vm = viewModel else { return }

        let data = getTrackingDataDict(from: vm)

        sendEvent(withName: "onFaceTrackingUpdate", body: data)

        // Send specific events for important changes
        if vm.attentionScore > 0.8 || vm.attentionScore < 0.3 {
            sendEvent(withName: "onAttentionChange", body: [
                "attentionScore": vm.attentionScore,
                "isHighAttention": vm.attentionScore > 0.8
            ])
        }
    }

    @MainActor
    private func getTrackingDataDict(from vm: FaceTrackingViewModel) -> [String: Any] {
        return [
            "isFacePresent": vm.isFacePresent,
            "faceCenterX": vm.faceCenterNormalized.x,
            "faceCenterY": vm.faceCenterNormalized.y,
            "faceDistance": vm.faceDistanceEstimate,
            "gazeDirection": vm.gazeDirection.rawValue,
            "attentionScore": vm.attentionScore,
            "isTracking": vm.isTracking,
            "trackingMode": vm.trackingMode.rawValue
        ]
    }

    private func getEmptyData() -> [String: Any] {
        return [
            "isFacePresent": false,
            "faceCenterX": 0.5,
            "faceCenterY": 0.5,
            "faceDistance": 0.0,
            "gazeDirection": "unknown",
            "attentionScore": 0.0,
            "isTracking": false,
            "trackingMode": "none"
        ]
    }
}
