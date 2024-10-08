import node_geocoder, { Options } from "node-geocoder";
import "dotenv/config";

type GetGeoCodeLocation = {
  postcodeOrAddress: string
};

const options: Options = {
  provider: "mapquest",
  apiKey: process.env.GEO_CODER_API_KEY,
  formatter: null,
};

export const geocoder = node_geocoder(options);

export async function getGeoCodeLocation({
postcodeOrAddress
}: GetGeoCodeLocation) {

  const location = await geocoder.geocode(postcodeOrAddress);

  return location;
}
