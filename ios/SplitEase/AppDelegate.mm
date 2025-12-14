#import <GoogleSignIn/GoogleSignIn.h>
#import <Firebase/Firebase.h>

// Helper class to keep ObjC++ integration available without replacing the Swift AppDelegate.
// You can call these helpers from Swift if needed via the generated -Swift bridging header.
@interface RNAppDelegateMMHelper : NSObject
+ (void)configureFirebaseIfNeeded;
+ (BOOL)handleURL:(NSURL *)url;
@end

@implementation RNAppDelegateMMHelper
+ (void)configureFirebaseIfNeeded {
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
}

+ (BOOL)handleURL:(NSURL *)url {
  return [[GIDSignIn sharedInstance] handleURL:url];
}
@end

