import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../../../theme/colors';

interface RouteParams {
  pdfUrl: string;
  title?: string;
  sourceScreen?: string;
  postId?: string;
}

const PDFWebView = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { pdfUrl, title, sourceScreen, postId } = route.params;

  // Create platform-specific PDF URL
  const getPdfViewerUrl = (url: string) => {
    if (Platform.OS === 'android') {
      // Use Google Docs Viewer for Android
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;
    }
    // Use direct URL for iOS (native PDF support)
    return url;
  };

  const handleBackPress = () => {
    // Navigate back to the individual post/article page
    if (postId) {
      (navigation as any).navigate('NewsDetail', {
        id: postId,
        sourceScreen: sourceScreen
      });
    } else if (sourceScreen === 'News') {
      navigation.navigate('News' as never);
    } else {
      navigation.navigate('Home' as never);
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerTitle: title || 'Article',
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={colors.headerFont} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, sourceScreen]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: getPdfViewerUrl(pdfUrl) }}
        style={styles.webview}
        startInLoadingState={true}
        scalesPageToFit={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        allowsFullscreenVideo={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
        onLoadStart={() => {
          console.log('PDF loading started for:', Platform.OS);
        }}
        onLoadEnd={() => {
          console.log('PDF loading completed for:', Platform.OS);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webview: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default PDFWebView;
