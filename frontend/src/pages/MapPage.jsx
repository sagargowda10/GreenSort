import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Circle } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { MapPin, Star, Clock, Navigation, Crosshair, Search, Filter, RefreshCw, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import L from 'leaflet';

// --- ICONS SETUP ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
});

// User Location Icon (Red Pulse)
const UserIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div class="relative flex h-4 w-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-lg"></span>
           </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- UTILS: Calculate Distance (Haversine Formula) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // Distance in km (1 decimal)
};

// --- COMPONENT: Map Controller & Drag Listener ---
const MapController = ({ center, selectedLocation, onMapDrag }) => {
  const map = useMap();
  
  // Handle FlyTo animations
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo(
        [selectedLocation.location.coordinates[1], selectedLocation.location.coordinates[0]], 
        16, { duration: 1.2 }
      );
    } else if (center) {
        map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [selectedLocation, center, map]);

  // Detect Dragging to show "Search This Area" button
  useMapEvents({
      dragend: () => {
          const newCenter = map.getCenter();
          onMapDrag(newCenter.lat, newCenter.lng);
      }
  });

  return null;
};

const MapPage = () => {
  // --- STATE ---
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Location States
  const [userLocation, setUserLocation] = useState(null); 
  const [searchCenter, setSearchCenter] = useState({ lat: 12.2958, lng: 76.6394 });
  const [dragCenter, setDragCenter] = useState(null); // Tracks where user dragged map
  
  // UI States
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchHereBtn, setShowSearchHereBtn] = useState(false);

  const FILTERS = ["All", "Plastic", "Electronics", "Glass", "Metal", "Paper"];

  // --- FETCH DATA ---
  const fetchLocations = useCallback(async (lat, lng) => {
    setLoading(true);
    setShowSearchHereBtn(false); // Hide button after searching
    try {
      const { data } = await axios.get(`/api/locations?lat=${lat}&lng=${lng}`);
      
      // Calculate distance for each location
      const enhancedData = data.map(loc => ({
          ...loc,
          distance: calculateDistance(lat, lng, loc.location.coordinates[1], loc.location.coordinates[0])
      }));

      // Sort by distance (nearest first)
      enhancedData.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

      setLocations(enhancedData);
    } catch (error) {
      console.error("Error loading locations:", error);
      toast.error("Could not load nearby locations");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- FILTER EFFECT ---
  useEffect(() => {
    let filtered = locations;
    if (activeFilter !== "All") {
        filtered = locations.filter(loc => 
            loc.type?.toLowerCase().includes(activeFilter.toLowerCase())
        );
    }
    setFilteredLocations(filtered);
  }, [activeFilter, locations]);

  // --- HANDLERS ---
  
  // 1. Triggered when user clicks "Search This Area"
  const handleDragSearch = () => {
      if (dragCenter) {
          setSearchCenter(dragCenter);
          fetchLocations(dragCenter.lat, dragCenter.lng);
      }
  };

  // 2. Triggered when map is dragged
  const onMapDrag = (lat, lng) => {
      setDragCenter({ lat, lng });
      setShowSearchHereBtn(true);
  };

  // 3. Address Search (Nominatim)
  const handleAddressSearch = async (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;

      setIsSearching(true);
      try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
          if (response.data && response.data.length > 0) {
              const { lat, lon } = response.data[0];
              const newLat = parseFloat(lat);
              const newLng = parseFloat(lon);
              
              setSearchCenter({ lat: newLat, lng: newLng });
              fetchLocations(newLat, newLng);
              toast.success(`Moved to: ${searchQuery}`);
              setSearchQuery(""); 
          } else {
              toast.warn("Location not found.");
          }
      } catch (error) {
          toast.error("Search failed.");
      } finally {
          setIsSearching(false);
      }
  };

  // 4. Recenter on GPS
  const handleRecenter = () => {
    if (userLocation) {
        setSearchCenter(userLocation); 
        fetchLocations(userLocation.lat, userLocation.lng);
        toast.success("Back to your location");
    } else {
        toast.info("Acquiring GPS...");
    }
  };

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude }); 
          setSearchCenter({ lat: latitude, lng: longitude }); 
          fetchLocations(latitude, longitude);
        },
        () => {
            // Default fallback if GPS denied
            fetchLocations(12.2958, 76.6394); 
        }
      );
    } else {
      fetchLocations(12.2958, 76.6394);
    }
  }, [fetchLocations]);

  return (
    <div className="min-h-screen bg-off-white font-sans text-charcoal flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-6">
        
        {/* --- HEADER & SEARCH --- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <div>
                <h2 className="text-3xl font-bold text-charcoal flex items-center gap-2">
                    <MapPin className="text-primary" /> Local Hubs
                </h2>
                <p className="text-gray-500 text-sm">Find recycling points near you</p>
            </div>

            <form onSubmit={handleAddressSearch} className="flex w-full lg:w-auto relative shadow-sm">
                <input 
                    type="text" 
                    placeholder="Search city or area..." 
                    className="w-full lg:w-96 pl-10 pr-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                <button 
                    type="submit" 
                    disabled={isSearching}
                    className="bg-primary text-white px-6 py-3 rounded-r-lg font-bold hover:bg-green-800 transition disabled:opacity-70 flex items-center justify-center min-w-[80px]"
                >
                    {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Search"}
                </button>
            </form>
        </div>

        {/* --- FILTERS --- */}
        <div className="flex flex-wrap gap-2 mb-4">
            {FILTERS.map((filter) => (
                <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-1 border ${
                        activeFilter === filter 
                        ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {activeFilter === filter && <Filter className="w-3 h-3" />} {filter}
                </button>
            ))}
        </div>

        {/* --- MAP LAYOUT --- */}
        <div className="grid lg:grid-cols-3 gap-6 h-[650px] lg:h-[calc(100vh-220px)] relative">
            
            {/* LEFT: MAP */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-xl border border-gray-200 relative z-0 group">
                
                {/* FLOATING "SEARCH HERE" BUTTON */}
                {showSearchHereBtn && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[400]">
                        <button 
                            onClick={handleDragSearch}
                            className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition animate-bounce-in"
                        >
                            <RefreshCw className="w-4 h-4 text-primary" /> Search this area
                        </button>
                    </div>
                )}

                <MapContainer 
                    center={[searchCenter.lat, searchCenter.lng]} 
                    zoom={14} 
                    style={{ height: "100%", width: "100%" }}
                    className="z-0 bg-gray-100"
                >
                    <TileLayer
                        attribution='© OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    <MapController 
                        center={[searchCenter.lat, searchCenter.lng]} 
                        selectedLocation={selectedLocation}
                        onMapDrag={onMapDrag}
                    />

                    {/* SEARCH RADIUS VISUALIZER (3km) */}
                    <Circle 
                        center={[searchCenter.lat, searchCenter.lng]}
                        radius={3000}
                        pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.05, weight: 1, dashArray: '5, 10' }}
                    />

                    {/* USER MARKER */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={UserIcon}>
                            <Popup className="custom-popup">You are here</Popup>
                        </Marker>
                    )}

                    {/* LOCATION MARKERS */}
                    {filteredLocations.map((loc) => (
                        <Marker 
                            key={loc._id} 
                            position={[loc.location.coordinates[1], loc.location.coordinates[0]]}
                            eventHandlers={{ click: () => setSelectedLocation(loc) }}
                        >
                            <Popup>
                                <div className="min-w-[200px] p-1">
                                    <h3 className="font-bold text-gray-800 text-lg mb-1">{loc.name}</h3>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold uppercase">{loc.type}</span>
                                        <span className="text-xs text-gray-500">{loc.distance} km away</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">{loc.address}</p>
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${loc.location.coordinates[1]},${loc.location.coordinates[0]}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full block text-center bg-primary text-white text-xs py-2 rounded-lg font-bold hover:bg-green-800 transition"
                                    >
                                        Navigate Here
                                    </a>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>

                {/* Floating Recenter Button */}
                <button 
                    onClick={handleRecenter}
                    className="absolute bottom-6 right-6 z-[400] bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 text-gray-700 transition transform hover:scale-110"
                    title="Center on my location"
                >
                    <Crosshair className="w-6 h-6 text-primary" />
                </button>
            </div>

            {/* RIGHT: LIST */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center backdrop-blur-sm">
                    <h3 className="font-bold text-gray-700">Nearby ({filteredLocations.length})</h3>
                    {loading && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
                </div>
                
                <div className="flex-grow overflow-y-auto p-3 space-y-3 custom-scrollbar bg-gray-50/30">
                    {loading && filteredLocations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                            <p className="text-xs text-gray-400">Locating hubs...</p>
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div className="text-center py-10 px-6">
                            <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500 font-medium">No results found.</p>
                            <p className="text-xs text-gray-400 mt-1">Try zooming out or searching a different area.</p>
                        </div>
                    ) : (
                        filteredLocations.map((loc) => (
                            <div 
                                key={loc._id}
                                onClick={() => setSelectedLocation(loc)}
                                className={`group p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden ${
                                    selectedLocation?._id === loc._id 
                                    ? 'border-primary bg-white ring-2 ring-primary ring-opacity-50 shadow-md' 
                                    : 'border-white bg-white hover:border-green-100'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-800 group-hover:text-primary transition">{loc.name}</h4>
                                            {loc.distance && (
                                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                                                    {loc.distance} km
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{loc.address}</p>
                                        
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                loc.type === 'Plastic' ? 'bg-blue-50 text-blue-600' :
                                                loc.type === 'Electronics' ? 'bg-purple-50 text-purple-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                                {loc.type}
                                            </span>
                                            <div className="flex items-center text-[10px] text-gray-400">
                                                <Clock className="w-3 h-3 mr-1" /> {loc.hours ? Object.values(loc.hours)[0] : "Open Now"}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white transition duration-300">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default MapPage;