import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, useWindowDimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import { storageService } from '../../../services/storageService';
import { styles as globalStyles } from './PostStyles';
import { colors } from '../../../theme/colors';

// Define the type for route.params
interface RouteParams {
  id: string;
  sourceScreen?: string;
}

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_date: string;
  featured_image?: string;
  pdf_file?: string;
}

const PostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const postId = route.params?.id;
  const sourceScreen = route.params?.sourceScreen;

  const handleBackPress = () => {
    if (sourceScreen === 'News') {
      navigation.navigate('News' as never);
    } else {
      navigation.navigate('Home' as never);
    }
  };

  useEffect(() => {
    console.log('Post ID:', postId);
    loadPost();
  }, [postId]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={colors.headerFont} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, sourceScreen]);

  const loadPost = async () => {
    try {
      const categories = await storageService.get('posts');
      console.log('Categories fetched from storage:', categories);
      if (categories && Array.isArray(categories)) {
        for (const category of categories) {
          const foundPost = category.posts.find((p: Post) => p.post_id.toString() === postId?.toString());
          if (foundPost) {
            console.log('Found post:', foundPost);
            setPost(foundPost);
            navigation.setOptions({
              headerTitle: foundPost.post_title,
            });
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error loading post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    console.log('Post not found or null');
  } else {
    console.log('Post details:', post);
    console.log('Featured image URL:', post.featured_image);
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown Date';
    
    console.log('PostScreen - Original date string:', dateString);
    
    try {
      // Check if the date is in DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        console.log('PostScreen - Split date parts:', { day, month, year });
        
        // Create date using Date constructor (year, month-1, day)
        // Note: month is 0-indexed in JavaScript Date constructor
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        console.log('PostScreen - Parsed DD-MM-YYYY date:', date);
        
        if (!isNaN(date.getTime())) {
          const formatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          console.log('PostScreen - Formatted date:', formatted);
          return formatted;
        }
      }
      
      // Try to parse as is for other formats
      const date = new Date(dateString);
      console.log('PostScreen - Parsed date:', date);
      
      if (isNaN(date.getTime())) {
        // If parsing fails, return the original string
        console.warn('PostScreen - Invalid date format:', dateString);
        return dateString;
      }
      
      // Format as a readable date
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      console.log('PostScreen - Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('PostScreen - Error formatting date:', error);
      return dateString; // Return original if error
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      {post?.featured_image && (
        <Image
          source={{ uri: post.featured_image }}
          style={globalStyles.featuredImage}
          resizeMode="cover"
        />
      )}
      <View style={globalStyles.content}>
        <Text style={globalStyles.title}>{post?.post_title || 'Untitled Post'}</Text>
        <Text style={globalStyles.date}>{post?.post_date ? formatDate(post.post_date) : 'Unknown Date'}</Text>
        
        {/* PDF Button */}
        {post?.pdf_file && (
          <TouchableOpacity 
            style={styles.pdfButton}
            onPress={() => (navigation as any).navigate('PDFWebView', {
              pdfUrl: post.pdf_file,
              title: post.post_title,
              sourceScreen: sourceScreen,
              postId: postId
            })}
          >
            <Icon name="document-text" size={20} color={colors.white} style={styles.pdfIcon} />
            <Text style={styles.pdfButtonText}>View Article</Text>
          </TouchableOpacity>
        )}
        
        <RenderHtml
          contentWidth={width - 32}
          source={{ html: post?.post_content || '' }}
          tagsStyles={{
            body: {
              color: colors.black,
              fontSize: 16,
              lineHeight: 24,
            },
            a: {
              color: colors.primary,
              textDecorationLine: 'underline',
            },
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pdfButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pdfIcon: {
    marginRight: 8,
  },
  pdfButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PostScreen;
