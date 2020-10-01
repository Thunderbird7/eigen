#import "ArtsyEcho.h"

#import <Foundation/Foundation.h>
#import <react-native-config/ReactNativeConfig.h>

#import "ARAppStatus.h"

@implementation ArtsyEcho

- (instancetype)init
{
    NSURL *url = [[NSURL alloc] initWithString:@"https://artsy-public.s3.us-east-1.amazonaws.com/eigen"];
    self = [self initWithServerURL:url accountID:1 localFilename:@"EchoNew"];

    if (self) {
        [self setup];
    }

    return self;
}

- (void)checkForUpdates:(void (^)(BOOL updatedDataOnServer))updateCheckCompleted
{
    if ([ARAppStatus isRunningTests]) {
        // Prevent all networking in a testing environment.
        updateCheckCompleted(NO);
        return;
    }

    if (![[ReactNativeConfig envFor:@"ARTSY_ECHO_PRODUCTION_TOKEN"] isEqualToString:@"-"]) {
        [super checkForUpdates:updateCheckCompleted];
    }
}

- (NSDictionary *)featuresMap
{
    NSMutableDictionary *mutableOptions = [NSMutableDictionary dictionary];
    for (NSString *key in self.features) {
        [mutableOptions setObject:@(self.features[key].state) forKey:key];
    }
    return [mutableOptions copy];
}

- (BOOL)isFeatureEnabled:(NSString *)featureFlag {
    Feature *currentFeature = self.features[featureFlag];
    if (currentFeature) {
        return currentFeature.state;
    } else {
        return NO;
    }
}

@end
