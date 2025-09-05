import { View, Text, Animated, Easing } from 'react-native'
import React, { useEffect, useRef } from 'react'
import Svg, { Circle, Path } from 'react-native-svg'
// import Animated, { useSharedValue } from 'react-native-reanimated'

export default function Spinner({size = 24, color = '#fff'}) {
    const rotateAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start()
    }, [rotateAnim])

    const spin  = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    })
  return (
    <Animated.View style={{transform: [{ rotate: spin}], width: size, height: size}}>
        <Svg height={size} width={size} viewBox='0 0 24 24'>
            <Circle
                cx={'12'}
                cy={'12'}
                r={'10'}
                stroke={color}
                strokeWidth={'4'}
                opacity={'0.25'}
                fill={'none'}
                />
            <Path 
                d='M4 12a8 8 0 018-8v4a4 4  0 00-4 4H4z'
                fill={color}
                opacity={'0.75'}
            />
        </Svg>
      {/* <Text>Spinner</Text> */}
    </Animated.View>
  )
}