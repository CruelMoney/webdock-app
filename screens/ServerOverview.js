import React from 'react';
import {StyleSheet, View, Text, Image} from 'react-native';
import {
  Card,
  Paragraph,
  Title,
  Menu,
  Button,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ServerOverview() {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  return (
    <View width="100%" height="100%">
      <View style={{justifyContent: 'flex-start', height: '90%'}}>
        <Card style={styles.card1}>
          <Card.Content>
            <Text style={styles.textheader}>Status</Text>
            <Text style={styles.textcontent}>Running</Text>
            <Text style={styles.textheader}>Aliases</Text>
            <Text style={styles.textcontent}>webdock.io</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card1}>
          <Card.Content>
            <Text style={styles.textheader}>IPv4</Text>
            <Text style={styles.textcontent}>104.212.212.122</Text>
            <Text style={styles.textheader}>IPv6</Text>
            <Text style={styles.textcontent}>
              2001:db8:3333:4444:5555:6666:7777:8888
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.card1}>
          <Card.Content>
            <Text style={styles.textheader}>Image</Text>
            <Text style={styles.textcontent}>Ubuntu Focal Fossa</Text>
            <Text style={styles.textheader}>Location</Text>
            <Text style={styles.textcontent}>EU, Helsinki</Text>
            <Text style={styles.textheader}>Profile</Text>
            <Text style={styles.textcontent}>SSD Premium</Text>
          </Card.Content>
        </Card>
      </View>
      <View
        style={{
          height: '10%',
          flexDirection: 'row',
          backgroundColor: 'white',
          alignItems: 'center',
          borderTopColor: '#e6e6e6',
          borderTopWidth: 0.3,
        }}>
        <View style={{width: '15%', alignItems: 'center', display: 'none'}}>
          <Icon name="play-arrow" size={32} color="green" />
        </View>
        <View style={{width: '15%', alignItems: 'center'}}>
          <Icon name="stop" size={32} color="red" />
        </View>
        <View style={{width: '15%', alignItems: 'center'}}>
          <Icon name="replay" size={32} color="dodgerblue" />
        </View>
        <View style={{width: '15%', alignItems: 'center'}}>
          <Image
            source={require('../assets/termius.png')}
            style={{width: 32, height: 32, backgroundColor: 'transparent'}}
          />
        </View>
        <View style={{width: '55%', alignItems: 'flex-end'}}>
          <View style={{width: '30%', alignItems: 'center'}}>
            <Icon
              name="more-vert"
              size={32}
              color="dodgerblue"
              onPress={() => openMenu}
            />
          </View>
        </View>
      </View>
      <Menu visible={visible} onDismiss={closeMenu}>
        <Menu.Item onPress={() => {}} title="Item 1" />
        <Menu.Item onPress={() => {}} title="Item 2" />
        <Divider />
        <Menu.Item onPress={() => {}} title="Item 3" />
      </Menu>
    </View>
  );
}
const styles = StyleSheet.create({
  card1: {
    margin: 3,
  },
  textheader: {
    color: '#111111',
    fontWeight: 'bold',
  },
  textcontent: {
    color: '#666666',
  },
});
