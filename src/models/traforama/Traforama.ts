import { Network, NetworkConnection } from '@atsorganization/ats-lib-ntwk-common';
import TraforamaConnection from './TraforamaConnection';
import RedisCache from '@atsorganization/ats-lib-redis';

export interface IResultFullDataCampaignCountryItem {
  value: string;
  label: string;
  titleEn: string;
  code?: string;
}

export default class Traforama extends Network {
  constructor(login: string, password: string, api_key: string, redisCache: RedisCache = new RedisCache()) {
    super(login, password, api_key, redisCache);
    this.base_url_api = 'https://api.adspyglass.com/api/';
    this.base_url_admin = 'https://traforama.com/';
    this.name = 'traforama';
  }
  async createConnection(): Promise<NetworkConnection> {
    return await new TraforamaConnection(this).open();
  }
}
