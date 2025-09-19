import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0,
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
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: colors.light,
    color: colors.primary,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: -10,
    marginBottom: 10,
    marginLeft: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.dark,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCheckboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
    fontSize: 16,
    marginLeft: 5,
  },
});
