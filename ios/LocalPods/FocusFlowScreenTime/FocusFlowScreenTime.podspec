Pod::Spec.new do |s|
  s.name         = "FocusFlowScreenTime"
  s.version      = "1.0.0"
  s.summary      = "Screen Time API integration for FocusFlow"
  s.description  = "Native module for iOS Family Controls / Screen Time API to sync app usage and set limits"
  s.homepage     = "https://github.com/focusflow"
  s.license      = "MIT"
  s.author       = { "FocusFlow" => "dev@focusflow.app" }
  s.platform     = :ios, "14.0"
  s.source       = { :path => "." }
  s.source_files = "**/*.{h,m,swift}"
  s.swift_version = "5.0"
  
  s.dependency "React-Core"
end