import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme/colors';

// CSS for the WebView content using app theme colors
export const webViewCSS = `
  * {
    box-sizing: border-box;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    padding: 16px;
    margin: 0;
    color: ${colors.dark};
    font-size: 16px;
    line-height: 1.5;
    background-color: ${colors.white};
  }
  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 16px auto;
    border-radius: 8px;
  }
  h2, h3 {
    color: ${colors.black};
    margin: 24px 0 16px 0;
    text-align: center;
    font-weight: bold;
  }
  h2 {
    font-size: 24px;
  }
  h3 {
    font-size: 20px;
  }
  h4 {
    font-size: 16px;
    color: ${colors.medium};
    margin: 8px 0 24px 0;
    text-align: center;
    font-weight: normal;
  }
  p {
    margin: 16px 0;
    color: ${colors.dark};
  }
  .legal-content {
    text-align: left;
    margin-bottom: 32px;
  }
`;

// React Native styles
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.white,
    opacity: 0.99 // Fix for iOS WebView rendering
  },
  noContent: {
    fontSize: 16,
    color: colors.dark,
    textAlign: 'center',
    marginTop: 20
  }
});
