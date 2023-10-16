import axios from "axios";
import { RU_CAPTCHA_BASE_URL } from "../consts";


export default class RuCaptcha {
    private api_key: any;
    private min_await_sec: number = 10;
    private base_url: any = RU_CAPTCHA_BASE_URL;
    constructor(api_key: any) {
        this.api_key = api_key;
    }

    async sendReCaptcha(site_key: any, site_url: any): Promise<any> {
        const url = this.base_url + 'in.php'
        const method = 'userrecaptcha';
        const params = 'key=' + this.api_key + '&method=' + method + '&googlekey=' + site_key + '&pageurl=' + site_url;
        console.log(1111, url, params);
        const res_id = await axios.post(url, params)
        return res_id.data.split('|')[1];
    }

    async result(id: any): Promise<any> {
        let res;
        const await_sec = this.min_await_sec * 1000;
        const url = this.base_url + 'res.php'
        const params = 'key=' + this.api_key + '&action=get&id=' + id;
        console.log('id_resolve_recapcha', id);
        let promise = 'CAPCHA_NOT_READY';
        while (promise === 'CAPCHA_NOT_READY') {
            promise = await new Promise((resolve, reject) => {
                setTimeout(async () => {
                    resolve(await axios.get(url + '?' + params).then(r => r.data));
                }, await_sec);
            });
        }
        return promise.split('|')[1];
    }
}