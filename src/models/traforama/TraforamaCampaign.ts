import {
  ResponceApiNetwork,
  IdCampaign,
  StatusCampaign,
  Campaign,
  BidCampaign,
  StatsRaw,
  ICampaign
} from '@atsorganization/ats-lib-ntwk-common';
import { CampaignInfo } from './api/Campaign';
import { IHttpResponseTyped } from '../../utils/types/http-response-typed';
import { RESPONSE_CODES } from '../../consts';
import { CreativeInfo } from './api/Creative';
import { ResponseShowCampaign } from './api/ResponseShowCampaign';

export default class TraforamaCampaign extends Campaign {
  /**
   * Создание кампании
   */
  async create(data: ICampaign): Promise<ResponceApiNetwork<Campaign>> {
    if (!this.conn.api_conn) {
      return new ResponceApiNetwork({
        code: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        message: 'No api connection established'
      });
    }

    const templateResponse = await this.getFullDataCampaign(data.template_id)

    if(!templateResponse) {
      return new ResponceApiNetwork({
        code: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        message: 'Fetch campaign template error'
      });
    }

    if (!templateResponse.creatives.length) {
      return new ResponceApiNetwork({
        code: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        message: 'Campaign template have no creatives'
      });
    }

    const campaignTemplate = templateResponse.campaign;
    const creativeTemplates = templateResponse.creatives;

    let excluded_spots: string[] = [];
    let included_spots: string[] = [];

    if (this.placements_data.value?.list) {
      if (!this.placements_data.value.type) {
        included_spots = this.placements_data.value.list;
      } else {
        excluded_spots = this.placements_data.value.list;
      }
    } else {
      if (campaignTemplate.attributes.ron_type === 1) {
        included_spots = campaignTemplate.attributes.spot_ids;
      } else {
        excluded_spots = campaignTemplate.attributes.spot_ids;
      }
    }

    const createdCampaignResponse: IHttpResponseTyped<CampaignInfo> = await this.conn.api_conn.post('v1/campaings/', {
      name: data.name.value,
      country_codes: [data.country.value],
      limits: campaignTemplate.attributes.limits,
      ips: campaignTemplate.attributes.ips,
      language_ids: campaignTemplate.attributes.language_ids,
      whitelist_domains: campaignTemplate.attributes.whitelist_domains,
      blacklist_domains: campaignTemplate.attributes.blacklist_domains,
      use_whitelist_domains: campaignTemplate.attributes.use_whitelist_domains,
      isp: campaignTemplate.attributes.isp,
      start_at: campaignTemplate.attributes.start_at,
      finish_at: campaignTemplate.attributes.finish_at,
      specific_browsers: campaignTemplate.attributes.specific_browsers,
      specific_platforms: campaignTemplate.attributes.specific_platforms,
      hours: campaignTemplate.attributes.hours,
      weekdays: data.schedule?.value,
      browser_ids: campaignTemplate.attributes.browser_ids,
      platform_ids: campaignTemplate.attributes.platform_ids,
      size_id: campaignTemplate.attributes.size_id,
      type_id: campaignTemplate.attributes.type_id,
      stream: campaignTemplate.attributes.stream,
      included_spots,
      excluded_spots,
    });

    const createdCampaign = createdCampaignResponse.data;

    const creativeTemplatesToSave: Record<string, any>[] = []

    for (const creativeTemplate of creativeTemplates) {
      creativeTemplatesToSave.push({
        campaign_id: createdCampaign.id,
        name: creativeTemplate.attributes.name,
        link_url: data.target_url.value ?? creativeTemplate.attributes.link_url,
        aggressive: creativeTemplate.attributes.aggressive,
        prices: creativeTemplate.attributes.prices,
        title: creativeTemplate.attributes.title,
        description: creativeTemplate.attributes.description,
      })
    }

    const createdCreatives: CreativeInfo[] = [];

    for await (const creativeTemplate of creativeTemplatesToSave) {
      const createResponse = await this.conn.api_conn.post('v1/creatives/', creativeTemplate)
      if (createResponse.status === 201) {
        createdCreatives.push(createResponse.data);
      }
    }

    throw new Error('Method not implemented');
  }

  /**
   * Обвноление кампании
   */
  async update(): Promise<ResponceApiNetwork<Campaign>> {
    throw Error('Method not implemented');
  }

  /**
   * Подготовка корректного статуса для API
   */
  private prepareStatus(): StatusCampaign {
    throw new Error('Method not implemented');
  }

  /**
   * Установка расписания кампании
   */
  async updateSchedule(): Promise<ResponceApiNetwork<Campaign>> {
    throw new Error('Method not implemented');
  }

  /**
   * вытянуть все данные по кампании из сети
   */
  async fetch(): Promise<ResponceApiNetwork<Campaign>> {
    throw new Error('Method not implemented');
  }

  /**
   * Создание креатива
   */
  private async createCreative() {
    throw new Error('Method not implemented');
  }

  /**
   * обновлене кампании
   */
  protected async updateRaw() {
    throw new Error('Method not implemented');
  }

  /**
   * создание кампании
   */
  protected async addRaw() {
    throw new Error('Method not implemented');
  }

  /**
   * Получение полной информации по кампании из сети
   */
  private async getFullDataCampaign(campaignId: IdCampaign): Promise<{ campaign: CampaignInfo, creatives: CreativeInfo[] } | null> {
    const data: IHttpResponseTyped<ResponseShowCampaign> = await this.conn.api_conn!.get(
      `v1/campaigns?limit=15&start=0&filter[disabled]=false&filter[state][]=review&filter[state][]=new&filter[state][]=approved&filter[state][]=paused&filter[name__or__id]=${campaignId.value}`
      )

    if (data.status !== 200) {
      return null;
    }

    return { 
      campaign: data.data.data[0],
      creatives: data.data.included,
    }
  }

  /**
   * Получение статуса кампани
   */
  async getStatus(): Promise<ResponceApiNetwork<StatusCampaign>> {
    throw new Error('Method not implemented');
  }

  /**
   * Обновление площадок в кампании
   */
  async updatePlacements(): Promise<ResponceApiNetwork<Campaign>> {
    throw new Error('Method not implemented');
  }

  /**
   * Удаление кампании
   */
  async remove(): Promise<ResponceApiNetwork> {
    throw new Error('Method not implemented');
  }

  private async changeCampaignStatus(): Promise<ResponceApiNetwork> {
    throw new Error('Method not implemented');
  }

  /**
   * Точеченое удаление кампании
   */
  private async removeUnit(): Promise<ResponceApiNetwork> {
    throw new Error('Method not implemented');
  }

  /**
   * Запуск кампании
   */
  async start(): Promise<ResponceApiNetwork> {
    throw new Error('Method not implemented');
  }

  /**
   * Остановка кампании
   */
  async stop(): Promise<ResponceApiNetwork> {
    throw new Error('Method not implemented');
  }

  /**
   * Мин ставка
   */
  async minBid(): Promise<ResponceApiNetwork<BidCampaign>> {
    throw new Error('Method not implemented');
  }

  /**
   * Статистика
   */
  async stats(): Promise<ResponceApiNetwork<StatsRaw>> {
    throw new Error('Method not implemented');
  }
}
