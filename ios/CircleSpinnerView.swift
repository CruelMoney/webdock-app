//
//  CircularProgressView.swift
//  Webdock
//
//  Created by Albin Pllana on 16.9.25.
//

import UIKit

@IBDesignable
class CircleSpinnerView: UIView {
    private let trackLayer = CAShapeLayer()
    private let spinnerLayer = CAShapeLayer()
    private var isAnimating = false

    // MARK: - Inspectables
    @IBInspectable var lineWidth: CGFloat = 6 { didSet { applyStyle() } }
    @IBInspectable var color: UIColor = .systemBlue { didSet { spinnerLayer.strokeColor = color.cgColor } }
    @IBInspectable var showsTrack: Bool = true { didSet { trackLayer.isHidden = !showsTrack } }
    @IBInspectable var trackColor: UIColor = UIColor.systemGray5 { didSet { trackLayer.strokeColor = trackColor.cgColor } }
    /// Portion of the circle to show as the moving arc (0.05...0.9)
    @IBInspectable var arcFraction: CGFloat = 0.25 { didSet { setNeedsLayout() } }
    /// One full rotation duration (seconds)
    @IBInspectable var rotationDuration: Double = 1.0 {
        didSet { if isAnimating { restartAnimation() } }
    }

    // MARK: - Init
    override init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }
    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        backgroundColor = .clear

        // Track
        trackLayer.fillColor = UIColor.clear.cgColor
        trackLayer.strokeColor = trackColor.cgColor
        trackLayer.lineWidth = lineWidth
        trackLayer.lineCap = .round
        layer.addSublayer(trackLayer)

        // Spinner
        spinnerLayer.fillColor = UIColor.clear.cgColor
        spinnerLayer.strokeColor = color.cgColor
        spinnerLayer.lineWidth = lineWidth
        spinnerLayer.lineCap = .round
        spinnerLayer.strokeStart = 0
        spinnerLayer.strokeEnd = arcFraction
        layer.addSublayer(spinnerLayer)
    }

    private func applyStyle() {
        trackLayer.lineWidth = lineWidth
        spinnerLayer.lineWidth = lineWidth
        setNeedsLayout()
    }

    // MARK: - Layout
    override func layoutSubviews() {
        super.layoutSubviews()
        let inset = lineWidth / 2
        let rect = bounds.insetBy(dx: inset, dy: inset)
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        let startAngle = -CGFloat.pi / 2

        // Full circle path (for track)
        let circlePath = UIBezierPath(arcCenter: center, radius: radius,
                                      startAngle: 0, endAngle: 2 * .pi, clockwise: true)
        trackLayer.path = circlePath.cgPath

        // Short arc path (for spinner)
        let endAngle = startAngle + (2 * .pi * arcFraction)
        let arcPath = UIBezierPath(arcCenter: center, radius: radius,
                                   startAngle: startAngle, endAngle: endAngle, clockwise: true)
        spinnerLayer.path = arcPath.cgPath
    }

    // MARK: - Animation
    func startAnimating() {
        guard !isAnimating else { return }
        isAnimating = true

        let rotation = CABasicAnimation(keyPath: "transform.rotation.z")
        rotation.fromValue = 0
        rotation.toValue = 2 * Double.pi
        rotation.duration = rotationDuration
        rotation.repeatCount = .infinity
        rotation.timingFunction = CAMediaTimingFunction(name: .linear)
        layer.add(rotation, forKey: "spin")
    }

    func stopAnimating() {
        isAnimating = false
        layer.removeAnimation(forKey: "spin")
    }

    private func restartAnimation() {
        stopAnimating()
        startAnimating()
    }

    // Start/stop automatically with view lifecycle
    override func didMoveToWindow() {
        super.didMoveToWindow()
        if window != nil { startAnimating() } else { stopAnimating() }
    }
}
