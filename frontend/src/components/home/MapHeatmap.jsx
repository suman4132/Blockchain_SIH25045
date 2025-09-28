import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const MapHeatmap = () => {
  const mapRef = useRef()

  // Sample data for demonstration
  const sampleData = [
    {
      id: 1,
      name: 'Punjab Wheat Farms',
      position: [30.7333, 75.8577],
      crop: 'wheat',
      quantity: 1000,
      price: 25,
      color: '#22c55e'
    },
    {
      id: 2,
      name: 'Delhi Rice Fields',
      position: [28.7041, 77.1025],
      crop: 'rice',
      quantity: 800,
      price: 45,
      color: '#3b82f6'
    },
    {
      id: 3,
      name: 'Mumbai Tomato Farms',
      position: [19.0760, 72.8777],
      crop: 'tomato',
      quantity: 500,
      price: 30,
      color: '#f59e0b'
    },
    {
      id: 4,
      name: 'Bangalore Corn Fields',
      position: [12.9716, 77.5946],
      crop: 'corn',
      quantity: 1200,
      price: 20,
      color: '#8b5cf6'
    },
    {
      id: 5,
      name: 'Chennai Onion Farms',
      position: [13.0827, 80.2707],
      crop: 'onion',
      quantity: 600,
      price: 35,
      color: '#ef4444'
    }
  ]

  const CustomMarker = ({ data }) => {
    const markerRef = useRef()

    useEffect(() => {
      const marker = markerRef.current
      if (marker) {
        // Add pulsing animation
        marker.getElement().classList.add('pulse-marker')
      }
    }, [])

    return (
      <CircleMarker
        ref={markerRef}
        center={data.position}
        radius={15}
        pathOptions={{
          color: data.color,
          fillColor: data.color,
          fillOpacity: 0.7,
          weight: 2
        }}
      >
        <Popup>
          <div className="p-2">
            <h3 className="font-semibold text-gray-900 mb-2">{data.name}</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Crop:</span> {data.crop}</p>
              <p><span className="font-medium">Quantity:</span> {data.quantity} kg</p>
              <p><span className="font-medium">Price:</span> ₹{data.price}/kg</p>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    )
  }

  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
      <MapContainer
        ref={mapRef}
        center={[20.5937, 78.9629]} // Center of India
        zoom={5}
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {sampleData.map((data) => (
          <CustomMarker key={data.id} data={data} />
        ))}
      </MapContainer>
    </div>
  )
}

export default MapHeatmap

