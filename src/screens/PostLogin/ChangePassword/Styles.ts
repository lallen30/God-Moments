import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { colors } from '../../../theme/colors';

type Styles = {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const styles = StyleSheet.create<Styles>({
container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  backButton: {
    color: colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: colors.dark,
    marginBottom: 20,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: colors.dark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.light,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: colors.dark,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
