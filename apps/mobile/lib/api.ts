import axios from 'axios';
import { Platform } from 'react-native';

const baseURL = Platform.OS === 'android' ? 'http://10.0.2.2:3333' : 'http://localhost:3333';

export const api = axios.create({
  baseURL,
}); 