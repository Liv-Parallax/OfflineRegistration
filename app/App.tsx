import { useNetInfo } from "@react-native-community/netinfo";
import { ImageBackground } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { addRegistration, deleteRegistrationsByIds, getAllRegistrations, getRegistrations } from '../components/LocalData';

import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';


// Issues: 
//   - When the app is reloaded it doesnt proporly send data? - not sure if this will be an issue as when used the app wont be reloaded.


export default function App() {

  const [text, onChangeText] = React.useState('');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [registrations, setRegistrations] = useState<number | null>(null);
  const netInfo = useNetInfo();

  const directRegsAfterReconnect = async () => {
    try {
      let regs = await getAllRegistrations();
      await new Promise(res => setTimeout(res, 2));

      console.log(JSON.stringify(regs))

      if(regs.length === 0 || regs === null){
        console.log("Nothing to direct.");
        alert("Nothing to direct.");
        return;
      }

      alert("Someting to delete: " + regs.length);
      await sendLocalRegistrations(5000);

    } catch (e) {
      console.error('Error during reconnection sync', e);
    }
  };

  useEffect(() => {
    if(netInfo.isConnected === true){
      setIsConnected(true);
      directRegsAfterReconnect();
    } else {
      setIsConnected(false);
    }
  }, [netInfo.isConnected, registrations])   

  
  // Send local registrations to server when back online.
  const sendLocalRegistrations = async (chunkSize: number) => {
    try {

      let regs = await getAllRegistrations();
      await new Promise(res => setTimeout(res, 0));

      let chunkIndex = 0;
      let totalSent = 0;

      while (true) {
        chunkIndex += 1;
        console.log(`Chunk ${chunkIndex}: fetching up to ${chunkSize} rows`);
        const rows = await getRegistrations(chunkSize);
        console.log(`Chunk ${chunkIndex}: got ${rows.length} rows`);

        if (!rows || rows.length === 0) {
          console.log('No more local registrations to send.');
          setRegistrations(0);
          break;
        }

        console.log(`Chunk ${chunkIndex}: Sending ${rows.length} registrations to server.`);

        // Placeholder: send to server. Replace this with real network call. If any item fails, throw and stop.
        try {
          await Promise.all(rows.map(async (r) => {
            // Example placeholder: await sendToServer(r.reg)
            return Promise.resolve();
          }));
        } catch (sendErr) {
          console.error('Error sending a chunk to server, will retry later', sendErr);
          // Stop processing further chunks; leave them for retry on next reconnect
          return;
        }

        // On success delete only the rows we just sent
        const ids = rows.map(r => r.id);
        try {
          await deleteRegistrationsByIds(ids);
          console.log(`Chunk ${chunkIndex}: Deleted ${ids.length} rows after successful send.`);
        } catch (e) {
          console.error('Error deleting sent rows for chunk', chunkIndex, e);
          return;
        }

        totalSent += rows.length;
        alert(`Progress: chunk ${chunkIndex} sent. totalSent=${totalSent}`);

        // yield so UI and NetInfo can run (use slightly longer pause to be safer)
        await new Promise(res => setTimeout(res, 0));
      }

      // final state update
      const remaining = await getAllRegistrations();
      setRegistrations(remaining.length);
      console.log('sendLocalRegistrations complete. totalSent=' + totalSent + ' remaining=' + remaining.length);

    } catch (e) {
      console.error('Error accessing local registrations. (sendRegistrations)', e);
    }
  };

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
      console.log('Online mode: Registration sent to server:', reg); 
      // Placeholder for server submission logic.
    }
    onChangeText('');
  };


  // This slows the selecting and deleting down a lot. - done all offline.
  const runBulkTest = async () => {
    console.log('Starting bulk test');

    const total = 200000;
    const regs = Array.from({ length: total }, (_, i) => `REG${i}`); // testing 200,000 entries.
    const chunkSize = 2500;

    for (let i = 0; i < total; i += chunkSize) {
      const chunk = regs.slice(i, i + chunkSize);
      // Insert this batch concurrently but allow event loop to process between batches
      await Promise.all(chunk.map((reg) => setReg(reg)));
      console.log(`Inserted ${Math.min(i + chunkSize, regs.length)}/${regs.length}`);
      await new Promise((res) => setTimeout(res, 2));
    }
    alert("Ran bulk test.")

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
              onPress={runBulkTest}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: 'tomato',
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
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