//
//  FocusFlowWidgetsBridge.m
//  FocusFlowWidgetsBridge
//
//  Objective-C bridge for React Native
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(FocusFlowWidgetsBridge, NSObject)

RCT_EXTERN_METHOD(writeWidgetData:(NSDictionary *)data
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(readWidgetData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
