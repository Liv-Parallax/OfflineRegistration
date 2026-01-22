import NetInfo from "@react-native-community/netinfo";
import { ImageBackground } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { addRegistration } from '../components/AddReg';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


export default async function App() {

  const [text, onChangeText] = React.useState('Enter registration');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);  

    const setReg = async () => {      

        if(!isConnected){ // Offline: Registration saved locally.
            try {
            console.log('About to insert:', text);
            addRegistration(text);
            console.log('Insert OK');
          } catch (e) {
            console.error('DB insert failed:', e);
          }
            console.log('Offline mode: Registration saved locally:', text);
        } else {
            console.log('Online mode: Registration sent to server:', text);
        }
    }

    if(isConnected){
        // Send any locally saved registrations to the server...
        //const allRows = await db.getAllAsync<{Reg: string}>('SELECT * FROM Registration');     
           // for (const row of allRows) {
           //   console.log(row.Reg);
          //  } // currently printing the records... However, here is where you'd send them to the server.
      //  console.log('Online mode: Sending locally saved registration to server:', text);
    } else if (!isConnected){
        console.log('Offline mode.')
    } else{
        console.log('Online mode.')
    }

    return (
        <View style={styles.container}>
          <ImageBackground source={require('../assets/images/default-background.png')} contentFit="cover" style={styles.image}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              />
              <Text>
                {isConnected ? 'Online Mode' : 'Offline Mode'}
              </Text>
              <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                placeholder="Enter registration"
                placeholderTextColor="#999"
              />
            <Pressable
              style={styles.button}
              onPress={() => setReg()}
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
