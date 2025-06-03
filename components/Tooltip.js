import {View, Text, Button, StyleSheet} from 'react-native';
import {
  copilot,
  walkthroughable,
  CopilotStep,
  CopilotProps,
  Pagination,
} from 'react-native-copilot';
const Tooltip = ({
  isFirstStep,
  isLastStep,
  handleNext,
  handlePrev,
  handleStop,
  currentStep,
}) => {
  return (
    <View style={styles.tooltip}>
      <Text style={styles.tooltipText}>{currentStep?.text}</Text>
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
    backgroundColor: '#fff',
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
