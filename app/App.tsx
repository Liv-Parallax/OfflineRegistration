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
  const [registrations, setRegistrations] = useState<number | null>(null);

  // Monitor network connectivity changes.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []); 
  // Effect to handle reconnection and sync local registrations.
  useEffect(() => {
    if (isConnected) {
      const directRegsAfterReconnect = async () => {
        try {
          const regs = await getAllRegistrations();
          if (regs === null || regs.length === 0) {
            console.log('No local registrations to sync. (After reconnect)');
            return;            
          }
          alert('To sync: ' + registrations + ' registrations. (After reconnect)');
          console.log(regs.length + ' registrations to sync. (After reconnect)');
          sendLocalRegistrations(regs);
        } catch (e) {}
      };        
      directRegsAfterReconnect();      
    }
  }, [isConnected, registrations]);         
  

  // Online/Offline direction for either saving a reg locally or sending to server.
  const setReg = async (value?: string) => {
    const reg = value ?? text;  
    if(reg.length > 10){
      alert('Please enter a valid registration.');
      onChangeText('');
      return;
    }
    if (!reg.trim() || reg.trim() === 'Enter registration') {
        console.log('No registration entered.');
        return;
    }

    if(!isConnected){ // Offline: Registration saved locally.
      try {
        await addRegistration(reg);
      } catch (e) {}
    } else {
      console.log('Online mode: Registration sent to server:', reg); // Placeholder for server submission logic.
    }
    onChangeText('');
  };
  // Send local registrations to server when back online.
  const sendLocalRegistrations = async (regs: string[]) => {
    try{
      if (regs.length === 0) {
        return;
      }

      alert('Sending ' + regs.length + ' registrations to server. (sendRegistrations)');
      console.log('Sending ' + regs.length + ' registrations to server. (sendRegistrations)');

      for (const reg of regs) {
        // Send to your server.
      }

      clearLocalRegistrations(regs);

    }catch(e){
      console.error('Error accessing local registrations. (sendRegistrations)', e);
    }
  };
  // Clear local registrations after successful sync.
  const clearLocalRegistrations = async (regs: string[]) => {
    try {
      await clearRegistrations();
      const afterClear = await getAllRegistrations();
      if (afterClear.length === 0) {
        console.log('Local registrations cleared after sync. (clearLocalRegistrations)');
      } else{
        setRegistrations(afterClear.length);
      }
      console.log('(clearLocalRegistrations. After clearing DB:', afterClear);
      alert('After clearing DB: ' + JSON.stringify(afterClear));

    } catch (e) {
      console.error('Error clearing local registrations.', e);
    }
  };


  // Testing. - 10,000 registrations.
  const runBulkTest = async () => {
    console.log('Starting bulk test');

    for (let i = 0; i < 10000; i++) { 
      const fakeReg = `REG${i}`; 
      await setReg(fakeReg);

      await new Promise(res => setTimeout(res, 0));
    }
  };

    //button:
    // <Pressable 
    //             style={styles.button} 
    //             onPress={() => { console.log('BUTTON PRESSED'); setReg(); }} 
    //             > 
    //             <Text style={styles.buttonText}>Next</Text> 
    //           </Pressable>
    // Button when not bulk testing.
    

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
              {__DEV__ && (
            <Pressable
              style={[styles.button, { backgroundColor: 'tomato' }]}
              onPress={runBulkTest}
            >
            <Text style={styles.buttonText}>Run Bulk Test</Text>
            </Pressable>
            )}
              
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