import { RESPONSE_CODES } from '../../consts';
import {
  Account,
  BalanceAccount,
  ResponceApiNetwork,
  StatsAccount
} from '@atsorganization/ats-lib-ntwk-common';
import { isNotEmpty } from '../../utils/is-not-emtpy';

export default class TraforamaAccount extends Account {
  /**
   * Получение баласна
   */
  async getBalance(): Promise<ResponceApiNetwork<BalanceAccount>> {
    const responseBalance = await this.conn.api_conn?.get('v1/user').then(r => r.data);

    const account = responseBalance?.data;

    const balance = isNotEmpty(account?.attributes?.balance) ? String(account?.attributes?.balance) : undefined;

    if (balance) {
      this.setBalance(new BalanceAccount(Number(balance)));
    }

    return new ResponceApiNetwork({
      code: balance ? RESPONSE_CODES.SUCCESS : RESPONSE_CODES.INTERNAL_SERVER_ERROR,
      message: balance ? 'OK' : JSON.stringify(responseBalance),
      data: balance ? new BalanceAccount(Number(balance)) : undefined
    });
  }

  /**
   * Получить данные аккаунта из сети
   */
  fetch(): Promise<ResponceApiNetwork<Account>> {
    throw new Error('Method not implemented.');
  }

  /**
   * Статистика по аккаунту
   */
  async stats(dateFrom: string, dateTo: string): Promise<ResponceApiNetwork<StatsAccount>> {
    const datesPrepare = [dateFrom, dateTo];

    for (let i = 0; i < datesPrepare.length; i++) {
      const dateComponents = datesPrepare[i].split('-');
      datesPrepare[i] = dateComponents[2] + '.' + dateComponents[1] + '.' + dateComponents[0];
    }

    const reportData = await this.conn.api_conn?.get(`report?period=${datesPrepare[0]}+-+${datesPrepare[1]}`)

    if (!reportData) {
      return new ResponceApiNetwork({
        code: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
        message: 'Fetch stats data error'
      });
    }

    const data = new StatsAccount({
      cost: reportData?.data?.cost,
      impressions: reportData?.data?.impressions,
      report_date: dateFrom + '-' + dateTo
    });

    return new ResponceApiNetwork({
      code: RESPONSE_CODES.SUCCESS,
      message: 'OK',
      data
    });
  }
}
