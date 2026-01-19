import analytics from '@react-native-firebase/analytics';

/**
 * Log a screen view event to Firebase Analytics
 * @param screenName - The name of the screen
 * @param screenClass - Optional screen class (defaults to screenName)
 */
export async function logScreenView(
  screenName: string,
  screenClass?: string,
): Promise<void> {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  } catch (error) {
    console.error('[Analytics] Error logging screen view:', error);
  }
}
