import { useQuery } from '@tanstack/react-query';
import { Candidate } from '@/lib/db';

export function DemographicsWidget() {
  const { data, isLoading, error } = useQuery<Candidate[]>({
    queryKey: ['candidates'],
    queryFn: async () => {
      const res = await fetch('/api/candidates');
      if (!res.ok) throw new Error('Failed to fetch candidates');
      const json = await res.json();
      return json.candidates as Candidate[];
    },
  });

  if (isLoading) return <div className="card">Loading demographics...</div>;
  if (error || !data) return <div className="card text-red-500">Error loading demographics</div>;

  // Group by location
  const byLocation: Record<string, number> = {};
  data.forEach((c: any) => {
    const loc = (c.location as string) || 'Unknown';
    byLocation[loc] = (byLocation[loc] || 0) + 1;
  });
  const locations = Object.keys(byLocation);
  // Compute hires per location (stage === 'hired') and max for scaling
  const hiresByLocation: Record<string, number> = {};
  data.forEach((c: any) => {
    if (c.stage === 'hired') {
      const loc = (c.location as string) || 'Unknown';
      hiresByLocation[loc] = (hiresByLocation[loc] || 0) + 1;
    }
  });
  const maxHires = Math.max(0, ...Object.values(hiresByLocation));
  
  // Color interpolation function for shades of blue
  const lightBlue = '#e6f3ff';
  const darkBlue = '#0047ab';
  function interpolateBrown(t: number) {
    const start = hexToRgb(lightBlue);
    const end = hexToRgb(darkBlue);
    const r = Math.round(start[0] + (end[0]-start[0])*t);
    const g = Math.round(start[1] + (end[1]-start[1])*t);
    const b = Math.round(start[2] + (end[2]-start[2])*t);
    return rgbToHex(r,g,b);
  }

  return (
    <div className="card bg-white rounded-lg shadow p-4 mb-4">
      <div className="font-bold text-lg mb-2">Demographics & Performance</div>
      <div className="font-medium text-gray-700 mb-1">Candidates by Location</div>
      {/* <svg width="100%" height="40">
        {locations.map((loc, i) => (
          <rect key={loc} x={i*30} y={40-(byLocation[loc]/max)*35} width={24} height={(byLocation[loc]/max)*35} fill="#6366f1" />
        ))}
      </svg> */}
      <div className="flex gap-2 text-xs mt-1">
        {/* Map image with overlay markers and legend explaining brown gradient */}
        <div className="w-full relative mt-2 bg-gray-50 rounded overflow-hidden">
          <img src="/mapImg.jpg" alt="Regional hires map" className="w-full h-auto block" />

          {/* Overlay markers positioned by percent coordinates (approximate) */}
          {/* {(() => {
            const coordsPercent: Record<string, { left: string; top: string }> = {
              'North America': { left: '14%', top: '28%' },
              'South America': { left: '28%', top: '64%' },
              'Europe': { left: '48%', top: '24%' },
              'Asia': { left: '72%', top: '36%' },
              'Africa': { left: '50%', top: '52%' },
              'Australia': { left: '86%', top: '78%' },
              'Unknown': { left: '6%', top: '86%' },
            };

            function hexToRgb(hex: string) {
              const h = hex.replace('#', '');
              return [parseInt(h.substring(0,2),16), parseInt(h.substring(2,4),16), parseInt(h.substring(4,6),16)];
            }
            function rgbToHex(r: number, g: number, b: number) {
              return '#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
            }
            // light (skin tone) to dark brown
            const light = '#f7e7d0';
            const dark = '#5a2e0a';
            function interpColor(t: number) {
              const a = hexToRgb(light);
              const b = hexToRgb(dark);
              const r = Math.round(a[0] + (b[0]-a[0])*t);
              const g = Math.round(a[1] + (b[1]-a[1])*t);
              const bl = Math.round(a[2] + (b[2]-a[2])*t);
              return rgbToHex(r,g,bl);
            }

            return locations.map((loc) => {
              const hires = hiresByLocation[loc] || 0;
              const t = maxHires > 0 ? Math.min(1, hires / maxHires) : 0;
              const color = interpColor(t);
              const pos = coordsPercent[loc] || { left: `${10 + Math.random()*70}%`, top: `${60 + Math.random()*20}%` };
              return (
                <div key={loc} style={{ position: 'absolute', left: pos.left, top: pos.top, transform: 'translate(-50%,-50%)', pointerEvents: 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9999, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                    <span style={{ fontSize: 12, color: '#1f2937', fontWeight: 700 }}>{hires}</span>
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 4, fontSize: 11, color: '#374151' }}>{loc}</div>
                </div>
              );
            });
          })()} */}

          {/* Legend: gradient from light to dark with labels */}
          <div className="absolute left-4 h-12 bottom-4 bg-white/80 px-3 py-2 rounded shadow text-xs flex items-center gap-3">
            <div className="flex flex-col items-center">
              <svg width="140" height="16" viewBox="0 0 140 16" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradBrown" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#f7e7d0" />
                    <stop offset="100%" stopColor="#5a2e0a" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="140" height="16" fill="url(#gradBrown)" rx="4" />
              </svg>
              <div className="text-[11px] text-gray-600 mt-1">Darker = more hires</div>
            </div>
            {/* <div className="text-[11px] text-gray-700">Interpretation</div>
            <div className="max-w-xs text-[11px] text-gray-600">Darker brown regions indicate more employees hired from that region; lighter (skin-tone) indicates fewer hires.</div> */}
          </div>
        </div>
      </div>
      {/* Example: job fill rate, avg time-to-hire (mocked) */}
      {/* <div className="mt-4">
        <div className="font-medium text-gray-700 mb-1">Job Fill Rate</div>
        
        <div className="text-lg font-bold text-blue-600">{Math.round(Math.random()*100)}%</div>
        <div className="font-medium text-gray-700 mb-1 mt-2">Avg Time-to-Hire</div>
        <div className="text-lg font-bold text-green-600">{Math.round(Math.random()*30)+10} days</div>
      </div> */}
    </div>
  );
}
