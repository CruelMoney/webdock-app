module.exports = {
  name: 'Webdock',
  slug: 'webdock',
  owner: 'webdock',
  version: '2.0.6',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'webdock',
  splash: {
    image: './assets/splash-logo.png',
    resizeMode: 'contain',
    backgroundColor: '#022213',
  },

  ios: {
    bundleIdentifier: 'io.webdock.webdock',
    buildNumber: '24',
    supportsTablet: true,
    googleServicesFile: './GoogleService-Info.plist',
    infoPlist: {
      UIStatusBarStyle: 'UIStatusBarStyleLightContent',
      UIViewControllerBasedStatusBarAppearance: false,
      LSApplicationCategoryType: 'public.app-category.developer-tools',
      NSLocationWhenInUseUsageDescription:
        'We need your location for certain features.',
      NSCameraUsageDescription: 'We need camera access for QR code scanning.',
    },
    entitlements: {
      'aps-environment': 'development',
    },
  },

  android: {
    package: 'io.webdock',
    versionCode: 8,
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#022213',
    },
    permissions: [
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'VIBRATE',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'CAMERA',
    ],
  },

  plugins: [
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Poppins-Regular.ttf',
          './assets/fonts/Poppins-Light.ttf',
          './assets/fonts/Poppins-Medium.ttf',
          './assets/fonts/Poppins-SemiBold.ttf',
          './assets/fonts/Poppins-Bold.ttf',
          './assets/fonts/Poppins-Black.ttf',
          './assets/fonts/Poppins-Thin.ttf',
          './assets/fonts/Poppins-ExtraLight.ttf',
          './assets/fonts/Poppins-ExtraBold.ttf',
          './assets/fonts/Poppins-Italic.ttf',
          './assets/fonts/Poppins-LightItalic.ttf',
          './assets/fonts/Poppins-MediumItalic.ttf',
          './assets/fonts/Poppins-SemiBoldItalic.ttf',
          './assets/fonts/Poppins-BoldItalic.ttf',
          './assets/fonts/Poppins-BlackItalic.ttf',
          './assets/fonts/Poppins-ThinItalic.ttf',
          './assets/fonts/Poppins-ExtraLightItalic.ttf',
          './assets/fonts/Poppins-ExtraBoldItalic.ttf',
          './assets/fonts/Raleway-Regular.ttf',
          './assets/fonts/Raleway-Light.ttf',
          './assets/fonts/Raleway-Medium.ttf',
          './assets/fonts/Raleway-SemiBold.ttf',
          './assets/fonts/Raleway-Bold.ttf',
          './assets/fonts/Raleway-Black.ttf',
          './assets/fonts/Raleway-Thin.ttf',
          './assets/fonts/Raleway-ExtraLight.ttf',
          './assets/fonts/Raleway-ExtraBold.ttf',
          './assets/fonts/Raleway-Italic.ttf',
          './assets/fonts/Raleway-LightItalic.ttf',
          './assets/fonts/Raleway-MediumItalic.ttf',
          './assets/fonts/Raleway-SemiBoldItalic.ttf',
          './assets/fonts/Raleway-BoldItalic.ttf',
          './assets/fonts/Raleway-BlackItalic.ttf',
          './assets/fonts/Raleway-ThinItalic.ttf',
          './assets/fonts/Raleway-ExtraLightItalic.ttf',
          './assets/fonts/Raleway-ExtraBoldItalic.ttf',
        ],
      },
    ],
    'expo-dev-client',
    'expo-system-ui',
    [
      'expo-notifications',
      {
        icon: './assets/adaptive-icon.png',
        color: '#01FF47',
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#022213',
        image: './assets/splash-logo.png',
        imageWidth: 200,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission:
          'Allow $(PRODUCT_NAME) to access your camera for QR code scanning.',
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
          deploymentTarget: '15.1',
          buildReactNativeFromSource: true,
        },
        android: {
          minSdkVersion: 24,
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          kotlinVersion: '2.0.21',
        },
      },
    ],
    '@react-native-firebase/app',
  ],

  extra: {
    eas: {
      projectId: '2a9c82e7-bb6f-40ff-8e77-d2a318b23d3e',
    },
  },
};
