import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors anywhere in the child component tree.
 * It logs the errors and displays a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      errorInfo,
    });
    
    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Something went wrong</Text>
              
              <View style={styles.errorMessageContainer}>
                <Text style={styles.errorMessage}>
                  {this.state.error?.toString() || 'An unknown error occurred'}
                </Text>
              </View>
              
              {this.state.errorInfo && (
                <View style={styles.componentStackContainer}>
                  <Text style={styles.componentStackTitle}>Component Stack:</Text>
                  <Text style={styles.componentStack}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.resetButton}
                onPress={this.resetError}
              >
                <Text style={styles.resetButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorMessageContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  errorMessage: {
    fontSize: 16,
    color: '#343a40',
    lineHeight: 22,
  },
  componentStackContainer: {
    backgroundColor: '#f1f3f5',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  componentStackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 10,
  },
  componentStack: {
    fontSize: 14,
    color: '#6c757d',
    fontFamily: 'Courier',
  },
  resetButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;
