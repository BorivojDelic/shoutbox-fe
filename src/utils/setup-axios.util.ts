import axios from 'axios';

const setupAxios = () => {
  axios.defaults.baseURL = `${process.env.REACT_APP_SERVER_URL}/api`;
};

export default setupAxios;
