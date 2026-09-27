require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'ResetWidgetBridge'
  s.version        = package['version']
  s.summary        = 'Native bridge that syncs Reset habit progress into the WidgetKit App Group store.'
  s.author         = 'Reset'
  s.homepage       = 'https://github.com/reset-app/reset'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift}'
end
