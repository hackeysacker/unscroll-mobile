Pod::Spec.new do |s|
  s.name             = 'FocusFlowWidgetsBridge'
  s.version          = '1.0.0'
  s.summary          = 'Bridge module for FocusFlow widget data'
  s.description      = 'Allows React Native to write data to the App Group for widgets'
  s.homepage         = 'https://github.com/isaacwaldman/focusflow'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Isaac Waldman' => 'isaac@example.com' }
  s.source           = { :git => 'https://github.com/isaacwaldman/focusflow.git', :tag => s.version.to_s }

  s.ios.deployment_target = '15.1'
  s.swift_version = '5.0'

  s.source_files = '*.swift', '*.m'

  s.dependency 'React-Core'
end
