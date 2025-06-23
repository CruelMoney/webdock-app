import React from 'react';
import {Text} from 'react-native';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error, errorInfo) {
    console.error('BottomSheet error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(); // trigger onClose in wrapper
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{minHeight: '100%'}}>
          <Text style={{padding: 20, color: 'red'}}>
            Failed to load content.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
