import {View, Text, Button, StyleSheet} from 'react-native';
import {
  copilot,
  walkthroughable,
  CopilotStep,
  CopilotProps,
  Pagination,
} from 'react-native-copilot';
import {useTheme} from 'react-native-paper';
const Tooltip = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
}) => {
  const theme = useTheme();
  return (
    <View style={[styles.tooltip, {backgroundColor: theme.colors.background}]}>
      <Text style={[styles.tooltipText, {color: theme.colors.text}]}>
        {currentStep?.text}
      </Text>
      <Pagination currentStep={currentStep} />
      <View style={styles.buttons}>
        {!isFirstStep && <Button title="Previous" onPress={handlePrev} />}
        {!isLastStep ? (
          <Button title="Next" onPress={handleNext} />
        ) : (
          <Button title="Done" onPress={handleStop} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    padding: 15,

    borderRadius: 8,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowColor: '#000',
    elevation: 3,
  },
  tooltipText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
export default Tooltip;
