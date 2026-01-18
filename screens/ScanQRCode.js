import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ActivityIndicator, Button, useTheme } from 'react-native-paper';
import { AuthContext } from '../components/context';
import { getPing } from '../service/ping';

export default function ScanQRCode({ navigation }) {
  const { signIn } = React.useContext(AuthContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const theme = useTheme();

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const edata = JSON.parse(data);
      getPing(edata.token).then(response => {
        if (response.webdock === 'rocks') {
          signIn(edata.token);
        } else {
          Alert.alert('Error', 'Something went wrong!');
          setScanned(false);
        }
      }).catch(() => {
        Alert.alert('Error', 'Invalid QR code');
        setScanned(false);
      });
    } catch (e) {
      Alert.alert('Error', 'Invalid QR code format');
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.centerText, { color: theme.colors.text }]}>
          We need your permission to use the camera
        </Text>
        <Button mode="contained" onPress={requestPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.topContent}>
          <Text style={styles.centerText}>
            Go to{' '}
            <TouchableOpacity
              onPress={() => {
                Linking.canOpenURL(
                  'https://app.webdock.io/en/dash/profile',
                ).then(supported => {
                  if (supported) {
                    Linking.openURL('https://app.webdock.io/en/dash/profile');
                  } else {
                    console.log(
                      "Don't know how to open URI: " +
                      'https://app.webdock.io/en/dash/profile',
                    );
                  }
                });
              }}>
              <Text style={styles.textBold}>
                https://app.webdock.io/en/dash/profile
              </Text>
            </TouchableOpacity>{' '}
            on your computer and scan the QR code on API & Integrations section.
          </Text>
        </View>
        <View style={styles.scanArea}>
          <View style={styles.scanFrame} />
        </View>
        <View style={styles.bottomContent}>
          {scanned && (
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => setScanned(false)}>
              <Text style={styles.buttonText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.buttonTouchable}
            onPress={() => {
              navigation.navigate('LogIn');
            }}>
            <Text style={styles.buttonText}>OK. Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topContent: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
  },
  scanArea: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#01FF47',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  bottomContent: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
    color: '#01FF47',
  },
  buttonText: {
    fontSize: 18,
    color: '#01FF47',
  },
  buttonTouchable: {
    padding: 16,
  },
});
