import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  header: {
    padding: 16,
    backgroundColor: colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.headerFont,
  },
  postsContainer: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  postDate: {
    fontSize: 14,
    color: colors.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
  },
});
