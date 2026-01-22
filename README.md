# Welcome to the Offline Registration App

When the user is offline and inputting a registration number it is locally saved using 'expo-sqlite'.

*LocalData.tsx* creates, updates, and deletes the local database.

*App.tsx* calls features from *LocalData.tsx* when 'NetInfo' is stating the device is offline.