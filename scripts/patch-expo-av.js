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
  'EXLegacyExpoViewProtocol.h': `// Compatibility stub – removed in ExpoModulesCore SDK 52+
#pragma once
#import <Foundation/Foundation.h>

@protocol EXLegacyExpoViewProtocol <NSObject>
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

// Patch EXAV.m: inject compatibility shims for EXErrorWithMessage and UM* type aliases
const exavM = path.join(__dirname, '../node_modules/expo-av/ios/EXAV/EXAV.m');

if (fs.existsSync(exavM)) {
  let src = fs.readFileSync(exavM, 'utf8');
  const insertAfter = '#import <EXAV/EXAV+AudioSampleCallback.h>';
  const shims = `
// -- Compatibility shims for removed ExpoModulesCore symbols (SDK 57+) --
#ifndef EXErrorWithMessage
#define EXErrorWithMessage(msg) [NSError errorWithDomain:@"EXAV" code:0 userInfo:@{NSLocalizedDescriptionKey: (msg)}]
#endif
#ifndef UMPromiseResolveBlock
typedef void (NS_SWIFT_SENDABLE ^UMPromiseResolveBlock)(id result);
typedef void (NS_SWIFT_SENDABLE ^UMPromiseRejectBlock)(NSString *code, NSString *message, NSError *error);
#endif
// -- End compatibility shims --
`;
  if (src.includes(insertAfter) && !src.includes('Compatibility shims')) {
    fs.writeFileSync(exavM, src.replace(insertAfter, insertAfter + shims), 'utf8');
    console.log('[patch-expo-av] Patched EXAV.m compatibility shims.');
  }
}

// Patch EXAudioRecordingPermissionRequester.m: EXFatal/EXErrorWithMessage removed in ExpoModulesCore 57.x
const audioPermRequester = path.join(
  __dirname,
  '../node_modules/expo-av/ios/EXAV/EXAudioRecordingPermissionRequester.m',
);

if (fs.existsSync(audioPermRequester)) {
  let src = fs.readFileSync(audioPermRequester, 'utf8');
  const oldCall = `EXFatal(EXErrorWithMessage(@"This app is missing NSMicrophoneUsageDescription, so audio services will fail. Add one of these keys to your bundle's Info.plist."));`;
  const newCall = `NSLog(@"[EXAV] Missing NSMicrophoneUsageDescription — audio recording will be denied.");`;
  if (src.includes(oldCall)) {
    fs.writeFileSync(audioPermRequester, src.replace(oldCall, newCall), 'utf8');
    console.log('[patch-expo-av] Patched EXAudioRecordingPermissionRequester.m EXFatal → NSLog.');
  }
}

// Patch EXAVPlayerData.m: EXLogWarn/EXLogError/EXLogInfo/EXErrorWithMessage removed in ExpoModulesCore 57.x
const exavPlayerData = path.join(__dirname, '../node_modules/expo-av/ios/EXAV/EXAVPlayerData.m');

if (fs.existsSync(exavPlayerData)) {
  let src = fs.readFileSync(exavPlayerData, 'utf8');
  const insertAfter2 = '#import <MobileCoreServices/MobileCoreServices.h>';
  const shims2 = `
// -- Compatibility shims for removed ExpoModulesCore symbols (SDK 57+) --
#ifndef EXErrorWithMessage
#define EXErrorWithMessage(msg) [NSError errorWithDomain:@"EXAV" code:0 userInfo:@{NSLocalizedDescriptionKey: (msg)}]
#endif
#ifndef EXLogWarn
#define EXLogWarn(fmt, ...) NSLog((@"[EXAV WARN] " fmt), ##__VA_ARGS__)
#define EXLogError(fmt, ...) NSLog((@"[EXAV ERROR] " fmt), ##__VA_ARGS__)
#define EXLogInfo(fmt, ...) NSLog((@"[EXAV INFO] " fmt), ##__VA_ARGS__)
#endif
// -- End compatibility shims --
`;
  if (src.includes(insertAfter2) && !src.includes('Compatibility shims')) {
    fs.writeFileSync(exavPlayerData, src.replace(insertAfter2, insertAfter2 + shims2), 'utf8');
    console.log('[patch-expo-av] Patched EXAVPlayerData.m compatibility shims.');
  }
}

// Patch VideoViewModule.swift: promise.resolver changed type in ExpoModulesCore 57.x
// (now JavaScriptValue-based); use legacyResolver for Obj-C bridge calls instead.
const videoViewModule = path.join(
  __dirname,
  '../node_modules/expo-av/ios/EXAV/Video/VideoViewModule.swift',
);

if (fs.existsSync(videoViewModule)) {
  let src = fs.readFileSync(videoViewModule, 'utf8');
  const before = 'resolver: promise.resolver, rejecter: promise.legacyRejecter';
  const after  = 'resolver: promise.legacyResolver, rejecter: promise.legacyRejecter';
  if (src.includes(before)) {
    fs.writeFileSync(videoViewModule, src.replace(before, after), 'utf8');
    console.log('[patch-expo-av] Patched VideoViewModule.swift promise.resolver → legacyResolver.');
  }
}
