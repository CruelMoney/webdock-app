import { DrawerActions } from '@react-navigation/routers';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Header({navigation}){
    const openMenu=()=> {
        navigation.dispatch(DrawerActions.openDrawer());
    }
    return (
        <View style={styles.header}>
            <Icon name="menu" size={25} onPress={openMenu} style={styles.icon} />
            <View>
                <Text style={styles.headerText}>Servers</Text>
            </View>
        </View>
    )
}

const styles=StyleSheet.create({
    header:{
        width: '100%',
        height: '100%',
        flexDirection: 'row',
        backgroundColor:'#008570',
        alignItems:'center',
        justifyContent: 'center'
    },
    headerText:{
        fontWeight: 'bold',
        fontSize: 20,
        color:'white',
        letterSpacing: 1
    },
    icon: {
        color:'white',
        position: 'absolute',
        left:16,
    }
})
