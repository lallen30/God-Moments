import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NavigationProps {
  navigation: any;
  route: {
    name: string;
  };
}

export const withNavigationWrapper = (WrappedComponent: React.ComponentType<any>) => {
  return function WithNavigationWrapper(props: NavigationProps) {
    const { navigation, route } = props;
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // Update checks disabled - removing the Terms/Privacy update requirement
      console.log('Navigation wrapper loaded for route:', route.name);
    }, [route]);

    // checkForUpdates function removed - no longer checking for Terms/Privacy updates

    // If there's an error, show it but still render the component
    if (error) {
      console.warn('NavigationWrapper encountered an error:', error);
      // We could show an error UI here, but for now we'll just log it and continue
    }

    // Render the wrapped component without any loading overlay
    return (
      <View style={styles.container}>
        <WrappedComponent {...props} />
      </View>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default withNavigationWrapper;
