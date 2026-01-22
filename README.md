# Welcome to the Offline Registration App

When the user is offline and inputting a registration number it is locally saved using 'expo-sqlite'.

__LocalData.tsx__ creates, updates, and deletes the local database.

__App.tsx__ calls features from __LocalData.tsx__ when 'NetInfo' is stating the device is offline.