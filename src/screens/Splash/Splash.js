import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { images } from '../../resources/images'
import { useDispatch } from 'react-redux'
import { stayLoginAction } from '../../store/authSlice/auth.actions'

const Splash = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(stayLoginAction())
    }, [])
    return (
        <View style={styles.container}>
            <Image
                source={images.splash}
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

