import { View, Text } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Spinner from './Spinner'
export type Toast = {
    message: string,
    type: 'error' | 'success' | 'info' | 'loading'
}

export default function GlobalToast({toast}: {toast: Toast}) {
    const insets = useSafeAreaInsets()
    
  return (
    <View
            style={{
              position: "absolute",
              top: insets.top + 8,
              left: 16,
              right: 16,
              backgroundColor: "#161616",
              borderRadius: 32,
              padding: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              zIndex: 200,
              // flex: 1,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: "#222",
                borderWidth: 1,
                borderColor: "#7a7a7a40",
                borderRadius: 100,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {toast.type === 'success' ? <Ionicons name="checkmark-circle-outline" size={24} color="#4ADE80" />
              : toast.type === 'error' ?
              <Ionicons name="close-circle-outline" size={24} color="#F87171" />
            : toast.type === 'info' ? <Text style={{color: 'white', fontSize: 24}}>!</Text>
            : <Spinner />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#7a7a7a", fontSize: 15, lineHeight: 20 }}>
                {toast.message}
              </Text>
            </View>
          </View>
  )
}