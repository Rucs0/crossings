import { useCallback, useState } from 'react';

interface GeolocationState {
  loading: boolean;
  error: string | null;
}

function describeError(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access was denied. You can still place your report by clicking on the map.';
    case error.POSITION_UNAVAILABLE:
      return 'Your location is unavailable right now. Try clicking on the map instead.';
    case error.TIMEOUT:
      return 'Locating you took too long. Try clicking on the map instead.';
    default:
      return 'Could not get your location. Try clicking on the map instead.';
  }
}

/** Wraps the browser geolocation API and degrades gracefully on denial/timeout. */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ loading: false, error: null });

  const locate = useCallback((onSuccess: (lat: number, lng: number) => void) => {
    if (!('geolocation' in navigator)) {
      setState({ loading: false, error: 'Geolocation is not supported by this browser.' });
      return;
    }
    setState({ loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({ loading: false, error: null });
        onSuccess(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setState({ loading: false, error: describeError(error) });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return { ...state, locate };
}
