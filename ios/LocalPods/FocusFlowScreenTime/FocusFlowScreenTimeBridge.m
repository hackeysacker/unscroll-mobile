#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(FocusFlowScreenTime, NSObject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAuthorizationStatus:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getTodayUsage:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setAppLimit:(int)limitMinutes resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAppLimit:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end