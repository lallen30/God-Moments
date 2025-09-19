import { StyleSheet, Dimensions, ViewStyle, TextStyle, ImageStyle, Platform } from 'react-native';
import { colors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

type Styles = {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
  },
  formContainer: {
    flex: 1,
  },
  buttonWrapper: {
    backgroundColor: colors.white,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: colors.dark,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: colors.dark,
    backgroundColor: colors.light,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
