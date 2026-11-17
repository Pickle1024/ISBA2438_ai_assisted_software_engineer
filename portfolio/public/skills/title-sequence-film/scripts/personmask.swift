// swift tools/personmask.swift DIR  -> writes m_XXXX.png person masks next to each XXXX.jpg (Apple Vision)
import Foundation; import Vision; import CoreImage; import AppKit
let dir = CommandLine.arguments[1]; let fm = FileManager.default; let ctx = CIContext()
let files = try! fm.contentsOfDirectory(atPath: dir).filter { $0.hasSuffix(".jpg") }.sorted()
for f in files {
    let out = (dir as NSString).appendingPathComponent("m_" + f.replacingOccurrences(of: ".jpg", with: ".png"))
    if fm.fileExists(atPath: out) { continue }
    let url = URL(fileURLWithPath: (dir as NSString).appendingPathComponent(f))
    let req = VNGeneratePersonSegmentationRequest(); req.qualityLevel = .accurate; req.outputPixelFormat = kCVPixelFormatType_OneComponent8
    let h = VNImageRequestHandler(url: url); try! h.perform([req])
    guard let pb = req.results?.first?.pixelBuffer else { continue }
    let ci = CIImage(cvPixelBuffer: pb); let cg = ctx.createCGImage(ci, from: ci.extent)!
    let rep = NSBitmapImageRep(cgImage: cg); try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: out))
}
print("masks", files.count)
