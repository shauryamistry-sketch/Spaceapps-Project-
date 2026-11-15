/**
 * marsCoordinates.js
 *
 * Converts Mars geographic coordinates (latitude / longitude) to Leaflet
 * CRS.Simple pixel coordinates for the mars-base_4k.jpg map image.
 *
 * The image is a 2:1 rectangular global Mars raster, consistent with an
 * equirectangular (plate carrée) projection. The JPEG has no projection or
 * longitude-origin metadata, so the projection and -180° west-edge convention
 * below follow the existing project convention and remain an assumption.
 *   - Width  covers 360° of longitude  (–180° … +180°, or equivalently 0°…360°)
 *   - Height covers 180° of latitude   (–90° … +90°)
 *   - Latitude origin is at the top of the image (north pole)
 *   - Leaflet CRS.Simple uses positive Y northward, so north maps to the
 *     upper edge of the image bounds.
 *
 * IMAGE DIMENSIONS (actual, not assumed):
 *   Width  = 800 px
 *   Height = 400 px
 *
 * To update if the image is replaced with a different projection, adjust
 * the formula inside latLonToMapCoordinates accordingly.
 *
 * LONGITUDE CONVENTION:
 *   Mission coordinates are east-positive and may use either 0°–360° or
 *   –180°–+180°. Values are wrapped into the configured map interval.
 */

/** Dimensions of the existing /public/images/mars-base_4k.jpg (800×400 px). */
export const MAP_WIDTH = 800;
export const MAP_HEIGHT = 400;
export const MAP_PROJECTION = 'equirectangular';

export const DEFAULT_MAP_CONFIG = Object.freeze({
  width: MAP_WIDTH,
  height: MAP_HEIGHT,
  westLongitude: -180,
  eastLongitude: 180,
  southLatitude: -90,
  northLatitude: 90,
});

/**
 * Convert a Mars geographic position to Leaflet CRS.Simple [lat, lng] pixels.
 *
 * @param {number} marsLat  Geographic latitude  in degrees  (–90 … +90, N positive)
 * @param {number} marsLon  Geographic longitude in degrees (–180 … +180, E positive)
 *                          Values outside –180…+180 are wrapped automatically.
 * @returns {[number, number]}  Leaflet [y, x] pixel coordinates
 */
export function latLonToMapCoordinates(marsLat, marsLon, config = DEFAULT_MAP_CONFIG) {
  const { width, height, westLongitude, eastLongitude, southLatitude, northLatitude } = config;
  if (![marsLat, marsLon, width, height, westLongitude, eastLongitude, southLatitude, northLatitude].every(Number.isFinite)) {
    throw new TypeError('Mars coordinates and map configuration must contain finite numbers.');
  }
  if (width <= 0 || height <= 0 || eastLongitude <= westLongitude || northLatitude <= southLatitude) {
    throw new RangeError('Map dimensions and geographic bounds must have positive spans.');
  }

  // Wrap longitudes into the configured map interval while preserving its
  // eastward direction (e.g. 225.7°E becomes 134.3°W on a -180..180 map).
  const longitudeSpan = eastLongitude - westLongitude;
  const lon = ((marsLon - westLongitude) % longitudeSpan + longitudeSpan) % longitudeSpan + westLongitude;
  const latitude = Math.max(southLatitude, Math.min(northLatitude, marsLat));

  // ImageOverlay bounds use CRS.Simple [[south-west], [north-east]]. In this
  // coordinate space +Y points north, placing north latitudes at the top edge.
  const x = ((lon - westLongitude) / longitudeSpan) * width;
  const y = ((latitude - southLatitude) / (northLatitude - southLatitude)) * height;
  return [y, x];
}

/**
 * Returns the full Leaflet bounds for the Mars map image.
 * Use as: imageBounds={getMapBounds()} in ImageOverlay.
 */
export function getMapBounds(config = DEFAULT_MAP_CONFIG) {
  // CRS.Simple: [[bottom-left-y, bottom-left-x], [top-right-y, top-right-x]]
  return [[0, 0], [config.height, config.width]];
}

/**
 * Returns the initial map center in Leaflet CRS.Simple coordinates.
 * Corresponds to Mars geographic (0°, 0°) — the sub-solar prime meridian.
 */
export function getInitialCenter(config = DEFAULT_MAP_CONFIG) {
  return latLonToMapCoordinates(0, 0, config);
}
