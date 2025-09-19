import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger,
    textAlign: 'center',
  },
  featuredImage: {
    width: width,
    height: width * 0.6,
    backgroundColor: colors.secondary,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: colors.dark,
    marginBottom: 16,
  },
});
