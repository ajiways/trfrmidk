export interface CreativeInfo {
  id: string,
  type: "creature",
  attributes: CreativeAttributes
}

export interface CreativeAttributes {
  id: number,
  name: string,
  advert_state: string,
  campaign_id: number,
  asset_processed: false,
  aggressive: false,
  flat_deal: false,
  status_change_reason: string,
  vertical_id: number,
  title: string,
  description: string,
  link_url: string,
  deal_status: string,
  possible_events: string[],
  vertical: string,
  show_processing: false,
  video_preview: string,
  image_preview: string,
  icon_preview: string,
  prices: { id: string, value: number }[],
}
