import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { colors } from '../../../theme/colors';

type Styles = {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const styles = StyleSheet.create<Styles>({
container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.light,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: colors.light,
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
    color: colors.black,
    backgroundColor: colors.light,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    color: colors.white,
  }
});
