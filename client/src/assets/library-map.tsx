import React from "react";

export interface LibraryZone {
  id: number;
  name: string;
  current: number;
  capacity: number;
  percentage: number;
}

interface LibraryMapProps {
  zones: LibraryZone[];
  onZoneClick?: (zoneId: number) => void;
}

const LibraryMap: React.FC<LibraryMapProps> = ({ zones = [], onZoneClick }) => {
  // Helper function to determine zone status based on percentage
  const getZoneStatus = (percentage: number) => {
    if (percentage < 50) return "low";
    if (percentage < 80) return "medium";
    return "high";
  };

  return (
    <svg className="w-full h-full" viewBox="0 0 800 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Library outline */}
      <rect x="10" y="10" width="780" height="380" rx="4" stroke="#CBD5E1" strokeWidth="2" fill="white" />
      
      {/* Entrance */}
      <rect x="390" y="380" width="20" height="10" fill="#CBD5E1" />
      <text x="400" y="370" textAnchor="middle" fontSize="10" fill="#64748B">ENTRANCE</text>
      
      {zones.map((zone) => {
        const status = getZoneStatus(zone.percentage);
        let coordinates;
        
        // Set coordinates based on zone ID (matching the design)
        switch(zone.id) {
          case 1: // Zone A - Reading Area
            coordinates = { x: 60, y: 60, width: 300, height: 200 };
            break;
          case 2: // Zone B - Computer Lab
            coordinates = { x: 440, y: 60, width: 300, height: 120 };
            break;
          case 3: // Zone C - Group Study
            coordinates = { x: 440, y: 220, width: 300, height: 120 };
            break;
          case 4: // Zone D - Quiet Zone
            coordinates = { x: 60, y: 300, width: 300, height: 40 };
            break;
          default:
            coordinates = { x: 0, y: 0, width: 0, height: 0 };
        }
        
        return (
          <g key={zone.id} onClick={() => onZoneClick?.(zone.id)}>
            <rect 
              x={coordinates.x} 
              y={coordinates.y} 
              width={coordinates.width} 
              height={coordinates.height} 
              rx="4" 
              className={`library-zone zone-${status}`}
              style={{
                stroke: '#cbd5e1',
                strokeWidth: 1.5,
                fillOpacity: 0.2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fill: status === 'low' 
                  ? 'rgb(16, 185, 129, 0.2)' 
                  : status === 'medium' 
                    ? 'rgb(245, 158, 11, 0.2)' 
                    : 'rgb(239, 68, 68, 0.2)'
              }}
            />
            
            {zone.id !== 4 ? (
              <>
                <text 
                  x={coordinates.x + coordinates.width / 2} 
                  y={zone.id === 4 ? coordinates.y + coordinates.height / 2 + 5 : coordinates.y + coordinates.height / 2 - 20} 
                  textAnchor="middle" 
                  fontSize="16" 
                  fill="#64748B"
                >
                  {zone.id === 4 ? "" : `ZONE ${String.fromCharCode(64 + zone.id)}`}
                </text>
                <text 
                  x={coordinates.x + coordinates.width / 2} 
                  y={coordinates.y + coordinates.height / 2} 
                  textAnchor="middle" 
                  fontSize="12" 
                  fill="#64748B"
                >
                  {zone.name.split(" - ")[1]}
                </text>
                <text 
                  x={coordinates.x + coordinates.width / 2} 
                  y={coordinates.y + coordinates.height / 2 + 20} 
                  textAnchor="middle" 
                  fontSize="12" 
                  fill={
                    status === 'low' 
                      ? '#10B981' 
                      : status === 'medium' 
                        ? '#F59E0B' 
                        : '#EF4444'
                  }
                >
                  {zone.percentage}% Full
                </text>
              </>
            ) : (
              <text 
                x={coordinates.x + coordinates.width / 2} 
                y={coordinates.y + coordinates.height / 2 + 5} 
                textAnchor="middle" 
                fontSize="14" 
                fill="#64748B"
              >
                ZONE D - Quiet Zone ({zone.percentage}% Full)
              </text>
            )}
          </g>
        );
      })}
      
      {/* Information Desk */}
      <circle cx="400" cy="340" r="20" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
      <text x="400" y="344" textAnchor="middle" fontSize="8" fill="#64748B">INFO DESK</text>
    </svg>
  );
};

export default LibraryMap;
