import NetInfo from "@react-native-community/netinfo";
import { ImageBackground } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { addRegistration, clearRegistrations, deleteRegistrationsByIds, getAllRegistrations, getDB, getRegistrations } from '../components/LocalData';

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
  // Log state changes and trigger an immediate sync when we transition online.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log('NetInfo change:', { isConnected: state.isConnected });
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        // Trigger sync immediately (don't wait for another effect cycle)
        sendLocalRegistrations().catch((e) => console.error('sendLocalRegistrations error on NetInfo change', e));
      }
    });

    // Also fetch current state on mount and kick off sync if already online
    (async () => {
      try {
        const net = await NetInfo.fetch();
        console.log('NetInfo initial fetch isConnected=', net.isConnected);
        setIsConnected(net.isConnected);
        if (net.isConnected) {
          sendLocalRegistrations().catch((e) => console.error('Initial sendLocalRegistrations error', e));
        }
      } catch (e) {
        console.warn('NetInfo.fetch failed', e);
      }
    })();

    return () => unsubscribe();
  }, []); 

  // Effect to handle reconnection and sync local registrations.
  useEffect(() => {
    if (isConnected) {
      const directRegsAfterReconnect = async () => {
        try {
          await getDB();
          // Kick off the chunked send which will delete acknowledged rows.
          await sendLocalRegistrations();
        } catch (e) {
          console.error('Error during reconnection sync', e);
        }
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
  const sendLocalRegistrations = async () => {
    try {
      const chunkSize = 1000;

      while (true) {
        // Fetch the next chunk of rows (id + reg)
        console.log('Fetching next chunk to send...');
        const rows = await getRegistrations(chunkSize);
        if (!rows || rows.length === 0) {
          console.log('No more local registrations to send.');
          alert('No more local registrations to send.');
          break;
        }

        console.log(`Sending chunk of ${rows.length} registrations to server.`);

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
        await deleteRegistrationsByIds(ids);
        console.log(`Deleted ${ids.length} rows after successful send.`);

        // yield so UI and NetInfo can run
        await new Promise(res => setTimeout(res, 0));
      }

      // final state update
      const remaining = await getAllRegistrations();
      setRegistrations(remaining.length);
      if (remaining.length === 0 || remaining === null){
        console.log('sendLocalRegistrations complete. remaining=' + remaining.length);
        alert('sendLocalRegistrations complete. remaining=' + remaining.length);
        return;
      }
      console.log('Remaining=' + remaining.length);
      alert('Remaining=' + remaining.length);
    } catch (e) {
      console.error('Error accessing local registrations. (sendRegistrations)', e);
    }
  };

  // Clear local registrations after successful server ack. Uses chunked DB deletion implemented in `components/LocalData`.
  const clearLocalRegistrations = async (regs: string[] = []) => { 
    console.log('clearRegistrations START');

    try { 
      // Ensure we have the latest set before clearing
      regs = await getAllRegistrations();

      if (!regs || regs.length === 0) {
        console.log('No registrations to clear.');
        setRegistrations(0);
        return;
      }

      // `clearRegistrations` will delete in repeated chunks until empty
      await clearRegistrations();

      // small yield so logs and NetInfo can settle
      await new Promise(res => setTimeout(res, 0));

      const afterClear = await getAllRegistrations(); 
      setRegistrations(afterClear.length); // Final check.
      console.log('After clearing DB:', afterClear.length);
      console.log('clearRegistrations DONE');

    } catch (e) { 
      console.error('Error clearing local registrations.', e); 
    } 
};

  const runBulkTest = async () => {
    console.log('Starting bulk test');

    const total = 100000;
    const regs = Array.from({ length: total }, (_, i) => `REG${i}`); // testing 100,000 entries.
    const chunkSize = 1000;

    for (let i = 0; i < regs.length; i += chunkSize) {
      const chunk = regs.slice(i, i + chunkSize);
      // Insert this batch concurrently but allow event loop to process between batches
      await Promise.all(chunk.map((reg) => setReg(reg)));
      console.log(`Inserted ${Math.min(i + chunkSize, regs.length)}/${regs.length}`);
      await new Promise((res) => setTimeout(res, 10));
    }

    // Explicitly refresh NetInfo after heavy work (some events may have been delayed)
    try {
      const netState = await NetInfo.fetch();
      setIsConnected(netState.isConnected);
    } catch (e) {
      console.warn('Failed to fetch NetInfo after bulk test', e);
    }

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