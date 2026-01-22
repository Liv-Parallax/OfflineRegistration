import { ImageBackground } from 'expo-image';
import React from 'react';

import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


export default function App() {

  const [text, onChangeText] = React.useState('Enter registration');

    return (
        <View style={styles.container}>
          <ImageBackground source={require('../assets/images/default-background.png')} resizeMode="cover" style={styles.image}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              />
              <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                placeholder="Enter validation code"
                placeholderTextColor="#999"
              />
            <Pressable
              style={styles.button}
              onPress={() => Alert.alert('Code received:', text)}
>
              <Text style={styles.buttonText}>Next</Text>
            </Pressable>

            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#000000',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 40,
  },
  input: {
    height: 50,
    width: '75%',
    margin: 5,
    borderWidth: 1,
    borderRadius: 10, 
    padding: 20,
    textAlign: 'center',
    color: '#fff',
    borderColor: '#fff',
  },
  button: {
    width: '75%',
    height: 50,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    opacity: 1,
  },
});
