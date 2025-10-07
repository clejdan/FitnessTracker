import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ScreenTransition({ children, isVisible, transitionType = 'slideFromRight' }) {
  const animatedValue = useRef(new Animated.Value(isVisible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible]);

  const getTransitionStyle = () => {
    switch (transitionType) {
      case 'slideFromRight':
        return {
          transform: [{
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [screenWidth, 0],
            }),
          }],
          opacity: animatedValue,
        };
      case 'slideFromLeft':
        return {
          transform: [{
            translateX: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-screenWidth, 0],
            }),
          }],
          opacity: animatedValue,
        };
      case 'slideFromBottom':
        return {
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [screenHeight, 0],
            }),
          }],
          opacity: animatedValue,
        };
      case 'slideFromTop':
        return {
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [-screenHeight, 0],
            }),
          }],
          opacity: animatedValue,
        };
      case 'fade':
        return {
          opacity: animatedValue,
        };
      case 'scale':
        return {
          transform: [{
            scale: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            }),
          }],
          opacity: animatedValue,
        };
      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={[{ flex: 1 }, getTransitionStyle()]}>
      {children}
    </Animated.View>
  );
}
