import {
  NetworkConnection,
  Campaign,
  HttpInstance,
  IHttpConfig,
  IHttpResponse,
  Account,
  SetCookies,
} from '@atsorganization/ats-lib-ntwk-common';
import TraforamaCampaign from './TraforamaCampaign';
import TraforamaAccount from './TraforamaAccount';
import { Logger } from '@atsorganization/ats-lib-logger';
import { IResultFullDataCampaignCountryItem } from './Traforama';

export default class TraforamaConnection extends NetworkConnection {
  /**
   * Инициализация коллекций
   */
  protected async initColletions(): Promise<void> {
    const externalUrlGetALlCountries = 'https://restcountries.com/v3.1/all';
    const externalUrlCountries = 'api/autocomplete/searchcountries/search/';
    if (this.network.collections && this.admin_conn) {
      const allCountries = await HttpInstance.request({
        url: externalUrlGetALlCountries,
        method: 'GET'
      }).then((d: IHttpResponse) => d.data);

      this.network.collections.countries = await this.admin_conn?.get(externalUrlCountries).then((r: IHttpResponse) => {
        return r.data.data.map((m: IResultFullDataCampaignCountryItem) => {
          return {
            ...m,
            code: allCountries.find((f: any) => f.name.common.toLowerCase() === m.titleEn.toLowerCase())?.cca2
          };
        });
      });
    }
  }

  /**
   * Авторизация в сети
   * @returns
   */
  private async auth(): Promise<string> {
    const authHeaders = {
      'X-ASG-AUTH-EMAIL': this.network.login,
      'X-ASG-AUTH-TOKEN': this.network.api_key
    }

    new Logger({}).setNetwork(this.network.name).setDescription('Получаем авториз. данные из СЕТИ').log();
    const loginResponse = await HttpInstance.request({
      url: this.network.base_url_api + 'v1/user',
      method: 'GET',
      headers: authHeaders
    });

    const { _asg__session: authCookie } = SetCookies.parse(loginResponse.headers?.['set-cookie'])

    const readyCookie = `_asg__session=${authCookie?.value};}`;
    new Logger(readyCookie).setNetwork(this.network.name).setDescription('Получены авториз. данные из СЕТИ').log();
    return readyCookie;
  }

  /**
   * Открытие соединения
   * @returns
   */
  async open(): Promise<NetworkConnection> {
    let authData = await this.getCashe();
    if (!authData) {
      authData = await this.auth();
      await this.setCache(authData);
    }
    this.api_conn = new HttpInstance({
      baseUrl: this.network?.base_url_api,
      headers: {
        Cookie: authData,
        'X-ASG-AUTH-EMAIL': this.network.login,
        'X-ASG-AUTH-TOKEN': this.network.api_key
      }
    });
    this.admin_conn = new HttpInstance({
      baseUrl: this.network?.base_url_admin,
      headers: {
        Cookie: authData,
        'X-ASG-AUTH-EMAIL': this.network.login,
        'X-ASG-AUTH-TOKEN': this.network.api_key
      }
    });
    this.keepAlive();
    // await this.initColletions();
    return this;
  }

  getCampaign(): Campaign {
    return new TraforamaCampaign(this);
  }

  getAccount(): Account {
    return new TraforamaAccount(this);
  }

  /**
   * Поддержание соежинения в живых
   */
  keepAlive(): void {
    // admin conn
    const callbackErrAdmin = async (response: { config: IHttpConfig; status?: number }): Promise<any> => {
      return response;
    };

    // api conn
    const callbackErrApi = async (response: { config: IHttpConfig; status?: number }): Promise<any> => {
      if (response.status === 401 && response.config && !response.config.__isRetryRequest) {
        new Logger({}).setDescription('keepAlive 401').setNetwork(this.network.name).log();
        return await this.auth().then(async (authData: string) => {
          response.config.__isRetryRequest = true;
          response.config.baseUrl = this.network?.base_url_api;
          response.config.headers = {
            Cookie: authData,
            'X-ASG-AUTH-EMAIL': this.network.login,
            'X-ASG-AUTH-TOKEN': this.network.api_key
          };
          await this.setCache(authData);
          this.api_conn = new HttpInstance({
            baseUrl: this.network?.base_url_api,
            headers: { 
              Cookie: authData,
              'X-ASG-AUTH-EMAIL': this.network.login,
              'X-ASG-AUTH-TOKEN': this.network.api_key
            }
          });
          return HttpInstance.request?.(response.config);
        });
      }
      return response;
    };


    this.api_conn?.keepAlive(async (config: IHttpConfig) => config, callbackErrApi);
    this.admin_conn?.keepAlive(async (config: IHttpConfig) => config, callbackErrAdmin);
  }
}
