import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, AlertTriangle, Smartphone, ArrowRight, BarChart3 } from 'lucide-react';

// Data for different cities
// Sources: Met Police 2024, ONS Crime Survey 2024, BBC News (Oct 2025), House of Commons Library
const cityData = {
  'UK': {
    name: 'United Kingdom',
    totalThefts: '78,000+',
    increase: '153%',
    chargeRate: '1.7%',
    theftRate: '200+ per day',
    hotspots: [
      { name: 'London', count: '117,211', width: '100%', color: 'red', desc: 'Primary hotspot (Met Police data)' },
      { name: 'West Midlands', count: 'High Vol', width: '15%', color: 'orange', desc: 'Birmingham city centre focus' },
      { name: 'Greater Manchester', count: 'High Vol', width: '12%', color: 'yellow', desc: 'Nightlife districts' },
      { name: 'West Yorkshire', count: 'Med Vol', width: '8%', color: 'blue', desc: 'Leeds city centre' },
      { name: 'South Yorkshire', count: 'Med Vol', width: '6%', color: 'neutral', desc: 'Sheffield urban areas' }
    ],
    source: 'Home Office "Snatch Theft" Stats 2024'
  },
  'London': {
    name: 'London',
    totalThefts: '117,211',
    increase: '25%',
    chargeRate: '1%',
    theftRate: '13 per hour',
    hotspots: [
      { name: 'Westminster', count: '34,039', width: '100%', color: 'red', desc: 'Highest in UK - Tourist hubs' },
      { name: 'Camden', count: '6,800+', width: '25%', color: 'orange', desc: 'Markets & transport' },
      { name: 'Southwark', count: '6,000+', width: '22%', color: 'yellow', desc: 'Riverside tourist areas' },
      { name: 'Hackney', count: 'Top 5', width: '18%', color: 'blue', desc: 'Nightlife concentration' },
      { name: 'Kensington & Chelsea', count: 'Top 10', width: '15%', color: 'neutral', desc: 'High-value retail' }
    ],
    source: 'Met Police 2024 (via BBC/Standard)'
  },
  'Manchester': {
    name: 'Manchester',
    totalThefts: 'Trend: Rising',
    increase: 'N/A',
    chargeRate: '< 2%',
    theftRate: 'High Risk',
    hotspots: [
      { name: 'City Centre', count: 'High', width: '100%', color: 'red', desc: 'Piccadilly & Arndale' },
      { name: 'Fallowfield', count: 'Med', width: '60%', color: 'orange', desc: 'Student areas' },
      { name: 'Northern Quarter', count: 'Med', width: '50%', color: 'yellow', desc: 'Nightlife' },
      { name: 'Deansgate', count: 'Med', width: '45%', color: 'blue', desc: 'Bars & Clubs' },
      { name: 'Salford Quays', count: 'Low', width: '30%', color: 'neutral', desc: 'Tourist spots' }
    ],
    source: 'GMP Trends (Est. based on national data)'
  },
  'Birmingham': {
    name: 'Birmingham',
    totalThefts: 'Trend: Rising',
    increase: 'N/A',
    chargeRate: '< 2%',
    theftRate: 'High Risk',
    hotspots: [
      { name: 'Bullring', count: 'High', width: '100%', color: 'red', desc: 'Shopping district' },
      { name: 'New Street', count: 'High', width: '80%', color: 'orange', desc: 'Transport hub' },
      { name: 'Broad Street', count: 'Med', width: '60%', color: 'yellow', desc: 'Nightlife' },
      { name: 'Digbeth', count: 'Med', width: '50%', color: 'blue', desc: 'Events & venues' },
      { name: 'Jewellery Quarter', count: 'Low', width: '30%', color: 'neutral', desc: 'Retail' }
    ],
    source: 'West Mids Police Trends (Est.)'
  }
};

export default function UKStatistics() {
  const [activeCity, setActiveCity] = useState<'UK' | 'London' | 'Manchester' | 'Birmingham'>('UK');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const data = cityData[activeCity];

  if (!mounted) {
    // Server-side render static version (default to UK)
    const staticData = cityData['UK'];
    return (
      <div className="space-y-8">
        <div className="bg-white p-2 rounded-xl shadow-sm border border-neutral-200 inline-flex flex-wrap gap-2">
            <button className="px-6 py-2 rounded-lg text-sm font-bold bg-neutral-900 text-white shadow-md">UK</button>
            <button className="px-6 py-2 rounded-lg text-sm font-bold bg-transparent text-neutral-600">London</button>
            <button className="px-6 py-2 rounded-lg text-sm font-bold bg-transparent text-neutral-600">Manchester</button>
            <button className="px-6 py-2 rounded-lg text-sm font-bold bg-transparent text-neutral-600">Birmingham</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* ... skeleton or default UK view ... */}
             <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-8">
              <div className="text-5xl font-bold mb-2">{staticData.totalThefts}</div>
              <div className="text-red-100 font-medium">Thefts in {staticData.name} (2024)</div>
            </div>
             <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-8">
              <div className="text-5xl font-bold mb-2">{staticData.increase}</div>
              <div className="text-orange-100 font-medium">Increase since 2020</div>
            </div>
             <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-8">
              <div className="text-5xl font-bold mb-2">{staticData.chargeRate}</div>
              <div className="text-blue-100 font-medium">Result in charges</div>
            </div>
             <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shadow-lg p-8">
              <div className="text-4xl font-bold mb-2">{staticData.theftRate}</div>
              <div className="text-teal-100 font-medium">Theft Rate</div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* City Toggle Controls */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-neutral-200 inline-flex flex-wrap gap-2">
        {(Object.keys(cityData) as Array<keyof typeof cityData>).map((city) => (
          <button
            key={city}
            onClick={() => setActiveCity(city)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeCity === city
                ? 'bg-neutral-900 text-white shadow-md'
                : 'bg-transparent text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-8 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="h-10 w-10 opacity-80" />
            <TrendingUp className="h-6 w-6 opacity-60" />
          </div>
          <div className="text-4xl lg:text-5xl font-bold mb-2">{data.totalThefts}</div>
          <div className="text-red-100 font-medium">Thefts in {data.name} (2024)</div>
          <div className="mt-4 pt-4 border-t border-red-400 text-xs text-red-100">
            Source: {data.source}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-8 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-10 w-10 opacity-80" />
          </div>
          <div className="text-5xl font-bold mb-2">{data.increase}</div>
          <div className="text-orange-100 font-medium">Increase since 2020</div>
           <div className="mt-4 pt-4 border-t border-orange-400 text-xs text-orange-100">
            Growing Trend
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-8 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="h-10 w-10 opacity-80" />
          </div>
          <div className="text-5xl font-bold mb-2">{data.chargeRate}</div>
          <div className="text-blue-100 font-medium">Result in charges</div>
           <div className="mt-4 pt-4 border-t border-blue-400 text-xs text-blue-100">
            Low Recovery Rate
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-xl shadow-lg p-8 transition-all hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <Smartphone className="h-10 w-10 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-2">{data.theftRate}</div>
          <div className="text-teal-100 font-medium">Theft Rate</div>
           <div className="mt-4 pt-4 border-t border-teal-400 text-xs text-teal-100">
            High Frequency
          </div>
        </div>
      </div>

      {/* Hotspots List */}
      <div className="bg-white rounded-xl shadow-md p-8 border border-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Top Theft Hotspots in {data.name}</h2>
            <p className="text-neutral-600">Data shows these areas have the highest theft rates</p>
          </div>
          <MapPin className="h-10 w-10 text-red-600" />
        </div>
        
        <div className="space-y-6">
          {data.hotspots.map((spot, index) => (
            <div key={spot.name} className="relative group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-neutral-300 group-hover:text-red-600 transition-colors">{index + 1}.</span>
                  <span className="text-lg font-semibold">{spot.name}</span>
                </div>
                <span className={`text-xl font-bold text-${spot.color === 'neutral' ? 'gray' : spot.color}-600`}>
                  {spot.count}
                </span>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ease-out bg-${spot.color}-500`}
                  style={{ width: spot.width }}
                />
              </div>
              <p className="text-sm text-neutral-500 mt-1 pl-8">{spot.desc}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-600">
          <strong>Analysis:</strong> Theft hotspots are concentrated in high-footfall areas, transport hubs, and nightlife districts. 
          {activeCity === 'UK' 
            ? ' London is the primary driver of national statistics.' 
            : ` ${data.name} reflects typical urban crime patterns.`}
        </div>
      </div>
    </div>
  );
}
