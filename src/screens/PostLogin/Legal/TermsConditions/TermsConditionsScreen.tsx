import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import axiosRequest from '../../../../utils/axiosUtils';
import { API } from '../../../../config/apiConfig';
import { WebView } from 'react-native-webview';
import { LoadingSpinner } from '../../../../components/LoadingSpinner';
import { styles } from './Styles';
import { getWebViewTemplate } from './TermsConditionsWebView';
import { environment } from '../../../../config/environment';

const TermsConditionsScreen = () => {
  const [termsContent, setTermsContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getTermsConditions();
  }, []);

  const cleanHtml = (html: string) => {
    // Extract content between <body> tags if present
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : html;

    // Remove scripts, links, and styles
    content = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    content = content.replace(/<link[^>]*>/gi, '');
    content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove WordPress specific comments
    content = content.replace(/<!--[\s\S]*?-->/g, '');
    
    // Clean up image tags
    content = content.replace(/loading="lazy"\s/g, '');
    content = content.replace(/decoding="async"\s/g, '');
    content = content.replace(/\sonerror="[^"]*"/g, '');

    // Fix image URLs - convert to absolute URLs
    const serverBaseUrl = `${environment.serverProtocol}://${environment.server}`;
    
    // Process all image tags to use absolute URLs
    content = content.replace(
      /<img([^>]+)src=[\"\'](\/?[^\"\']+)[\"\'](\s*[^>]*)>/gi,
      (match, beforeSrc, src, afterSrc) => {
        console.log('Found image with src:', src);
        
        // Only modify relative URLs
        if (src.startsWith('/') || (!src.startsWith('http') && !src.startsWith('data:'))) {
          const absoluteUrl = src.startsWith('/') 
            ? `${serverBaseUrl}${src}` 
            : `${serverBaseUrl}/${src}`;
          
          console.log('Converted URL:', absoluteUrl);
          return `<img${beforeSrc}src="${absoluteUrl}"${afterSrc}>`;
        }
        
        return match; // Keep absolute URLs as they are
      }
    );

    return content;
  };

  const getTermsConditions = async () => {
    setIsLoading(true);
    try {
      // Use the endpoint directly since MOBILEAPI is already included in the base URL
      const url = API.ENDPOINTS.GET_TERMS_PAGE;
      console.log('Fetching terms & conditions from:', url);
      
      const response = await axiosRequest.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Terms & Conditions API Response:', JSON.stringify(response, null, 2));
      
      // Check different possible response structures
      if (response?.data?.terms_page?.[0]?.post_content) {
        // WordPress-style response
        const cleanContent = cleanHtml(response.data.terms_page[0].post_content);
        const content = getWebViewTemplate(cleanContent);
        console.log('Using WordPress-style response format');
        setTermsContent(content);
      } else if (response?.data?.content) {
        // Direct content in response
        const cleanContent = cleanHtml(response.data.content);
        const content = getWebViewTemplate(cleanContent);
        console.log('Using direct content format');
        setTermsContent(content);
      } else if (response?.data) {
        // Try to use the entire data object as a string
        console.log('Using raw data as content');
        const content = getWebViewTemplate(JSON.stringify(response.data, null, 2));
        setTermsContent(content);
      } else {
        console.warn('Unexpected API response format:', response);
      }
    } catch (error: any) {
      console.error('Error getting terms & conditions content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        {termsContent ? (
          <WebView
            source={{ html: termsContent }}
            style={styles.webView}
            originWhitelist={['*']}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView error: ', nativeEvent);
            }}
            startInLoadingState={true}
            renderLoading={() => <LoadingSpinner />}
            showsVerticalScrollIndicator={true}
            bounces={true}
            automaticallyAdjustContentInsets={true}
            injectedJavaScript={`
              true; // Required by iOS
            `}
          />
        ) : (
          <Text style={styles.noContent}>No content available</Text>
        )}
      </View>
    </View>
  );
};

export default TermsConditionsScreen;
