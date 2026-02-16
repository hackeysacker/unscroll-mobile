import SwiftUI
import Combine
import ARKit

// MARK: - Face Tracking View Model
/// Observable view model that wraps either ARKit or Vision face tracking
@MainActor
class FaceTrackingViewModel: ObservableObject {

    // MARK: - Published Properties
    @Published var isFacePresent: Bool = false
    @Published var faceBoundingBox: CGRect = .zero
    @Published var faceCenterNormalized: CGPoint = CGPoint(x: 0.5, y: 0.5)
    @Published var faceDistanceEstimate: Float = 0.0
    @Published var gazeDirection: GazeDirection = .unknown
    @Published var attentionScore: Float = 0.0
    @Published var permissionStatus: FaceTrackingManager.PermissionStatus = .notDetermined
    @Published var isTracking: Bool = false
    @Published var trackingMode: TrackingMode = .none

    enum TrackingMode: String {
        case arkit = "arkit"      // TrueDepth camera (iPhone X+)
        case vision = "vision"    // Vision framework fallback
        case none = "none"        // Not tracking
    }

    // MARK: - Private Properties
    private var arkitManager: FaceTrackingManager?
    private var visionManager: VisionFaceTrackingManager?
    private var cancellables = Set<AnyCancellable>()

    // Check if ARKit face tracking is supported
    static var isARKitSupported: Bool {
        return ARFaceTrackingConfiguration.isSupported
    }

    // MARK: - Initialization
    init() {
        setupNotifications()
    }

    private func setupARKitBindings() {
        guard let manager = arkitManager else { return }

        manager.$isFacePresent
            .receive(on: DispatchQueue.main)
            .assign(to: &$isFacePresent)

        manager.$faceBoundingBox
            .receive(on: DispatchQueue.main)
            .assign(to: &$faceBoundingBox)

        manager.$faceCenterNormalized
            .receive(on: DispatchQueue.main)
            .assign(to: &$faceCenterNormalized)

        manager.$faceDistanceEstimate
            .receive(on: DispatchQueue.main)
            .assign(to: &$faceDistanceEstimate)

        manager.$gazeDirection
            .receive(on: DispatchQueue.main)
            .assign(to: &$gazeDirection)

        manager.$attentionScore
            .receive(on: DispatchQueue.main)
            .assign(to: &$attentionScore)

        manager.$permissionStatus
            .receive(on: DispatchQueue.main)
            .assign(to: &$permissionStatus)
    }

    private func setupVisionBindings() {
        guard let manager = visionManager else { return }

        manager.$isFacePresent
            .receive(on: DispatchQueue.main)
            .assign(to: &$isFacePresent)

        manager.$faceBoundingBox
            .receive(on: DispatchQueue.main)
            .assign(to: &$faceBoundingBox)

        manager.$faceCenterNormalized
            .receive(on: DispatchQueue.main)
            .assign(to: &$faceCenterNormalized)

        manager.$faceDistanceEstimate
            .receive(on: DispatchQueue.main)
            .assign(to: &$faceDistanceEstimate)

        manager.$gazeDirection
            .receive(on: DispatchQueue.main)
            .assign(to: &$gazeDirection)

        manager.$attentionScore
            .receive(on: DispatchQueue.main)
            .assign(to: &$attentionScore)

        // Map Vision permission status to ARKit enum
        manager.$permissionStatus
            .receive(on: DispatchQueue.main)
            .map { status -> FaceTrackingManager.PermissionStatus in
                switch status {
                case .authorized: return .authorized
                case .denied: return .denied
                case .restricted: return .restricted
                case .notDetermined: return .notDetermined
                }
            }
            .assign(to: &$permissionStatus)
    }

    private func setupNotifications() {
        NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)
            .sink { [weak self] _ in
                self?.handleAppDidEnterBackground()
            }
            .store(in: &cancellables)

        NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)
            .sink { [weak self] _ in
                self?.handleAppWillEnterForeground()
            }
            .store(in: &cancellables)
    }

    private func handleAppDidEnterBackground() {
        arkitManager?.handleAppDidEnterBackground()
        visionManager?.handleAppDidEnterBackground()
    }

    private func handleAppWillEnterForeground() {
        arkitManager?.handleAppWillEnterForeground()
        visionManager?.handleAppWillEnterForeground()
    }

    // MARK: - Public Methods
    func requestPermission() async -> Bool {
        // Initialize the appropriate manager based on device support
        if Self.isARKitSupported {
            arkitManager = FaceTrackingManager()
            setupARKitBindings()
            return await arkitManager!.requestPermission()
        } else {
            visionManager = VisionFaceTrackingManager()
            setupVisionBindings()
            return await visionManager!.requestPermission()
        }
    }

    func startTracking() {
        if Self.isARKitSupported {
            if arkitManager == nil {
                arkitManager = FaceTrackingManager()
                setupARKitBindings()
            }
            arkitManager?.startTracking()
            trackingMode = .arkit
        } else {
            if visionManager == nil {
                visionManager = VisionFaceTrackingManager()
                setupVisionBindings()
            }
            visionManager?.startTracking()
            trackingMode = .vision
        }
        isTracking = true
    }

    func stopTracking() {
        arkitManager?.stopTracking()
        visionManager?.stopTracking()
        isTracking = false
        trackingMode = .none
    }

    // MARK: - Computed Properties
    var gazeDirectionString: String {
        gazeDirection.rawValue
    }

    var attentionPercentage: Int {
        Int(attentionScore * 100)
    }

    var faceDistanceDescription: String {
        if faceDistanceEstimate < 0.3 {
            return "Too close"
        } else if faceDistanceEstimate > 0.8 {
            return "Too far"
        } else {
            return "Good distance"
        }
    }

    var trackingModeDescription: String {
        switch trackingMode {
        case .arkit:
            return "TrueDepth Camera"
        case .vision:
            return "Standard Camera"
        case .none:
            return "Not tracking"
        }
    }
}
