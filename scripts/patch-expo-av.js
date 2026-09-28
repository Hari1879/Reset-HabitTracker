/**
 * Creates compatibility stub headers for expo-av's EXAV module.
 *
 * ExpoModulesCore 57.x ships as a precompiled xcframework and no longer
 * exposes EXEventEmitter.h or EXEventEmitterService.h as standalone headers
 * (they were removed in SDK 52+). expo-av 16.x still imports them, so we
 * inject minimal protocol stubs into both xcframework slices so EXAV compiles.
 */
const fs = require('fs');
const path = require('path');

const STUBS = {
  'EXEventEmitter.h': `// Compatibility stub – removed in ExpoModulesCore SDK 52+
#pragma once
#import <Foundation/Foundation.h>

@protocol EXEventEmitter <NSObject>
- (NSArray<NSString *> *)supportedEvents;
- (void)startObserving;
- (void)stopObserving;
@end
`,
  'EXEventEmitterService.h': `// Compatibility stub – removed in ExpoModulesCore SDK 52+
#pragma once
#import <Foundation/Foundation.h>

@protocol EXEventEmitterService <NSObject>
- (void)sendEventWithName:(NSString *)eventName body:(id)body;
@end
`,
};

const SLICES = [
  'ios-arm64',
  'ios-arm64_x86_64-simulator',
];

const xcframeworkBase = path.join(
  __dirname,
  '../ios/Pods/ExpoModulesCore/ExpoModulesCore.xcframework',
);

if (!fs.existsSync(xcframeworkBase)) {
  console.log('[patch-expo-av] ExpoModulesCore xcframework not found — run pod install first.');
  process.exit(0);
}

let patched = 0;

for (const slice of SLICES) {
  const headersDir = path.join(
    xcframeworkBase,
    slice,
    'ExpoModulesCore.framework',
    'Headers',
  );

  if (!fs.existsSync(headersDir)) {
    console.log(`[patch-expo-av] Headers dir not found for slice ${slice} — skipping.`);
    continue;
  }

  for (const [filename, content] of Object.entries(STUBS)) {
    const dest = path.join(headersDir, filename);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, content, 'utf8');
      console.log(`[patch-expo-av] Created ${slice}/${filename}`);
      patched++;
    }
  }
}

if (patched === 0) {
  console.log('[patch-expo-av] All stubs already present — nothing to do.');
} else {
  console.log(`[patch-expo-av] Created ${patched} stub header(s).`);
}
