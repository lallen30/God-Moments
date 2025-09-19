import { StyleSheet, Dimensions, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { colors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

type Styles = {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    justifyContent: 'center' as const,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.6,
    height: 200,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.secondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: colors.light,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: colors.black,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
  },
});
