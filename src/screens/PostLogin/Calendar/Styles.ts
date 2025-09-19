import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  calendar: {
    marginBottom: 0,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  sectionHeader: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.light,
  },
  sectionTitle: {
    color: colors.black,
    textAlign: 'center',
  },
  titleContainer: {
    backgroundColor: colors.light,
    margin: 15,
    borderRadius: 8,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  eventCard: {
    backgroundColor: colors.white,
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.light,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  eventLocation: {
    fontSize: 14,
    color: colors.dark,
    lineHeight: 20,
  },
  noEventsText: {
    textAlign: 'center',
    color: colors.dark,
    fontSize: 15,
    paddingVertical: 20,
    fontStyle: 'italic',
  },
});
