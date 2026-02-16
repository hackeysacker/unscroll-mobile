import SwiftUI
import ARKit

// MARK: - Face Tracking View
/// SwiftUI view that displays camera preview with face tracking overlay
struct FaceTrackingView: View {
    @ObservedObject var viewModel: FaceTrackingViewModel
    var showOverlay: Bool = true
    var showDebugInfo: Bool = false

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Camera preview
                ARViewContainer(viewModel: viewModel)
                    .ignoresSafeArea()

                // Face tracking overlay
                if showOverlay && viewModel.isFacePresent {
                    FaceOverlay(
                        boundingBox: viewModel.faceBoundingBox,
                        centerPoint: CGPoint(
                            x: viewModel.faceCenterNormalized.x * geometry.size.width,
                            y: viewModel.faceCenterNormalized.y * geometry.size.height
                        ),
                        attentionScore: viewModel.attentionScore
                    )
                }

                // Debug information
                if showDebugInfo {
                    VStack {
                        Spacer()
                        DebugInfoView(viewModel: viewModel)
                            .padding()
                    }
                }

                // Permission denied overlay
                if viewModel.permissionStatus == .denied {
                    PermissionDeniedView()
                }
            }
        }
    }
}

// MARK: - AR View Container
/// UIViewRepresentable wrapper for ARSCNView
struct ARViewContainer: UIViewRepresentable {
    @ObservedObject var viewModel: FaceTrackingViewModel

    func makeUIView(context: Context) -> ARSCNView {
        let arView = ARSCNView()
        arView.automaticallyUpdatesLighting = false
        arView.rendersCameraGrain = false

        // Configure for performance
        arView.antialiasingMode = .none
        arView.preferredFramesPerSecond = 30

        return arView
    }

    func updateUIView(_ uiView: ARSCNView, context: Context) {
        // View updates handled by ARSession delegate
    }
}

// MARK: - Face Overlay
/// Draws bounding box and center point on detected face
struct FaceOverlay: View {
    let boundingBox: CGRect
    let centerPoint: CGPoint
    let attentionScore: Float

    var overlayColor: Color {
        if attentionScore > 0.7 {
            return .green
        } else if attentionScore > 0.4 {
            return .yellow
        } else {
            return .red
        }
    }

    var body: some View {
        ZStack {
            // Bounding box
            Rectangle()
                .stroke(overlayColor, lineWidth: 3)
                .frame(width: boundingBox.width, height: boundingBox.height)
                .position(
                    x: boundingBox.midX,
                    y: boundingBox.midY
                )

            // Center point
            Circle()
                .fill(overlayColor)
                .frame(width: 12, height: 12)
                .position(centerPoint)

            // Attention indicator at top of box
            if boundingBox.width > 0 {
                Text("\(Int(attentionScore * 100))%")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(overlayColor)
                    .cornerRadius(8)
                    .position(
                        x: boundingBox.midX,
                        y: boundingBox.minY - 20
                    )
            }
        }
    }
}

// MARK: - Debug Info View
/// Shows detailed tracking information for development
struct DebugInfoView: View {
    @ObservedObject var viewModel: FaceTrackingViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Face Tracking Debug")
                .font(.headline)
                .foregroundColor(.white)

            Group {
                Text("Face Present: \(viewModel.isFacePresent ? "Yes" : "No")")
                Text("Attention: \(viewModel.attentionPercentage)%")
                Text("Gaze: \(viewModel.gazeDirectionString)")
                Text("Distance: \(String(format: "%.2f", viewModel.faceDistanceEstimate))m")
                Text("Center: (\(String(format: "%.2f", viewModel.faceCenterNormalized.x)), \(String(format: "%.2f", viewModel.faceCenterNormalized.y)))")
            }
            .font(.system(size: 12, design: .monospaced))
            .foregroundColor(.white)
        }
        .padding()
        .background(Color.black.opacity(0.7))
        .cornerRadius(12)
    }
}

// MARK: - Permission Denied View
struct PermissionDeniedView: View {
    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: "camera.fill")
                .font(.system(size: 48))
                .foregroundColor(.gray)

            Text("Camera Access Required")
                .font(.headline)
                .foregroundColor(.white)

            Text("Please enable camera access in Settings to use face tracking.")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            Button("Open Settings") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)
        }
        .padding()
        .background(Color.black.opacity(0.9))
    }
}

// MARK: - Example Usage View
struct FaceTrackingExampleView: View {
    @StateObject private var viewModel = FaceTrackingViewModel()

    var body: some View {
        VStack {
            // Face tracking camera view
            FaceTrackingView(
                viewModel: viewModel,
                showOverlay: true,
                showDebugInfo: true
            )
            .frame(height: 400)
            .cornerRadius(16)
            .padding()

            // Control buttons
            HStack(spacing: 20) {
                Button(viewModel.isTracking ? "Stop" : "Start") {
                    if viewModel.isTracking {
                        viewModel.stopTracking()
                    } else {
                        viewModel.startTracking()
                    }
                }
                .padding()
                .background(viewModel.isTracking ? Color.red : Color.green)
                .foregroundColor(.white)
                .cornerRadius(10)
            }

            // Status display
            VStack(spacing: 8) {
                HStack {
                    Text("Attention Score:")
                    Spacer()
                    Text("\(viewModel.attentionPercentage)%")
                        .fontWeight(.bold)
                }

                HStack {
                    Text("Face Present:")
                    Spacer()
                    Text(viewModel.isFacePresent ? "Yes" : "No")
                        .foregroundColor(viewModel.isFacePresent ? .green : .red)
                }

                HStack {
                    Text("Gaze Direction:")
                    Spacer()
                    Text(viewModel.gazeDirectionString)
                }
            }
            .padding()

            Spacer()
        }
        .onAppear {
            Task {
                let granted = await viewModel.requestPermission()
                if granted {
                    viewModel.startTracking()
                }
            }
        }
        .onDisappear {
            viewModel.stopTracking()
        }
    }
}

#Preview {
    FaceTrackingExampleView()
        .preferredColorScheme(.dark)
}
