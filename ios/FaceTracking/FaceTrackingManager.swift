import Foundation
import ARKit
import Combine

// MARK: - Gaze Direction Enum
enum GazeDirection: String {
    case centered, left, right, up, down, unknown
}

// MARK: - Face Tracking Manager
/// Main class that handles ARKit face tracking session and exposes face metrics
@MainActor
class FaceTrackingManager: NSObject, ObservableObject {

    // MARK: - Published Properties (API)
    @Published var isFacePresent: Bool = false
    @Published var faceBoundingBox: CGRect = .zero
    @Published var faceCenterNormalized: CGPoint = CGPoint(x: 0.5, y: 0.5)
    @Published var faceDistanceEstimate: Float = 0.0
    @Published var gazeDirection: GazeDirection = .unknown
    @Published var attentionScore: Float = 0.0
    @Published var permissionStatus: PermissionStatus = .notDetermined

    enum PermissionStatus {
        case notDetermined, authorized, denied, restricted
    }

    // MARK: - Private Properties
    private var arSession: ARSession?
    private var isTracking = false

    // For attention score calculation
    private var recentCenters: [CGPoint] = []
    private let maxRecentCenters = 10
    private var facePresentFrames = 0
    private let attentionDecay: Float = 0.95

    // Screen dimensions for coordinate conversion
    private var screenSize: CGSize = UIScreen.main.bounds.size

    // MARK: - Initialization
    override init() {
        super.init()
        checkPermissions()
    }

    // MARK: - Permission Handling
    private func checkPermissions() {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        switch status {
        case .authorized:
            permissionStatus = .authorized
        case .notDetermined:
            permissionStatus = .notDetermined
        case .denied:
            permissionStatus = .denied
        case .restricted:
            permissionStatus = .restricted
        @unknown default:
            permissionStatus = .notDetermined
        }
    }

    func requestPermission() async -> Bool {
        let granted = await AVCaptureDevice.requestAccess(for: .video)
        await MainActor.run {
            permissionStatus = granted ? .authorized : .denied
        }
        return granted
    }

    // MARK: - Session Control
    func startTracking() {
        guard ARFaceTrackingConfiguration.isSupported else {
            print("Face tracking not supported on this device")
            return
        }

        guard permissionStatus == .authorized else {
            print("Camera permission not granted")
            return
        }

        if arSession == nil {
            arSession = ARSession()
            arSession?.delegate = self
        }

        let configuration = ARFaceTrackingConfiguration()
        configuration.isLightEstimationEnabled = false // Save performance
        configuration.maximumNumberOfTrackedFaces = 1

        arSession?.run(configuration, options: [.resetTracking, .removeExistingAnchors])
        isTracking = true
    }

    func stopTracking() {
        arSession?.pause()
        isTracking = false
        resetState()
    }

    private func resetState() {
        isFacePresent = false
        faceBoundingBox = .zero
        faceCenterNormalized = CGPoint(x: 0.5, y: 0.5)
        faceDistanceEstimate = 0.0
        gazeDirection = .unknown
        attentionScore = 0.0
        recentCenters.removeAll()
        facePresentFrames = 0
    }

    // MARK: - Background/Foreground Handling
    func handleAppDidEnterBackground() {
        if isTracking {
            arSession?.pause()
        }
    }

    func handleAppWillEnterForeground() {
        if isTracking {
            startTracking()
        }
    }

    // MARK: - Attention Score Calculation
    private func calculateAttentionScore() {
        guard isFacePresent else {
            attentionScore = max(0, attentionScore * attentionDecay)
            return
        }

        // Factor 1: How centered is the face (0-1)
        let centerX = faceCenterNormalized.x
        let centerY = faceCenterNormalized.y
        let distanceFromCenter = sqrt(pow(centerX - 0.5, 2) + pow(centerY - 0.5, 2))
        let centerScore = Float(max(0, 1 - distanceFromCenter * 2))

        // Factor 2: How stable is the face position (0-1)
        var stabilityScore: Float = 1.0
        if recentCenters.count >= 2 {
            var totalMovement: CGFloat = 0
            for i in 1..<recentCenters.count {
                let dx = recentCenters[i].x - recentCenters[i-1].x
                let dy = recentCenters[i].y - recentCenters[i-1].y
                totalMovement += sqrt(dx*dx + dy*dy)
            }
            let avgMovement = totalMovement / CGFloat(recentCenters.count - 1)
            stabilityScore = Float(max(0, 1 - avgMovement * 10))
        }

        // Factor 3: Face presence duration bonus
        let presenceBonus = min(1.0, Float(facePresentFrames) / 30.0) * 0.1

        // Factor 4: Gaze direction bonus
        let gazeBonus: Float = gazeDirection == .centered ? 0.15 : 0.0

        // Combine factors
        let rawScore = (centerScore * 0.4 + stabilityScore * 0.35) + presenceBonus + gazeBonus

        // Smooth the score
        attentionScore = attentionScore * 0.7 + rawScore * 0.3
        attentionScore = min(1.0, max(0.0, attentionScore))
    }

    // MARK: - Gaze Direction Calculation
    private func calculateGazeDirection(from faceAnchor: ARFaceAnchor) {
        // Get look at point from blend shapes
        let leftEyeX = faceAnchor.blendShapes[.eyeLookOutLeft]?.floatValue ?? 0
        let rightEyeX = faceAnchor.blendShapes[.eyeLookOutRight]?.floatValue ?? 0
        let leftEyeUp = faceAnchor.blendShapes[.eyeLookUpLeft]?.floatValue ?? 0
        let leftEyeDown = faceAnchor.blendShapes[.eyeLookDownLeft]?.floatValue ?? 0

        // Horizontal gaze
        let horizontalGaze = rightEyeX - leftEyeX

        // Vertical gaze
        let verticalGaze = leftEyeUp - leftEyeDown

        // Determine direction based on thresholds
        let threshold: Float = 0.15

        if abs(horizontalGaze) < threshold && abs(verticalGaze) < threshold {
            gazeDirection = .centered
        } else if horizontalGaze > threshold {
            gazeDirection = .left
        } else if horizontalGaze < -threshold {
            gazeDirection = .right
        } else if verticalGaze > threshold {
            gazeDirection = .up
        } else if verticalGaze < -threshold {
            gazeDirection = .down
        } else {
            gazeDirection = .unknown
        }
    }
}

// MARK: - ARSessionDelegate
extension FaceTrackingManager: ARSessionDelegate {

    nonisolated func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        Task { @MainActor in
            guard let faceAnchor = anchors.first as? ARFaceAnchor else {
                if isFacePresent {
                    isFacePresent = false
                    facePresentFrames = 0
                }
                calculateAttentionScore()
                return
            }

            // Face is present
            isFacePresent = true
            facePresentFrames += 1

            // Get face transform
            let transform = faceAnchor.transform

            // Calculate face distance (z position from camera)
            faceDistanceEstimate = -transform.columns.3.z

            // Calculate face center in normalized coordinates
            // Project 3D face position to 2D screen coordinates
            let facePosition = SIMD3<Float>(transform.columns.3.x, transform.columns.3.y, transform.columns.3.z)

            // Simple projection (assuming centered camera)
            let normalizedX = CGFloat(0.5 - facePosition.x / (faceDistanceEstimate * 0.5))
            let normalizedY = CGFloat(0.5 - facePosition.y / (faceDistanceEstimate * 0.5))

            faceCenterNormalized = CGPoint(
                x: min(1, max(0, normalizedX)),
                y: min(1, max(0, normalizedY))
            )

            // Update recent centers for stability calculation
            recentCenters.append(faceCenterNormalized)
            if recentCenters.count > maxRecentCenters {
                recentCenters.removeFirst()
            }

            // Calculate bounding box (rough estimate based on distance)
            let boxSize = CGFloat(200 / faceDistanceEstimate)
            let centerX = faceCenterNormalized.x * screenSize.width
            let centerY = faceCenterNormalized.y * screenSize.height
            faceBoundingBox = CGRect(
                x: centerX - boxSize/2,
                y: centerY - boxSize/2,
                width: boxSize,
                height: boxSize
            )

            // Calculate gaze direction
            calculateGazeDirection(from: faceAnchor)

            // Calculate attention score
            calculateAttentionScore()
        }
    }

    nonisolated func session(_ session: ARSession, didFailWithError error: Error) {
        print("AR Session failed: \(error.localizedDescription)")
        Task { @MainActor in
            resetState()
        }
    }

    nonisolated func sessionWasInterrupted(_ session: ARSession) {
        Task { @MainActor in
            isFacePresent = false
        }
    }

    nonisolated func sessionInterruptionEnded(_ session: ARSession) {
        // Session will resume automatically
    }
}
