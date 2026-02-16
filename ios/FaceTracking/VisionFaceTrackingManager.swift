import Foundation
import AVFoundation
import Vision
import UIKit

// MARK: - Vision Face Tracking Manager
/// Fallback face tracking using Vision framework for devices without TrueDepth camera
@MainActor
class VisionFaceTrackingManager: NSObject, ObservableObject {

    // MARK: - Published Properties (API)
    @Published var isFacePresent: Bool = false
    @Published var faceBoundingBox: CGRect = .zero
    @Published var faceCenterNormalized: CGPoint = CGPoint(x: 0.5, y: 0.5)
    @Published var faceDistanceEstimate: Float = 0.5
    @Published var gazeDirection: GazeDirection = .unknown
    @Published var attentionScore: Float = 0.0
    @Published var permissionStatus: PermissionStatus = .notDetermined

    enum PermissionStatus {
        case notDetermined, authorized, denied, restricted
    }

    // MARK: - Private Properties
    private var captureSession: AVCaptureSession?
    private var videoOutput: AVCaptureVideoDataOutput?
    private var isTracking = false
    private let sessionQueue = DispatchQueue(label: "com.focusflow.vision.session")
    private let processingQueue = DispatchQueue(label: "com.focusflow.vision.processing")

    // Face detection request
    private lazy var faceDetectionRequest: VNDetectFaceRectanglesRequest = {
        let request = VNDetectFaceRectanglesRequest { [weak self] request, error in
            self?.handleFaceDetection(request: request, error: error)
        }
        return request
    }()

    // Face landmarks for gaze estimation
    private lazy var faceLandmarksRequest: VNDetectFaceLandmarksRequest = {
        let request = VNDetectFaceLandmarksRequest { [weak self] request, error in
            self?.handleFaceLandmarks(request: request, error: error)
        }
        return request
    }()

    // For attention score calculation
    private var recentCenters: [CGPoint] = []
    private let maxRecentCenters = 10
    private var facePresentFrames = 0
    private let attentionDecay: Float = 0.95
    private var lastFaceBox: CGRect = .zero

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
        guard permissionStatus == .authorized else {
            print("Camera permission not granted")
            return
        }

        sessionQueue.async { [weak self] in
            self?.setupCaptureSession()
        }
    }

    private func setupCaptureSession() {
        if captureSession == nil {
            captureSession = AVCaptureSession()
        }

        guard let session = captureSession else { return }

        session.beginConfiguration()
        session.sessionPreset = .medium

        // Setup input
        guard let frontCamera = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front),
              let input = try? AVCaptureDeviceInput(device: frontCamera) else {
            print("Failed to get front camera")
            session.commitConfiguration()
            return
        }

        if session.canAddInput(input) {
            session.addInput(input)
        }

        // Setup output
        let output = AVCaptureVideoDataOutput()
        output.setSampleBufferDelegate(self, queue: processingQueue)
        output.alwaysDiscardsLateVideoFrames = true
        output.videoSettings = [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA]

        if session.canAddOutput(output) {
            session.addOutput(output)
            videoOutput = output
        }

        session.commitConfiguration()

        // Start running
        session.startRunning()

        Task { @MainActor in
            self.isTracking = true
        }
    }

    func stopTracking() {
        sessionQueue.async { [weak self] in
            self?.captureSession?.stopRunning()
            Task { @MainActor in
                self?.isTracking = false
                self?.resetState()
            }
        }
    }

    private func resetState() {
        isFacePresent = false
        faceBoundingBox = .zero
        faceCenterNormalized = CGPoint(x: 0.5, y: 0.5)
        faceDistanceEstimate = 0.5
        gazeDirection = .unknown
        attentionScore = 0.0
        recentCenters.removeAll()
        facePresentFrames = 0
    }

    // MARK: - Face Detection Handling
    private func handleFaceDetection(request: VNRequest, error: Error?) {
        guard error == nil else {
            print("Face detection error: \(error!.localizedDescription)")
            return
        }

        guard let results = request.results as? [VNFaceObservation],
              let face = results.first else {
            Task { @MainActor in
                if self.isFacePresent {
                    self.isFacePresent = false
                    self.facePresentFrames = 0
                }
                self.calculateAttentionScore()
            }
            return
        }

        Task { @MainActor in
            self.processFaceObservation(face)
        }
    }

    private func handleFaceLandmarks(request: VNRequest, error: Error?) {
        guard error == nil,
              let results = request.results as? [VNFaceObservation],
              let face = results.first,
              let landmarks = face.landmarks else {
            return
        }

        Task { @MainActor in
            self.estimateGazeFromLandmarks(landmarks, faceBox: face.boundingBox)
        }
    }

    @MainActor
    private func processFaceObservation(_ face: VNFaceObservation) {
        isFacePresent = true
        facePresentFrames += 1

        // Convert bounding box (Vision coordinates are bottom-left origin, normalized)
        let box = face.boundingBox
        let screenSize = UIScreen.main.bounds.size

        // Vision y is flipped
        let normalizedX = box.midX
        let normalizedY = 1 - box.midY

        faceCenterNormalized = CGPoint(x: normalizedX, y: normalizedY)

        // Convert to screen coordinates for bounding box
        faceBoundingBox = CGRect(
            x: box.origin.x * screenSize.width,
            y: (1 - box.origin.y - box.height) * screenSize.height,
            width: box.width * screenSize.width,
            height: box.height * screenSize.height
        )

        // Estimate distance based on face size (larger face = closer)
        let faceSize = box.width * box.height
        faceDistanceEstimate = Float(max(0.2, min(1.0, 0.1 / faceSize)))

        // Update recent centers for stability
        recentCenters.append(faceCenterNormalized)
        if recentCenters.count > maxRecentCenters {
            recentCenters.removeFirst()
        }

        lastFaceBox = box

        // Calculate attention
        calculateAttentionScore()
    }

    @MainActor
    private func estimateGazeFromLandmarks(_ landmarks: VNFaceLandmarks2D, faceBox: CGRect) {
        // Get eye positions if available
        guard let leftEye = landmarks.leftEye,
              let rightEye = landmarks.rightEye,
              let nose = landmarks.nose else {
            gazeDirection = .unknown
            return
        }

        // Get normalized eye centers
        let leftEyePoints = leftEye.normalizedPoints
        let rightEyePoints = rightEye.normalizedPoints

        guard !leftEyePoints.isEmpty, !rightEyePoints.isEmpty else {
            gazeDirection = .unknown
            return
        }

        // Calculate eye centers
        let leftEyeCenter = CGPoint(
            x: leftEyePoints.reduce(0) { $0 + $1.x } / CGFloat(leftEyePoints.count),
            y: leftEyePoints.reduce(0) { $0 + $1.y } / CGFloat(leftEyePoints.count)
        )
        let rightEyeCenter = CGPoint(
            x: rightEyePoints.reduce(0) { $0 + $1.x } / CGFloat(rightEyePoints.count),
            y: rightEyePoints.reduce(0) { $0 + $1.y } / CGFloat(rightEyePoints.count)
        )

        // Calculate face center (between eyes)
        let eyesMidpoint = CGPoint(
            x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
            y: (leftEyeCenter.y + rightEyeCenter.y) / 2
        )

        // Get nose tip
        let nosePoints = nose.normalizedPoints
        guard !nosePoints.isEmpty else {
            gazeDirection = .unknown
            return
        }
        let noseTip = nosePoints[nosePoints.count / 2]

        // Estimate gaze based on nose position relative to eye midpoint
        let horizontalOffset = noseTip.x - eyesMidpoint.x
        let verticalOffset = noseTip.y - eyesMidpoint.y

        let threshold: CGFloat = 0.05

        if abs(horizontalOffset) < threshold && abs(verticalOffset) < threshold {
            gazeDirection = .centered
        } else if horizontalOffset > threshold {
            gazeDirection = .right // Flipped for front camera
        } else if horizontalOffset < -threshold {
            gazeDirection = .left
        } else if verticalOffset > threshold {
            gazeDirection = .up
        } else if verticalOffset < -threshold {
            gazeDirection = .down
        } else {
            gazeDirection = .centered // Close enough to center
        }
    }

    // MARK: - Attention Score Calculation
    @MainActor
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

        // Factor 4: Gaze direction bonus (less reliable with Vision, so smaller bonus)
        let gazeBonus: Float = gazeDirection == .centered ? 0.1 : 0.0

        // Combine factors
        let rawScore = (centerScore * 0.45 + stabilityScore * 0.35) + presenceBonus + gazeBonus

        // Smooth the score
        attentionScore = attentionScore * 0.7 + rawScore * 0.3
        attentionScore = min(1.0, max(0.0, attentionScore))
    }

    // MARK: - Background/Foreground Handling
    func handleAppDidEnterBackground() {
        if isTracking {
            sessionQueue.async { [weak self] in
                self?.captureSession?.stopRunning()
            }
        }
    }

    func handleAppWillEnterForeground() {
        if isTracking {
            sessionQueue.async { [weak self] in
                self?.captureSession?.startRunning()
            }
        }
    }
}

// MARK: - AVCaptureVideoDataOutputSampleBufferDelegate
extension VisionFaceTrackingManager: AVCaptureVideoDataOutputSampleBufferDelegate {

    nonisolated func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

        let imageRequestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, orientation: .leftMirrored, options: [:])

        do {
            try imageRequestHandler.perform([faceDetectionRequest, faceLandmarksRequest])
        } catch {
            print("Vision request failed: \(error)")
        }
    }
}





















