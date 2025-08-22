export interface RemoteOpenOptions {
  fileName?: string;
  token?: string;          
  withCredentials?: boolean; 
  extraHeaders?: Record<string, string>;
}