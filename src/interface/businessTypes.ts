export interface IBusiness {
  name?: string;
  email?: string;
  type?: string;
  locationCoordinates?: {
    latitude: number;
    longitude: number;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}
