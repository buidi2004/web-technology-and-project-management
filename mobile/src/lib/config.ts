import { Platform } from 'react-native';

const env = process.env as Record<string, string | undefined>;
const fallback = Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

/**
 * Android emulator dùng 10.0.2.2. Thiết bị thật: đặt EXPO_PUBLIC_API_URL
 * bằng IP LAN của máy chạy API, ví dụ http://192.168.1.10:5000.
 */
export const API_BASE_URL = (env.EXPO_PUBLIC_API_URL ?? fallback).replace(/\/+$/, '');
