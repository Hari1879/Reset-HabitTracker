/**
 * Patches react-native-health for New Architecture compatibility.
 *
 * react-native-health calls [RCTCallableJSModules setBridge:] which no longer
 * exists in RN's New Architecture. The two lines are dead code — the actual
 * event emission goes through RCTEventEmitter's sendEventWithName:body: —
 * so removing them is safe.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '../node_modules/react-native-health/RCTAppleHealthKit/RCTAppleHealthKit.m',
);

if (!fs.existsSync(target)) {
  console.log('[patch-rn-health] File not found — skipping.');
  process.exit(0);
}

let src = fs.readFileSync(target, 'utf8');

const before = `    self.callableJSModules = [RCTAppleHealthKit sharedJsModule];
    [self.callableJSModules setBridge:self.bridge];
    [self sendEventWithName:notification.name`;

const after = `    [self sendEventWithName:notification.name`;

if (src.includes(before)) {
  src = src.replace(before, after);
  fs.writeFileSync(target, src, 'utf8');
  console.log('[patch-rn-health] Applied New Architecture patch.');
} else {
  console.log('[patch-rn-health] Already patched or pattern not found — skipping.');
}
