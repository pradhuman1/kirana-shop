import { BusinessType } from "../enums/BusinessType";

export interface IBusiness {
  name?: string;
  email?: string;
  type?: BusinessType;
  locationCoordinates?: {
    latitude: string;
    longitude: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  zoneID?: Number | String
}
