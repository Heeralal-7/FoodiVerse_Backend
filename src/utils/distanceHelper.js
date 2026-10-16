// src/utils/distanceHelper.js

/**
 * 1. Haversine Formula: Calculates aerial distance with road curvature factor (1.25x)
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's Radius in KM
  
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const roadEstimatedDistance = R * c * 1.25; // 1.25 is urban road factor
  
    return parseFloat(roadEstimatedDistance.toFixed(1));
  };
  
  /**
   * 2. Estimated Delivery Time Calculator
   */
  const calculateDeliveryTime = (distanceInKm, basePrepTime = 20) => {
    const travelTimeMinutes = Math.round(distanceInKm * 3); // ~3 min per km in city
    const minTime = basePrepTime + travelTimeMinutes;
    const maxTime = minTime + 7;
  
    return {
      text: `${minTime}-${maxTime} mins`,
      minMinutes: minTime,
      maxMinutes: maxTime,
    };
  };
  
  /**
   * 3. Dynamic Delivery Fee Calculator based on Distance
   */
  const calculateDeliveryFee = (distanceInKm) => {
    const baseFee = 25; // First 2 KM
    const perKmRate = 10; // Extra charge after 2 KM
  
    if (distanceInKm <= 2) {
      return baseFee;
    }
  
    const extraKm = distanceInKm - 2;
    return baseFee + Math.round(extraKm * perKmRate);
  };
  
  /**
   * 4. Google Maps Live Road Distance / Offline Fallback Wrapper
   */
  const getRealRoadDistance = async (userLat, userLng, restLat, restLng) => {
    // Check if Google Maps API is enabled in .env
    if (process.env.USE_GOOGLE_MAPS !== 'true' || !process.env.GOOGLE_MAPS_API_KEY) {
      const distanceKm = calculateHaversineDistance(userLat, userLng, restLat, restLng);
      const eta = calculateDeliveryTime(distanceKm);
      const fee = calculateDeliveryFee(distanceKm);
  
      return {
        distanceInKm: distanceKm,
        durationText: eta.text,
        deliveryFee: fee,
        source: 'haversine_offline',
      };
    }
  
    // Google Maps Distance Matrix API (Built-in fetch)
    try {
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat},${userLng}&destinations=${restLat},${restLng}&mode=driving&key=${process.env.GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
  
      const element = data.rows?.[0]?.elements?.[0];
  
      if (element && element.status === 'OK') {
        const distanceInKm = parseFloat((element.distance.value / 1000).toFixed(1));
        const durationText = element.duration.text;
        const fee = calculateDeliveryFee(distanceInKm);
  
        return {
          distanceInKm,
          durationText,
          deliveryFee: fee,
          source: 'google_maps_live',
        };
      }
  
      throw new Error('Google route not found');
    } catch (error) {
      console.error('Google Maps API fallback to Haversine:', error.message);
      const distanceKm = calculateHaversineDistance(userLat, userLng, restLat, restLng);
      const eta = calculateDeliveryTime(distanceKm);
      const fee = calculateDeliveryFee(distanceKm);
  
      return {
        distanceInKm: distanceKm,
        durationText: eta.text,
        deliveryFee: fee,
        source: 'haversine_fallback',
      };
    }
  };
  
  // 👈 Sabhi functions ko export karein:
  module.exports = {
    calculateHaversineDistance,
    calculateDeliveryTime,
    calculateDeliveryFee,
    getRealRoadDistance,
  };