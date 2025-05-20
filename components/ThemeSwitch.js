import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Icon, useTheme} from 'react-native-paper';
import Spacer from './Spacer';

const ThemeSwitch = ({
  options = [
    {label: 'On', icon: ''},
    {label: 'Off', icon: ''},
  ],
  onToggle,
}) => {
  const [selected, setSelected] = useState(0);

  const handleToggle = index => {
    setSelected(index);
    if (onToggle) onToggle(options[index]);
  };
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.themeSwitch.primary, opacity: 80},
      ]}>
      {options.map(({label, icon}, index) => (
        <TouchableOpacity
          key={label}
          style={[
            styles.option,
            selected === index && [
              styles.selectedOption,
              {backgroundColor: theme.colors.themeSwitch.secondary},
            ],
          ]}
          onPress={() => handleToggle(index)}>
          <Icon
            source={icon}
            size={18}
            color={
              selected === index ? theme.colors.themeSwitch.text : '#99A199'
            }
          />
          <Spacer size={10} horizontal />
          <Text
            style={[
              styles.label,
              selected === index && [
                styles.selectedLabel,
                {color: theme.colors.themeSwitch.text},
              ],
            ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    includeFontPadding: false,
    flex: 1,
    alignItems: 'center',
  },
  selectedOption: {
    borderRadius: 4,
    backgroundColor: 'white',
  },
  label: {
    color: '#99A199',
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12 * 1.2,
    textAlignVertical: 'center',
  },
  selectedLabel: {
    color: 'black',
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 12 * 1.2,
    textAlignVertical: 'center',
  },
});

export default ThemeSwitch;
