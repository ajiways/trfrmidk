import { CampaignInfo } from "./Campaign"
import { CreativeInfo } from "./Creative"

type ResponseShowCampaignData = CampaignInfo & { 
    relationships: { 
        creatures: { data: { id: string, type: string }[] } 
    } 
}

export interface ResponseShowCampaign {
    data: ResponseShowCampaignData[]
    included: CreativeInfo[],
    meta: { total: number }
}
