import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Styles = {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const styles = StyleSheet.create<Styles>({
container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputContainer: {
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
  },
  // HTML content styles
  htmlContent: {
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    marginVertical: 8,
    color: '#333',
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 12,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 10,
  },
});
