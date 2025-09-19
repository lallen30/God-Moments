import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { styles } from './Styles';
import { storageService } from '../../../services/storageService';
import { apiService } from '../../../services/apiService';
import { colors } from '../../../theme/colors';

interface Post {
  post_id: string;
  post_title: string;
  post_content: string;
  post_date: string;
  featured_image?: string;
}

interface Category {
  category_id: string;
  category_name: string;
  posts: Post[];
}

interface ApiResponse {
  status: string;
  categories: Category[];
}

const PostsScreen = ({ navigation }: any) => {
  const [groupedPosts, setGroupedPosts] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async (fromRefresh = false) => {
    try {
      // Try to get posts from storage first
      let posts = await storageService.get('posts');
      
      // If no posts in storage or this is a refresh, fetch from API
      if (!posts || fromRefresh) {
        const response = await apiService.fetchAndStorePosts();
        if (response) {
          posts = response;
        }
      }

      if (posts && Array.isArray(posts)) {
        setGroupedPosts(posts);
      } else {
        console.log('No posts found or invalid format');
        setGroupedPosts([]);
      }
    } catch (error) {
      console.error('Error getting posts:', error);
      setGroupedPosts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts(true);
  };

  const handlePostPress = (post: Post) => {
    navigation.navigate('NewsDetail', { 
      id: post.post_id,
      title: post.post_title,
      sourceScreen: 'News'
    });
  };

  // Helper function to format post date
  const formatPostDate = (dateString: string): string => {
    if (!dateString) return '';
    
    console.log('PostsScreen - Original date string:', dateString);
    
    try {
      // Check if the date is in DD-MM-YYYY format
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        const [day, month, year] = dateString.split('-');
        console.log('PostsScreen - Split date parts:', { day, month, year });
        
        // Create date using Date constructor (year, month-1, day)
        // Note: month is 0-indexed in JavaScript Date constructor
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        console.log('PostsScreen - Parsed DD-MM-YYYY date:', date);
        
        if (!isNaN(date.getTime())) {
          const formatted = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          console.log('PostsScreen - Formatted date:', formatted);
          return formatted;
        }
      }
      
      // Try to parse as is for other formats
      const date = new Date(dateString);
      console.log('PostsScreen - Parsed date:', date);
      
      if (isNaN(date.getTime())) {
        // If parsing fails, return the original string
        console.warn('PostsScreen - Invalid date format:', dateString);
        return dateString;
      }
      
      // Format as a readable date
      const formatted = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      console.log('PostsScreen - Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('PostsScreen - Error formatting post date:', error);
      return dateString; // Return original if error
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.dark]}
        />
      }
    >

      {groupedPosts.length > 0 ? (
        <View style={styles.postsContainer}>
          {groupedPosts.map((category) => (
            <View key={category.category_id} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.category_name}</Text>
              {category.posts.map((post) => (
                <TouchableOpacity
                  key={post.post_id}
                  style={styles.postCard}
                  onPress={() => handlePostPress(post)}
                >
                  <Text style={styles.postTitle}>{post.post_title}</Text>
                  <Text style={styles.postDate}>
                    {formatPostDate(post.post_date)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts available</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default PostsScreen;
