export interface IZone {
  locationCoordinates: {
    latitude: string;
    longitude: string;
  };
  backupZones?: (string | number)[];
}