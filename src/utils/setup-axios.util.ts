import axios from 'axios';
import { API_URL } from '../constants/global.constants';

const setupAxios = () => {
  axios.defaults.baseURL = API_URL;
};

export default setupAxios;
