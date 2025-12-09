import { useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from './button';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Input } from './input';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

function LocationMarker({ position, onPositionChange }: { 
  position: [number, number] | null; 
  onPositionChange: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function LocateButton({ onLocate }: { onLocate: (lat: number, lng: number) => void }) {
  const map = useMap();
  
  const handleLocate = () => {
    map.locate({ setView: true, maxZoom: 16 });
    map.once('locationfound', (e) => {
      onLocate(e.latlng.lat, e.latlng.lng);
    });
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="absolute top-3 left-3 z-[1000] rounded-xl shadow-lg gap-2"
      onClick={handleLocate}
      data-testid="locate-me-btn"
    >
      <Navigation className="w-4 h-4" />
      موقعي
    </Button>
  );
}

export default function LocationPicker({ 
  initialLat, 
  initialLng, 
  onLocationSelect,
  height = "300px" 
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialLat && initialLng ? [initialLat, initialLng] : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const defaultCenter: [number, number] = [33.5138, 36.2765];
  const center = position || defaultCenter;

  const handlePositionChange = useCallback((newPos: [number, number]) => {
    setPosition(newPos);
    onLocationSelect(newPos[0], newPos[1]);
  }, [onLocationSelect]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Syria')}&limit=1`,
        { headers: { 'User-Agent': 'SaryWholesaleApp/1.0' } }
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handlePositionChange([lat, lng]);
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pr-10 rounded-xl"
            placeholder="ابحث عن موقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            data-testid="location-search"
          />
        </div>
        <Button 
          type="button"
          onClick={handleSearch} 
          disabled={searching}
          className="rounded-xl"
          data-testid="search-location-btn"
        >
          {searching ? '...' : 'بحث'}
        </Button>
      </div>

      <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200" style={{ height }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
          <LocateButton onLocate={(lat, lng) => handlePositionChange([lat, lng])} />
        </MapContainer>
        
        {!position && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">اضغط على الخريطة لتحديد الموقع</span>
          </div>
        )}
      </div>

      {position && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-700">تم تحديد الموقع</p>
            <p className="text-xs text-green-600" dir="ltr">
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
