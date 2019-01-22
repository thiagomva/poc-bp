import { cloneDeep } from 'lodash';
var configData = require('./assets/config.json');
const loadData = () => cloneDeep(configData);
export const server_url = loadData.server_url;
export const ethereum_network = loadData.ethereum_network;
