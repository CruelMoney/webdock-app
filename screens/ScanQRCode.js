import React,{useState} from 'react';
import { Alert, Linking, StyleSheet,Text,View } from "react-native";
import { RNCamera } from 'react-native-camera';
import { TouchableOpacity } from 'react-native-gesture-handler';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { AuthContext } from '../components/context';

import {getPing} from '../service/ping';
export default function ScanQRCode({navigation}){
    const { signIn }=React.useContext(AuthContext);
    // const onSuccess = e => {
    //     Linking.openURL(e.data).catch(err =>
    //       console.error('An error occured', err)
    //     );
    //   };


    const onSuccess = e => {

        var edata=JSON.parse(e.data);
        getPing(edata.token).then(data => {
            if(data.webdock==="rocks"){
                signIn(edata.token);
            }else{
                Alert.alert("Error","Something went wrong!")
            }
        })
        
    };
    
    return(
        <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.auto}
        topContent={
          <Text style={styles.centerText}>
            Go to{' '}
            <TouchableOpacity onPress={()=>{
                Linking.canOpenURL("https://app.webdock.io/en/dash/profile").then(supported => {
                    if (supported) {
                      Linking.openURL("https://app.webdock.io/en/dash/profile");
                    } else {
                      console.log("Don't know how to open URI: " + "https://app.webdock.io/en/dash/profile");
                    }
                  });
            }}><Text style={styles.textBold}>https://app.webdock.io/en/dash/profile</Text></TouchableOpacity> on
            your computer and scan the QR code on API & Integrations section.
          </Text>
        }
        bottomContent={
          <TouchableOpacity style={styles.buttonTouchable} onPress={()=>{
            navigation.navigate("LogIn");
        }}>
            <Text style={styles.buttonText}>OK. Got it!</Text>
          </TouchableOpacity>
        }
      />
    )
}

const styles = StyleSheet.create({
    centerText: {
      flex: 1,
      fontSize: 18,
      padding: 24,
      color: '#777'
    },
    textBold: {
      fontWeight: 'bold',
      color: '#000'
    },
    buttonText: {
      fontSize: 21,
      color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
      padding: 16
    }
  });
  