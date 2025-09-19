import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    color: colors.secondary,
    marginBottom: 5,
  },
  time: {
    fontSize: 18,
    color: colors.secondary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
    borderTopWidth: 1,
    borderTopColor: colors.light,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: colors.dark,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: colors.dark,
    lineHeight: 24,
  },
  price: {
    fontSize: 18,
    color: colors.secondary,
    fontWeight: '500',
    marginTop: 5,
  },
});
