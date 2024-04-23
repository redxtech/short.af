// schema for redirects list
export type Redirect = {
  from: string;
  to: string;
  key?: string;
  timestamp?: number;
};
