const t=require('topojson-client'),fs=require('fs');const w=require('world-atlas/countries-10m.json')   // npm install, then: node films/kosovo-electricity/geo.build.cjs (from the repo root);
const fc=t.feature(w,w.objects.countries);const S=3,c=Math.cos(42.57*Math.PI/180);
const P=([lon,lat])=>[+(((lon-20.9)*c*111.32)/S).toFixed(3),+((-(lat-42.57)*110.57)/S).toFixed(3)];
const get=n=>fc.features.find(f=>f.properties.name===n).geometry;
const k=get('Kosovo').coordinates[0].map(P);
const R=46,segs=[];
for(const n of ['Albania','Macedonia','Montenegro','Serbia']){const g=get(n);const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;
  for(const poly of polys)for(const ring of poly){const pts=ring.map(P);for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];if(Math.hypot(...a)<R&&Math.hypot(...b)<R)segs.push([...a,...b]);}}}
// drop neighbour segments lying on the Kosovo border
const near=(p)=>k.some(q=>Math.hypot(p[0]-q[0],p[1]-q[1])<0.25);
const out=segs.filter(s=>!(near([s[0],s[1]])&&near([s[2],s[3]])));
const xs=k.map(p=>p[0]),zs=k.map(p=>p[1]);
console.log('kosovo pts',k.length,'x',Math.min(...xs),Math.max(...xs),'z',Math.min(...zs),Math.max(...zs),'segs',segs.length,out.length);
fs.writeFileSync('films/kosovo-electricity/geo.json',JSON.stringify({k,segs:out}));
