import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: width * 0.6,
    height: 300,
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
    color: colors.dark,
    backgroundColor: colors.light,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCheckboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.dark,
  },
  button: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  link: {
    color: colors.secondary,
    fontSize: 16,
  },
});
