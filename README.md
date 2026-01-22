# Welcome to the Offline Registration App

When the user is offline and inputting a registration number it is locally saved using 'expo-sqlite'.

_LocalData.tsx_ creates, updates, and deletes the local database.

_App.tsx_ calls features from _LocalData.tsx_ when 'NetInfo' is stating the device is offline.