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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 15,
    backgroundColor: colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: colors.dark,
    marginTop: 4,
  },
  infoSection: {
    padding: 20,
    backgroundColor: colors.white,
    borderRadius: 8,
    margin: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  icon: {
    marginRight: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.light,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.white,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
});
