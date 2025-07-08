import {View} from 'react-native';

export default function AlertsTab({theme}) {
  // <BottomSheetFlatList
  //   data={
  //     searchQuery
  //       ? searchQuery.length === 0
  //         ? servers
  //         : filteredServers
  //       : servers
  //   }
  //   keyExtractor={(item, index) => `${item.slug || 'item'}-${index}`}
  //   refreshing={isFetching}
  //   onRefresh={onBackgroundRefresh}
  //   style={{flex: 1}}
  //   contentContainerStyle={{paddingBottom: 20}}
  //   ListEmptyComponent={
  //     <View
  //       style={{
  //         paddingVertical: 24,
  //         backgroundColor: theme.colors.surface,
  //         gap: 11,
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //       }}>
  //       <Text style={{textAlign: 'center', color: theme.colors.text}}>
  //         Nice Job!
  //       </Text>
  //       <Text style={{textAlign: 'center', color: theme.colors.text}}>
  //         You have no notifications.
  //       </Text>
  //       <ThumbsUp color={theme.colors.text} />
  //     </View>
  //   }
  //   renderItem={({item}) => (
  //     <TouchableOpacity
  //       onPress={() =>
  //         navigation.navigate('ServerManagement', {
  //           slug: item.slug,
  //           name: item.name,
  //           description: item.description,
  //           notes: item.notes,
  //           nextActionDate: item.nextActionDate,
  //         })
  //       }>
  //       <View>
  //         <ServerItem
  //           title={item.name}
  //           alias={item.aliases[0]}
  //           dc={item.location}
  //           virtualization={item.virtualization}
  //           profile={item.profile}
  //           ipv4={item.ipv4}
  //           status={item.status}
  //         />
  //         <View style={{height: 10}} />
  //       </View>
  //     </TouchableOpacity>
  //   )}
  //   extraData={rerenderFlatList}
  //   showsVerticalScrollIndicator={false}
  // />
  return (
    <View
      style={{
        padding: 14,
        gap: 16,
        backgroundColor: theme.colors.surface,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
      }}>
      <Text
        style={{
          fontFamily: 'Poppins',
          fontSize: 14,
          color: theme.colors.text,
        }}>
        Coming soon.
      </Text>
    </View>
  );
}
