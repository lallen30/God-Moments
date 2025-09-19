import { StyleSheet, ViewStyle, TextStyle, ImageStyle } from 'react-native';

type Styles = {
    [key: string]: ViewStyle | TextStyle | ImageStyle;
};

export const styles = StyleSheet.create<Styles>({});
