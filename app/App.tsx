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
  // Checking every x amount of time. - from Offline to Online.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log("Reconnected.")
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []); 

  // Effect to handle reconnection and sync local registrations.
  useEffect(() => {
    if (isConnected) {
      const directRegsAfterReconnect = async () => {
        try {
          let regs = await getAllRegistrations();
          alert("There are " + regs.length + " (After reconnect).")
          if (regs === null || regs.length === 0) {
            console.log('No local registrations to sync. (After reconnect)');
            return;            
          }
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
      console.log('Sending ' + regs.length + ' registrations to server. (sendRegistrations)');

      const chunkSize = 1000;

      for (let i = 0; i < regs.length; i += chunkSize) {
        const chunk = regs.slice(i, i + chunkSize); // get the sub-array

        //console.log(`Sending chunk ${i / chunkSize + 1} with ${chunk.length} registrations`);
        await Promise.all(chunk.map(reg => {
          // Send to the server.
        }));

        await new Promise(res => setTimeout(res, 0)); // Pause for UI.
      }
      clearLocalRegistrations(5000, regs);

    }catch(e){
      console.error('Error accessing local registrations. (sendRegistrations)', e);
    }
  };

  // TODO: 
  // clear in chunks.
  const clearLocalRegistrations = async (chunkSize: number, regs: string[]) => { 
    console.log('clearRegistrations START');
    
    try { 
      regs = await getAllRegistrations();

      //alert('Before clearing DB: ' + JSON.stringify(regs.length));
      if(regs.length == null) return;

      await clearRegistrations();
      await new Promise(res => setTimeout(res, 0));

      const afterClear = await getAllRegistrations(); 
      setRegistrations(afterClear.length); // Final check.
      console.log('After clearing DB:', afterClear.length);

      //alert('After clearing DB: ' + JSON.stringify(afterClear.length));
      console.log('clearRegistrations DONE');

    } catch (e) { 
      console.error('Error clearing local registrations.', e); 
    } 
};

  const runBulkTest = async () => {
    console.log('Starting bulk test');

    const regs = Array.from({ length: 100000 }, (_, i) => `REG${i}`); // testing 100,000 entries.

    // Insert everything concurrently.
    await Promise.all(regs.map(reg => setReg(reg)));

    console.log('Bulk test complete');
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
              {<Text>
                {isConnected ? 'Online Mode' : 'Offline Mode'}
              </Text>}
              
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