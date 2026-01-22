import NetInfo from "@react-native-community/netinfo";
import { ImageBackground } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { addRegistration, clearRegistrations, getAllRegistrations } from '../components/LocalData';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


export default function App() {

  const [text, onChangeText] = React.useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    if (isConnected) {
      const resetRegistrations = async () => {
        try{
          const regs = await getAllRegistrations();
           alert(JSON.stringify(regs));
          if (regs.length === 0) {
            console.log('No local registrations to sync.');
            return;
          }
          for (const reg of regs) {
            // Send to your server.
          }
          await clearRegistrations();

          const afterClear = await getAllRegistrations();
           alert('After clearing DB: ' + JSON.stringify(afterClear));  // list returns null
        }catch(e){
          console.error('Error accessing local registrations.', e);
        }
      };
      resetRegistrations();
    }
    }, [isConnected]);

    const setReg = async () => {      
      if(text.length > 10){
        alert('Not a valid registration.');
        onChangeText('');
        return;
      }
      alert('setReg called');
        if (!text.trim() || text.trim() === 'Enter registration') {
            console.log('No registration entered.');
            return;
        }

        if(!isConnected){ // Offline: Registration saved locally.
          try {
            console.log('About to insert:', text);
            await addRegistration(text);
            alert(JSON.stringify(text));
            console.log('Insert OK');
          } catch (e) {
            console.error('DB insert failed:', e);
          }
            console.log('Offline mode: Registration saved locally:', text);
        } else {
            console.log('Online mode: Registration sent to server:', text); // Placeholder for server submission logic.
        }
        onChangeText('');
    }

    return (
        <View style={styles.container}>
          <ImageBackground source={require('../assets/images/default-background.png')} contentFit="cover" style={styles.image}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              />
              {/*<Text>
                {isConnected ? 'Online Mode' : 'Offline Mode'}
              </Text>*/}
              <TextInput
                style={styles.input}
                onChangeText={onChangeText}
                value={text}
                placeholder="Enter registration"
                placeholderTextColor="#999"
              />
            <Pressable
              style={styles.button}
              onPress={() => {
                console.log('BUTTON PRESSED'); 
                setReg();
              }}
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
    borderBottomWidth: 1,  
    borderBottomColor: '#999', 
    padding: 20,
    textAlign: 'center',
    color: '#fff',
    borderColor: '#fff',
  },
  button: {
    width: '75%',
    height: 50,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    opacity: 1,
  },
});