import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

const Splash = ({ onFinish }) => {
    useEffect(() => {
        // Show splash screen for a minimum duration to ensure users see it
        const timer = setTimeout(() => {
            onFinish && onFinish();
        }, 3000); // Show for 3 seconds minimum

        return () => clearTimeout(timer);
    }, [onFinish])
    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/splash/splash.png')}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#271E5C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    }
})

export default Splash

