import AsyncStorage from '@react-native-community/async-storage';
import React,{useState,useEffect} from 'react';
import {ActivityIndicator, Linking,View} from 'react-native';
import {Card,Avatar,Title,Paragraph,Button, Divider } from 'react-native-paper';
import { getAccountInformations } from '../service/accountInformations';

export default function AccountInfo(){

    const [account, setAccount]=useState();
    useEffect(() => {
        setTimeout(async() => {
          let userToken=null;
          try {
            userToken=await AsyncStorage.getItem('userToken');
            getAccountInformations(userToken).then(data => {
                setAccount(data);
            });
          }catch(e){
            alert(e);
          }
        },1000);
      }, []);
    return(
        account?
        <Card style={{margin:10,padding:10}}>
            <Avatar.Image style={{alignSelf:'center'}}
                                source={{
                                    uri:"https:" + account.userAvatar
                                }}
                                size={100}
                            />
                <Card.Content style={{margin:10}}>
                    <Title style={{textAlign:'center'}}>{account.companyName}</Title>
                </Card.Content>
                <Card.Content style={{margin:10}}>
                    <Title style={{textAlign:'center'}}>{account.userName}</Title>
                    <Paragraph style={{textAlign:'center'}}>{account.userEmail}</Paragraph>
                </Card.Content>
                <Divider />
                <Card.Content style={{margin:10}}>
                    <Title style={{textAlign:'center'}}>Account Credit Balance</Title>
                    <Paragraph style={{color:'green',fontSize:18,textAlign:'center'}}>{account.accountBalanceRaw} {account.accountBalanceCurrency}</Paragraph>
                </Card.Content>
                <Divider />
                <Card.Actions style={{justifyContent:'center'}}>
                    <Paragraph style={{textAlign:'center'}} onPress={()=> Linking.openURL("https://webdock.io/en/docs/webdock/billing-pricing")}>Want to know how to get credit? Click here!</Paragraph>
                </Card.Actions>
        </Card>
        :<View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
            <ActivityIndicator size="large" color="#008570"/>
        </View>
    )
}