import { IHttpResponse } from "@atsorganization/ats-lib-ntwk-common";

export interface IHttpResponseTyped<T> extends IHttpResponse {
  data: T
}
