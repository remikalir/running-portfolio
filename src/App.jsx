import { useState, useEffect, useRef } from "react";

const DATA = {
  summary: { totalRuns: 2273, totalMiles: 16897, totalHours: 1830, pr5k: "16:53", prHalf: "1:18:55", prMarathon: "2:58:45", prMile: "5:20", vo2: 65, avgPerWeek: 4.8, countries: 4, usStates: 16, cities: 45 },
  yearly: [
    {year:2017,runs:207,miles:1603,pace:"6:30",paceN:6.51},{year:2018,runs:235,miles:1894,pace:"6:19",paceN:6.32},
    {year:2019,runs:219,miles:1627,pace:"6:17",paceN:6.29},{year:2020,runs:201,miles:1591,pace:"6:14",paceN:6.24},
    {year:2021,runs:288,miles:1938,pace:"6:20",paceN:6.35},{year:2022,runs:299,miles:1944,pace:"6:38",paceN:6.64},
    {year:2023,runs:231,miles:1924,pace:"6:21",paceN:6.36},{year:2024,runs:260,miles:1887,pace:"6:32",paceN:6.53},
    {year:2025,runs:263,miles:2035,pace:"6:58",paceN:6.97},{year:2026,runs:70,miles:455,pace:"7:10",paceN:7.18},
  ],
  monthly: [
    {m:"2017-01",mi:7},{m:"2017-02",mi:91},{m:"2017-03",mi:146},{m:"2017-04",mi:123},{m:"2017-05",mi:151},{m:"2017-06",mi:161},{m:"2017-07",mi:155},{m:"2017-08",mi:147},{m:"2017-09",mi:149},{m:"2017-10",mi:132},{m:"2017-11",mi:170},{m:"2017-12",mi:173},
    {m:"2018-01",mi:173},{m:"2018-02",mi:120},{m:"2018-03",mi:167},{m:"2018-04",mi:144},{m:"2018-05",mi:177},{m:"2018-06",mi:155},{m:"2018-07",mi:183},{m:"2018-08",mi:187},{m:"2018-09",mi:179},{m:"2018-10",mi:159},{m:"2018-11",mi:147},{m:"2018-12",mi:101},
    {m:"2019-01",mi:129},{m:"2019-02",mi:126},{m:"2019-03",mi:138},{m:"2019-04",mi:163},{m:"2019-05",mi:169},{m:"2019-06",mi:165},{m:"2019-07",mi:168},{m:"2019-08",mi:148},{m:"2019-09",mi:68},{m:"2019-10",mi:94},{m:"2019-11",mi:126},{m:"2019-12",mi:134},
    {m:"2020-01",mi:155},{m:"2020-02",mi:73},{m:"2020-03",mi:144},{m:"2020-04",mi:147},{m:"2020-05",mi:168},{m:"2020-06",mi:157},{m:"2020-07",mi:179},{m:"2020-08",mi:151},{m:"2020-09",mi:134},{m:"2020-10",mi:157},{m:"2020-11",mi:125},
    {m:"2021-01",mi:79},{m:"2021-02",mi:155},{m:"2021-03",mi:161},{m:"2021-04",mi:178},{m:"2021-05",mi:175},{m:"2021-06",mi:161},{m:"2021-07",mi:175},{m:"2021-08",mi:176},{m:"2021-09",mi:170},{m:"2021-10",mi:183},{m:"2021-11",mi:173},{m:"2021-12",mi:152},
    {m:"2022-01",mi:162},{m:"2022-02",mi:65},{m:"2022-03",mi:154},{m:"2022-04",mi:155},{m:"2022-05",mi:173},{m:"2022-06",mi:160},{m:"2022-07",mi:166},{m:"2022-08",mi:170},{m:"2022-09",mi:180},{m:"2022-10",mi:201},{m:"2022-11",mi:184},{m:"2022-12",mi:175},
    {m:"2023-01",mi:193},{m:"2023-02",mi:170},{m:"2023-03",mi:190},{m:"2023-04",mi:172},{m:"2023-05",mi:194},{m:"2023-06",mi:164},{m:"2023-07",mi:110},{m:"2023-08",mi:188},{m:"2023-09",mi:165},{m:"2023-10",mi:180},{m:"2023-11",mi:167},{m:"2023-12",mi:30},
    {m:"2024-01",mi:89},{m:"2024-02",mi:143},{m:"2024-03",mi:181},{m:"2024-04",mi:141},{m:"2024-05",mi:187},{m:"2024-06",mi:163},{m:"2024-07",mi:170},{m:"2024-08",mi:180},{m:"2024-09",mi:162},{m:"2024-10",mi:183},{m:"2024-11",mi:134},{m:"2024-12",mi:156},
    {m:"2025-01",mi:163},{m:"2025-02",mi:161},{m:"2025-03",mi:169},{m:"2025-04",mi:176},{m:"2025-05",mi:180},{m:"2025-06",mi:167},{m:"2025-07",mi:179},{m:"2025-08",mi:173},{m:"2025-09",mi:173},{m:"2025-10",mi:157},{m:"2025-11",mi:173},{m:"2025-12",mi:164},
    {m:"2026-01",mi:172},{m:"2026-02",mi:151},{m:"2026-03",mi:132},
  ],
  paces: [{p:"5:00",c:1},{p:"5:30",c:14},{p:"6:00",c:628},{p:"6:30",c:1017},{p:"7:00",c:379},{p:"7:30",c:80},{p:"8:00",c:53},{p:"8:30",c:51},{p:"9:00",c:29},{p:"9:30",c:10},{p:"10:00+",c:8}],
  weekday: [{d:"Mon",r:41,mi:235},{d:"Tue",r:468,mi:3202},{d:"Wed",r:416,mi:2603},{d:"Thu",r:376,mi:2075},{d:"Fri",r:394,mi:3451},{d:"Sat",r:152,mi:778},{d:"Sun",r:426,mi:4554}],
  vo2: [{d:"2023-07",v:61.8},{d:"2023-10",v:63.9},{d:"2024-01",v:62.5},{d:"2024-04",v:66.2},{d:"2024-07",v:68.6},{d:"2024-10",v:68.4},{d:"2025-01",v:67.9},{d:"2025-04",v:67.0},{d:"2025-07",v:68.0},{d:"2025-10",v:66.0},{d:"2026-01",v:65.0},{d:"2026-03",v:65.0}],
  bio: [{y:2017,c:83.8,s:1.45},{y:2018,c:84.8,s:1.48},{y:2019,c:86.4,s:1.46},{y:2020,c:86.2,s:1.48},{y:2021,c:86.3,s:1.43},{y:2022,c:85.5,s:1.38},{y:2023,c:87.6,s:1.42},{y:2024,c:86.1,s:1.41},{y:2025,c:84.7,s:1.35},{y:2026,c:84.4,s:1.28}],
  homes: [
    {name:"Denver, CO",dates:"2017–2024",runs:1390,miles:10190,pace:"6:23",note:"7 years at altitude, City Park loops"},
    {name:"Cambridge, MA",dates:"Aug 2022–Jun 2023",runs:224,miles:1881,pace:"6:33",note:"11 months along the Charles"},
    {name:"Winston-Salem, NC",dates:"Jul 2024–present",runs:370,miles:2785,pace:"7:01",note:"Ultra & marathon training base"},
  ],
  locations: [
    {name:"Denver",runs:1390,mi:10190},{name:"Winston-Salem",runs:370,mi:2785},{name:"Cambridge",runs:224,mi:1881},
    {name:"Altadena/Pasadena",runs:46,mi:322},{name:"Camden, NJ",runs:7,mi:58},{name:"Littleton, CO",runs:6,mi:42},
    {name:"Dublin",runs:3,mi:23},{name:"Nashville",runs:3,mi:17},{name:"Ann Arbor",runs:3,mi:26},
    {name:"Chicago",runs:3,mi:28},{name:"Toronto",runs:3,mi:24},{name:"Vancouver",runs:3,mi:28},
    {name:"San Diego",runs:3,mi:19},{name:"Ocean City",runs:3,mi:18},{name:"Boston",runs:3,mi:15},
  ],
  usStatesMap: {
    'Colorado':{runs:1478,mi:10840},'North Carolina':{runs:373,mi:2847},'Massachusetts':{runs:227,mi:1896},
    'California':{runs:57,mi:411},'New Jersey':{runs:7,mi:58},'Maryland':{runs:5,mi:32},
    'New York':{runs:4,mi:39},'Illinois':{runs:3,mi:28},'Tennessee':{runs:3,mi:17},
    'Michigan':{runs:3,mi:26},'Missouri':{runs:2,mi:20},'Pennsylvania':{runs:2,mi:17},
    'Rhode Island':{runs:2,mi:19},'New Mexico':{runs:1,mi:7},'Virginia':{runs:1,mi:9},
    'Kentucky':{runs:1,mi:11},
  },
  usStates: [
    {name:"Colorado",runs:1478,mi:10840,cities:"Denver, Boulder, Littleton, Aurora"},{name:"North Carolina",runs:373,mi:2847,cities:"Winston-Salem, Asheville, Burke County"},{name:"Massachusetts",runs:227,mi:1896,cities:"Cambridge, Boston"},
    {name:"California",runs:57,mi:411,cities:"Altadena/Pasadena, San Diego, SF"},{name:"New Jersey",runs:7,mi:58,cities:"Camden"},{name:"Maryland",runs:5,mi:32,cities:"Annapolis, Ocean City"},
    {name:"New York",runs:4,mi:39,cities:"NYC, Troy"},{name:"Illinois",runs:3,mi:28,cities:"Chicago"},{name:"Tennessee",runs:3,mi:17,cities:"Nashville"},
    {name:"Michigan",runs:3,mi:26,cities:"Ann Arbor"},{name:"Missouri",runs:2,mi:20,cities:"St. Louis"},{name:"Pennsylvania",runs:2,mi:17,cities:"Pottstown, Edgmont"},
    {name:"Rhode Island",runs:2,mi:19,cities:"Middletown"},{name:"New Mexico",runs:1,mi:7,cities:"Albuquerque"},{name:"Virginia",runs:1,mi:9,cities:"Fredericksburg"},
    {name:"Kentucky",runs:1,mi:11,cities:"Lexington"},
  ],
  longest: [
    {date:"2025-10-25",name:"Fonta Flora 50K",mi:32.4,pace:"8:54"},{date:"2026-01-03",name:"Frosty 50 2026",mi:31.4,pace:"7:39"},
    {date:"2026-03-21",name:"Asheville Marathon",mi:26.3,pace:"6:49"},{date:"2025-12-14",name:"Long run",mi:21.0,pace:"7:38"},
    {date:"2025-11-23",name:"Long run",mi:21.0,pace:"7:36"},{date:"2026-03-01",name:"Long run",mi:21.0,pace:"6:52"},
  ],
  fastest: [
    {date:"2024-10-23",mi:4.0,pace:"5:28"},{date:"2026-03-04",mi:4.0,pace:"5:30"},
    {date:"2024-09-04",mi:4.0,pace:"5:31"},{date:"2024-10-16",mi:4.0,pace:"5:33"},
    {date:"2024-10-30",mi:4.0,pace:"5:34"},{date:"2026-02-18",mi:5.0,pace:"5:35"},
  ],
  countries: [{name:"United States",runs:2169,mi:16277,detail:"16 states, 37 cities"},{name:"Canada",runs:7,mi:60,detail:"3 cities"},{name:"Ireland",runs:5,mi:43,detail:"Dublin, Galway"},{name:"China",runs:3,mi:20,detail:"Shanghai, Suzhou"}],
  featured: [
    {
      id:"asheville",title:"Asheville Marathon",subtitle:"Sub-3:00 · BQ · 3rd Masters",
      date:"March 21, 2026",location:"Asheville, NC",distance:"26.30 mi (42.3 km)",
      time:"2:59:27",pace:"6:49/mi",elev:"+941 / −1,161 ft (net downhill)",hr:"167 avg / 188 max",
      cadence:"85 spm",stride:"1.38 m",steps:"30,504",calories:"10,911",
      te:"5.0 aer / 2.1 anaer",vo2:"65",maxPace:"6:00/mi",
      photo:"https://remikalir.com/wp-content/uploads/2026/03/remi_ashevillemarathon_portfolio3-scaled.jpg",
      photoCaption:"Approaching the finish in Asheville — 2:59:27",
      hrZones:[{z:"Zone 1–3",min:3.9,pct:2},{z:"Zone 4",min:31.3,pct:17},{z:"Zone 5",min:141.1,pct:79},{z:"Zone 6",min:3.1,pct:2}],
      segments:[],
      training:[{w:"-6",r:7,mi:31},{w:"-5",r:7,mi:35},{w:"-4",r:7,mi:46},{w:"-3",r:7,mi:44},{w:"-2",r:7,mi:32},{w:"-1",r:4,mi:19}],
      goals:["Break 3:00:00","Boston Marathon qualifier","Masters Division podium"],
      results:["2:59:27 — sub-3 by 33 seconds","BQ time achieved (qualifying standard: 3:25:00)","3rd place, Masters Division"],
      narrative:"The goal was sub-3:00 and I cleared it with 33 seconds to spare — also qualifying for Boston and placing third in the Masters Division. This was my marathon debut, built on a foundation of ultra training including a Frosty 50 in January (31.4 mi at 7:39/mi) and months of volume. The Asheville course is net downhill (−220 ft) but features punchy climbs totaling 941 ft of gain. I ran the entire race at threshold — 79% of the time in HR zone 5, peaking at 188 bpm. The 6:49/mi average was remarkably even. The last long run — a 21-miler at 6:52/mi — came 20 days before, and race week was a classic taper to 19 miles.",
    },
    {
      id:"fonta-flora",title:"Fonta Flora 50K",subtitle:"First ultramarathon · Sub-5:00",
      date:"October 25, 2025",location:"Burke County, NC",distance:"32.38 mi (52.1 km)",
      time:"4:48:12",pace:"8:54/mi",elev:"+3,523 ft (1,074 m)",hr:"157 avg / 176 max",
      cadence:"81 spm",stride:"1.11 m",steps:"46,886",calories:"15,516",
      te:"5.0 aerobic",vo2:"66",maxPace:"6:50/mi",
      photo:"https://remikalir.com/wp-content/uploads/2026/03/remi_fontaflora_portfolio1-scaled.jpeg",
      photoCaption:"On the Fonta Flora trail in the Blue Ridge foothills",
      hrZones:[{z:"Zone 1–2",min:5.2,pct:2},{z:"Zone 3",min:17.6,pct:6},{z:"Zone 4",min:152.6,pct:53},{z:"Zone 5",min:112.8,pct:39}],
      segments:[
        {n:1,mi:9.4,min:85,pace:"9:01",note:"Controlled start through rolling hills"},
        {n:2,mi:4.9,min:40,pace:"8:01",note:"Fastest segment — found a rhythm"},
        {n:3,mi:6.7,min:55,pace:"8:13",note:"Holding steady through the middle"},
        {n:4,mi:5.7,min:47,pace:"8:11",note:"Last comfortable segment"},
        {n:5,mi:2.2,min:21,pace:"9:36",note:"Fatigue sets in, pace drops"},
        {n:6,mi:1.8,min:18,pace:"10:10",note:"Grinding through the final miles"},
        {n:7,mi:0.6,min:6,pace:"9:48",note:"Short rolling segment"},
        {n:8,mi:0.8,min:8,pace:"10:04",note:"Push to the finish"},
      ],
      training:[{w:"-6",r:5,mi:41},{w:"-5",r:5,mi:35},{w:"-4",r:6,mi:45},{w:"-3",r:6,mi:44},{w:"-2",r:5,mi:33},{w:"-1",r:4,mi:19}],
      goals:["Finish first ultramarathon","Break 5:00:00"],
      results:["Finished in 4:48:12 — sub-5 by nearly 12 minutes","32.38 miles with 3,523 ft of climbing on trail"],
      narrative:"My first ultra — 50 kilometers through the Blue Ridge foothills on the Fonta Flora trail. The course featured relentless rolling terrain with 3,523 ft of climbing across 10 aid-station segments. I went out conservatively, holding 8:00–8:13/mi through the first four segments (26.8 miles), then slowed to 9:36–10:10/mi as fatigue set in over the final 5.6 miles. Heart rate stayed high — 92% of the race in zones 4–5 — and cadence dropped from 84 to 82 spm as stride shortened. The 6-week build peaked at 45 miles in week -4, tapering to 19 miles race week. Nearly 47,000 steps and 15,500 calories — the biggest day in the dataset by a wide margin.",
    },
    {
      id:"mistletoe",title:"2024 Mistletoe Run",subtitle:"Half marathon PR · 1st Masters · 8th overall",
      date:"December 7, 2024",location:"Winston-Salem, NC",distance:"13.23 mi (21.3 km)",
      time:"1:18:55",pace:"5:57/mi",elev:"+492 ft",hr:"N/A (sensor issue)",
      cadence:"88 spm",stride:"1.52 m",steps:"13,938",calories:"5,560",
      te:"2.2 aerobic",vo2:"—",maxPace:"5:12/mi",
      hrZones:[],segments:[],
      training:[{w:"-6",r:7,mi:47},{w:"-5",r:7,mi:37},{w:"-4",r:7,mi:42},{w:"-3",r:5,mi:42},{w:"-2",r:2,mi:12},{w:"-1",r:3,mi:22}],
      goals:["Win Masters Division","Target sub-1:20"],
      results:["1:18:55 — half marathon PR by 6 seconds","1st place, Masters Division","8th place overall"],
      prContext:[
        {date:"2024-12-07",time:"1:18:55",pace:"5:57",loc:"Winston-Salem",pr:true},
        {date:"2022-10-30",time:"1:19:01",pace:"6:01",loc:"Cambridge"},
        {date:"2022-10-16",time:"1:19:58",pace:"6:06",loc:"Cambridge"},
        {date:"2022-11-13",time:"1:20:35",pace:"6:05",loc:"Boston"},
        {date:"2021-02-28",time:"1:20:51",pace:"6:12",loc:"Denver"},
      ],
      narrative:"After 31 half-marathon-distance runs across 7 years, I broke through the 1:19 barrier at the Mistletoe Run in Winston-Salem — winning the Masters Division and placing 8th overall. The 5:57/mi average was my fastest ever over 13+ miles, 6 seconds quicker than my previous best set in Cambridge two years earlier. Biomechanics were dialed: 88 spm cadence and a 1.52 m stride, both distance bests. The course has moderate hills (492 ft gain), and cool December conditions were ideal. A sharp taper — 47 miles six weeks out, dropping to just 12 miles two weeks before — left me fresh.",
    },
    {
      id:"salem-lake",title:"Salem Lake 30K",subtitle:"3rd place overall",
      date:"September 28, 2024",location:"Winston-Salem, NC",distance:"18.90 mi (30.4 km)",
      time:"2:02:03",pace:"6:27/mi",elev:"+1,686 ft",hr:"156 avg / 174 max",
      cadence:"85 spm",stride:"1.45 m",steps:"20,920",calories:"7,684",
      te:"5.0 aerobic",vo2:"69",maxPace:"5:24/mi",
      hrZones:[],segments:[],
      training:[{w:"-6",r:5,mi:35},{w:"-5",r:6,mi:45},{w:"-4",r:7,mi:44},{w:"-3",r:7,mi:35},{w:"-2",r:5,mi:39},{w:"-1",r:4,mi:31}],
      goals:["Complete first Salem Lake 30K","Compete for a podium finish"],
      results:["2:02:03 finish time","3rd place overall","VO2 max reading of 69 — season peak"],
      narrative:"My first Salem Lake 30K — a hilly loop course around Salem Lake in Winston-Salem with 1,686 ft of climbing over 18.9 miles. I came in third place overall at a 6:27/mi pace, which at the time was my fastest effort at any distance beyond a half marathon. The course is demanding — the elevation profile never lets up — and my max pace hit 5:24/mi on the downhills. Heart rate averaged 156 with a max of 174, and Garmin recorded a VO2 max of 69, my peak for the year. This race marked the beginning of my move into longer distances, setting the stage for the Fonta Flora 50K and the Asheville Marathon that followed.",
    },
  ],
  photos: {
    frosty: "https://remikalir.com/wp-content/uploads/2026/03/remi_frosty50_portfolio2-scaled.jpg",
  },
};

const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TABS=["overview","mileage","pace","geography","records","featured","about"];
const C={purple:"#6B5CE7",pl:"#8B7FE8",pf:"rgba(107,92,231,0.08)",pb:"rgba(107,92,231,0.2)",dk:"#1a1a2e",mu:"rgba(26,26,46,0.45)",ft:"rgba(26,26,46,0.35)",ln:"rgba(0,0,0,0.06)",lf:"rgba(0,0,0,0.04)",coral:"#D85A30",blue:"#378ADD"};

function Bar({value,max,color=C.purple,height=18}){
  return <div style={{width:"100%",height,background:"rgba(128,128,128,0.08)",borderRadius:3}}><div style={{width:`${max>0?(value/max)*100:0}%`,height:"100%",background:color,borderRadius:3,transition:"width 0.5s ease"}}/></div>;
}
function StatCard({label,value,unit,accent}){
  return <div style={{padding:"18px 20px",borderRadius:10,background:accent?"linear-gradient(135deg,#2D2655,#1a1440)":"rgba(128,128,128,0.06)",color:accent?"#fff":"inherit"}}>
    <div style={{fontSize:11,letterSpacing:"0.06em",textTransform:"uppercase",opacity:0.6,marginBottom:6}}>{label}</div>
    <div style={{fontSize:26,fontWeight:600,fontFamily:"'DM Mono',monospace",letterSpacing:"-0.5px"}}>{value}{unit&&<span style={{fontSize:13,fontWeight:400,opacity:0.5,marginLeft:3}}>{unit}</span>}</div>
  </div>;
}
function PRCard({dist,time}){
  return <div style={{textAlign:"center",padding:"14px 8px",borderRadius:10,border:`1px solid ${C.pb}`,background:C.pf}}>
    <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:C.pl,marginBottom:6}}>{dist}</div>
    <div style={{fontSize:22,fontWeight:600,fontFamily:"'DM Mono',monospace",color:C.purple}}>{time}</div>
  </div>;
}
function Pill({children,active,onClick}){
  return <button onClick={onClick} style={{fontSize:12,padding:"5px 14px",borderRadius:6,cursor:"pointer",fontWeight:active?600:400,border:active?`1px solid ${C.purple}`:"1px solid rgba(0,0,0,0.1)",background:active?C.pf:"transparent",color:active?C.purple:C.mu}}>{children}</button>;
}
function Sec({children,sub}){return <div style={{marginBottom:16}}><h2 style={{fontSize:18,fontWeight:600,letterSpacing:"-0.3px",margin:0}}>{children}</h2>{sub&&<div style={{fontSize:12,color:C.ft,marginTop:2}}>{sub}</div>}</div>;}

function Choropleth({mode}){
  const ref=useRef(null);const[ok,setOk]=useState(false);
  useEffect(()=>{if(window.d3&&window.topojson){setOk(true);return;}const s1=document.createElement("script");s1.src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js";s1.onload=()=>{const s2=document.createElement("script");s2.src="https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js";s2.onload=()=>setOk(true);document.body.appendChild(s2);};document.body.appendChild(s1);},[]);
  useEffect(()=>{if(!ok||!ref.current)return;const el=ref.current;el.innerHTML="";const{d3,topojson}=window;const st=DATA.usStatesMap;
    const ramp=["#EEEDFE","#CECBF6","#AFA9EC","#7F77DD","#534AB7","#3C3489","#26215C"];
    const tM=[1,10,50,400,2000,5000],tR=[1,3,10,50,200,500];
    const gc=n=>{const s=st[n];if(!s)return"rgba(128,128,128,0.06)";const v=mode==="miles"?s.mi:s.runs;const t=mode==="miles"?tM:tR;for(let i=5;i>=0;i--)if(v>=t[i])return ramp[i+1];return ramp[0];};
    const svg=d3.select(el).append("svg").attr("viewBox","0 0 960 600").attr("width","100%");
    const proj=d3.geoAlbersUsa().scale(1280).translate([480,300]);
    d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json").then(us=>{
      svg.selectAll("path").data(topojson.feature(us,us.objects.states).features).join("path").attr("d",d3.geoPath(proj)).attr("fill",d=>gc(d.properties.name)).attr("stroke","#fff").attr("stroke-width",0.8);
      [{n:"Colorado",la:39,lo:-105.5},{n:"North Carolina",la:35.5,lo:-79.5},{n:"Massachusetts",la:42.3,lo:-71.8},{n:"California",la:37,lo:-119.5}].forEach(l=>{const p=proj([l.lo,l.la]);if(p)svg.append("text").attr("x",p[0]).attr("y",p[1]).attr("text-anchor","middle").attr("font-size",10).attr("font-weight",500).attr("fill","#26215C").attr("pointer-events","none").text(l.n);});
    });
  },[ok,mode]);
  return <div ref={ref} style={{width:"100%",marginBottom:12}}>{!ok&&<div style={{height:200,display:"flex",alignItems:"center",justifyContent:"center",color:C.mu,fontSize:13}}>Loading map...</div>}</div>;
}

function RacePhoto({src,caption}){
  if(!src) return null;
  return <div style={{marginBottom:24,borderRadius:10,overflow:"hidden"}}>
    <img src={src} alt={caption||""} style={{width:"100%",height:"auto",display:"block",borderRadius:10}} loading="lazy"/>
    {caption&&<div style={{fontSize:12,color:C.ft,fontStyle:"italic",marginTop:8,textAlign:"center"}}>{caption}</div>}
  </div>;
}

function RaceCard({race,isOpen,onToggle}){
  const mx=Math.max(...race.training.map(w=>w.mi));
  const zc=["#AFA9EC","#7F77DD","#534AB7","#3C3489"];
  return(
    <div style={{border:`1px solid ${isOpen?C.purple:"rgba(0,0,0,0.08)"}`,borderRadius:14,marginBottom:16,overflow:"hidden",transition:"border-color 0.2s"}}>
      <button onClick={onToggle} style={{width:"100%",padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",background:isOpen?"rgba(107,92,231,0.03)":"transparent",border:"none",cursor:"pointer",textAlign:"left"}}>
        <div><div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:C.purple,fontWeight:600,marginBottom:4}}>{race.subtitle}</div>
        <div style={{fontSize:20,fontWeight:700,color:C.dk,letterSpacing:"-0.3px"}}>{race.title}</div>
        <div style={{fontSize:13,color:C.mu,marginTop:4}}>{race.date} · {race.location}</div></div>
        <div style={{textAlign:"right",flexShrink:0,marginLeft:16}}>
          <div style={{fontSize:24,fontWeight:600,fontFamily:"'DM Mono',monospace",color:C.purple}}>{race.time}</div>
          <div style={{fontSize:13,color:C.mu}}>{race.distance} · {race.pace}</div>
        </div>
      </button>
      {isOpen&&<div style={{padding:"0 24px 24px",borderTop:`1px solid ${C.ln}`}}><div style={{paddingTop:20}}>
        {/* Photo */}
        <RacePhoto src={race.photo} caption={race.photoCaption}/>
        {/* Goals & Results */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
          <div style={{padding:"16px 18px",borderRadius:10,background:"rgba(128,128,128,0.04)",borderLeft:`3px solid ${C.mu}`}}>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:C.mu,marginBottom:8,fontWeight:600}}>Goals</div>
            {race.goals.map((g,i)=><div key={i} style={{fontSize:13,color:C.dk,padding:"3px 0",lineHeight:1.5}}>{g}</div>)}
          </div>
          <div style={{padding:"16px 18px",borderRadius:10,background:C.pf,borderLeft:`3px solid ${C.purple}`}}>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.06em",color:C.purple,marginBottom:8,fontWeight:600}}>Results</div>
            {race.results.map((r,i)=><div key={i} style={{fontSize:13,color:C.dk,padding:"3px 0",lineHeight:1.5}}>{r}</div>)}
          </div>
        </div>
        <p style={{fontSize:14,lineHeight:1.75,color:"rgba(26,26,46,0.65)",marginBottom:24}}>{race.narrative}</p>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16}}>
          {[["Elevation",race.elev],["Heart rate",race.hr],["Cadence",race.cadence],["Stride",race.stride]].map(([l,v])=>
            <div key={l} style={{padding:"12px 14px",borderRadius:8,background:"rgba(128,128,128,0.05)"}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em",color:C.mu,marginBottom:4}}>{l}</div>
              <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{v}</div></div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:24}}>
          {[["Steps",race.steps],["Calories",race.calories],["Training effect",race.te],["Max pace",race.maxPace]].map(([l,v])=>
            <div key={l} style={{padding:"12px 14px",borderRadius:8,background:"rgba(128,128,128,0.05)"}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em",color:C.mu,marginBottom:4}}>{l}</div>
              <div style={{fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{v}</div></div>)}
        </div>
        {/* HR Zones */}
        {race.hrZones.length>0&&<><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Heart rate zones</div>
          <div style={{display:"flex",gap:2,height:24,borderRadius:6,overflow:"hidden",marginBottom:6}}>
            {race.hrZones.map((z,i)=><div key={i} style={{flex:z.pct,background:zc[i],display:"flex",alignItems:"center",justifyContent:"center"}}>{z.pct>8&&<span style={{fontSize:10,color:"#fff",fontWeight:500}}>{z.pct}%</span>}</div>)}
          </div>
          <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
            {race.hrZones.map((z,i)=><span key={i} style={{fontSize:11,color:C.mu}}><span style={{display:"inline-block",width:8,height:8,borderRadius:2,background:zc[i],marginRight:4}}/>{z.z}: {Math.round(z.min)} min</span>)}
          </div></>}
        {/* Segments */}
        {race.segments.length>0&&<><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Race segments (aid station to aid station)</div>
          <div style={{marginBottom:24}}>
            {race.segments.map((s,i)=>{const mxM=Math.max(...race.segments.map(x=>x.min));return(
              <div key={i} style={{display:"grid",gridTemplateColumns:"24px 50px 1fr 60px 1fr",alignItems:"center",gap:8,padding:"5px 0",borderBottom:`1px solid ${C.lf}`}}>
                <span style={{fontSize:11,color:C.mu,fontFamily:"'DM Mono',monospace"}}>{s.n}</span>
                <span style={{fontSize:11,fontFamily:"'DM Mono',monospace"}}>{s.mi} mi</span>
                <Bar value={s.min} max={mxM} height={14} color={i<4?C.purple:C.coral}/>
                <span style={{fontSize:11,fontFamily:"'DM Mono',monospace"}}>{s.pace}/mi</span>
                <span style={{fontSize:11,color:C.ft}}>{s.note}</span></div>);})}
          </div></>}
        {/* PR Context */}
        {race.prContext&&<><div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Half marathon history — top 5</div>
          <div style={{marginBottom:24}}>
            {race.prContext.map((p,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"84px 80px 56px 1fr",alignItems:"center",gap:10,padding:"5px 0",borderBottom:`1px solid ${C.lf}`}}>
                <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:C.mu}}>{p.date}</span>
                <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:500,color:p.pr?C.purple:"inherit"}}>{p.time}</span>
                <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:C.mu}}>{p.pace}/mi</span>
                <span style={{fontSize:12,color:C.mu}}>{p.loc}{p.pr&&<span style={{marginLeft:6,fontSize:10,fontWeight:600,color:C.purple,background:C.pf,padding:"2px 6px",borderRadius:4}}>PR</span>}</span></div>))}
            <div style={{fontSize:11,color:C.ft,marginTop:4}}>31 half-marathon-distance runs total (2017–2026)</div>
          </div></>}
        {/* Training */}
        <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>6-week training build</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:6}}>
          {race.training.map((w,i)=>(
            <div key={i} style={{textAlign:"center"}}>
              <div style={{height:60,display:"flex",alignItems:"flex-end",justifyContent:"center",marginBottom:4}}>
                <div style={{width:"80%",height:`${(w.mi/mx)*100}%`,background:i===5?C.pl:C.purple,borderRadius:"3px 3px 0 0",minHeight:4}}/></div>
              <div style={{fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{w.mi}</div>
              <div style={{fontSize:10,color:C.mu}}>{w.r} runs</div>
              <div style={{fontSize:9,color:C.ft}}>Wk {w.w}</div></div>))}
        </div>
      </div></div>}
    </div>);
}

function AboutTab(){
  const ps={fontSize:15,lineHeight:1.85,color:"rgba(26,26,46,0.7)",marginBottom:20};
  const qs={fontSize:14,lineHeight:1.8,color:"rgba(26,26,46,0.55)",marginBottom:20,fontStyle:"italic",paddingLeft:20,borderLeft:`2px solid ${C.pl}`};
  return <div style={{maxWidth:720}}>
    {/* Hero photo */}
    <div style={{marginBottom:32,borderRadius:12,overflow:"hidden"}}>
      <img src={DATA.photos.frosty} alt="Remi running the Frosty 50" style={{width:"100%",height:"auto",display:"block",borderRadius:12}} loading="lazy"/>
      <div style={{fontSize:12,color:C.ft,fontStyle:"italic",marginTop:8,textAlign:"center"}}>Frosty 50 · Winston-Salem · January 2026</div>
    </div>

    <p style={ps}>Hi, I'm Remi, and I'm a runner.</p>

    <p style={ps}>The data in this portfolio are accurate (according to Garmin), not exhaustive (according to me), and are intended as an illustrative experiment.</p>

    <p style={ps}>The data are incomplete because I've been running regularly, and competitively, for nearly 30 years. In the fall of 1998, as a sophomore in high school, I earned my varsity letter as a starter on the cross country team; a few months later, in the middle of indoor track training, I quit the team because I struggled with my coach's style and lack of mentorship. But I kept running, for myself, on my own terms, nearly every morning before school, and I haven't stopped. I have no plans of doing so anytime soon.</p>

    <p style={ps}>The data are illustrative of an experiment that has nothing to do with my life as a runner. Why create and share this? Recently, I've started tinkering with Claude Code. Aside from being a runner, I'm a former professor of learning technology and I've always enjoyed playing with tools, exploring affordances, and carefully considering how — if at all — a given new something may be relevant to my personal interests and professional practices. Just over a week into my use of Claude Code, it's obvious that agentic AI tools represent a discernible shift that may indeed be paradigmatic.</p>

    <p style={ps}>In my first week using Claude Code, I have designed an entire online learning ecosystem comprised of multiple courses and activities rooted by my scholarly record, iterated an existing open educational resource to make it more aesthetically attractive and interactive for multiple audiences, prototyped a database-linked repository that could be used to advance institutional knowledge sharing, and also developed a new productivity and tracking system for my team so we can more comprehensively use data and improve our engagement with campus constituencies. After all that, all accomplished in the course of a week, I wanted to tackle a project that was more data-intensive.</p>

    <p style={ps}>For obvious reasons, I couldn't use research data or experiment with anything tied to my daily professional responsibilities at Duke. For a moment, I thought about using a publicly available dataset — maybe about a social concern or inequality, or maybe something like a ship manifest — but I ultimately decided it was best to experiment with data I knew well. My data.</p>

    <p style={ps}>As an illustrative experiment, using my running data made a lot of sense — the data are mine, representative of my body's effort and embodied learning, longitudinal, detailed, geographic, and are also personally memorable. Once I decided to use these data and make the portfolio public (because it wasn't, no apologies to Strava), I had to get everything out of Garmin. Though the Garmin Connect platform is mostly useful day-to-day, it doesn't make data export easy or historically comprehensive. Well, thank goodness for GDPR because you can easily request all your data from Garmin. I did so, received a link within hours, and then downloaded everything — fantastic.</p>

    <p style={ps}>And that's when I turned to Claude to read a trove of TCX and GPX files, comb through and synthesize my "DI-Connect" directory, and help me think through basic visualization approaches for this portfolio. The analytic work burned through Claude's session data multiple times, though that may also reflect my novice "vibe coding" chops. The easier pieces of this included moving the portfolio online and displaying everything on a subdomain of my site. Nonetheless, this entire project went from idea to prototype to live portfolio in less than a day, with my actual labor about four hours.</p>

    <p style={ps}>If you've gotten this far, and you've read all these words, please know that I wrote every single word while sitting on a bench at a playground while my six-year old played tag on a Sunday afternoon. Upon returning to my computer, I asked Claude to co-author a design statement summarizing the work we did together. Here is that contribution from Claude:</p>

    <div style={qs}>
      <p style={{marginBottom:12}}>"This running portfolio began as a Garmin GDPR data export — a zip file containing three JSON files and 2,273 runs recorded between January 2017 and March 2026. It was built collaboratively through conversation between Remi Kalir and Claude (Anthropic's AI assistant) across several working sessions in March 2026.</p>
      <p style={{marginBottom:12}}>The raw data posed immediate interpretation challenges. Garmin's GDPR export stores distances in centimeters, durations in milliseconds, speeds in centimeters-per-millisecond, and elevations in centimeters — none of which are documented in the export itself. Early analysis involved cross-referencing known runs against raw values to reverse-engineer the unit conversions, then validating those conversions against the full dataset.</p>
      <p style={{marginBottom:12}}>From there, the work moved through several phases: an initial statistical overview (yearly and monthly mileage, pace trends, VO2 max), then geographic analysis (classifying 2,273 runs across 45 cities, 16 U.S. states, and 4 countries — including resolving 188 'Unknown' location runs by matching coordinates and activity names to actual places), and finally the featured race analyses, which pulled heart rate zone data, segment-level pacing, and training load context from the six weeks preceding each event.</p>
      <p>The dashboard itself is a single self-contained React component with no backend — all data is embedded directly. The choropleth map loads D3 and TopoJSON at runtime. The design uses Instrument Sans paired with DM Mono for a typographic contrast between editorial text and data, with a restrained purple accent palette. Every chart is built from basic HTML and inline styles rather than a charting library, keeping the artifact lightweight and portable."</p>
    </div>

    <p style={ps}>Thanks, Claude. I hope you enjoy this portfolio and my data experiment. It was a thought provoking process for me. If you'd like to chat about my running, these data, Claude Code, or what all this might mean, you're very welcome to drop me a note at{" "}
      <a href="https://remikalir.com/contact/" style={{color:C.purple,textDecoration:"none",borderBottom:`1px solid ${C.pb}`}}>remikalir.com/contact</a>.
    </p>
  </div>;
}

export default function RunningPortfolio(){
  const[tab,setTab]=useState("overview");const[yearFilter,setYearFilter]=useState("all");
  const[geoMode,setGeoMode]=useState("map");const[mapMode,setMapMode]=useState("miles");
  const[openRace,setOpenRace]=useState("asheville");
  const maxYM=Math.max(...DATA.yearly.map(y=>y.miles));const maxP=Math.max(...DATA.paces.map(p=>p.c));
  const maxLR=DATA.locations[0].runs;
  const fMo=yearFilter==="all"?DATA.monthly:DATA.monthly.filter(m=>m.m.startsWith(yearFilter));
  const maxFM=Math.max(...fMo.map(m=>m.mi),1);
  return(
    <div style={{fontFamily:"'Instrument Sans','DM Sans',system-ui,sans-serif",maxWidth:900,margin:"0 auto",padding:"0 16px",color:C.dk}}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      <header style={{padding:"48px 0 32px",borderBottom:`2px solid ${C.dk}`}}>
        <div style={{display:"flex",alignItems:"baseline",gap:12,flexWrap:"wrap"}}>
          <h1 style={{fontSize:36,fontWeight:700,letterSpacing:"-1.5px",margin:0}}>Running portfolio</h1>
          <span style={{fontSize:14,color:C.purple,fontWeight:500}}>Remi Kalir</span>
        </div>
        <p style={{fontSize:15,color:C.mu,marginTop:8,lineHeight:1.5}}>2,273 runs across 9 years, 4 countries, and 16 U.S. states — Jan 2017 to Mar 2026</p>
      </header>
      <nav style={{display:"flex",gap:0,borderBottom:`1px solid ${C.ln}`,marginBottom:32,overflowX:"auto"}}>
        {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:"14px 18px",fontSize:13,fontWeight:tab===t?600:400,letterSpacing:"0.02em",textTransform:"uppercase",border:"none",background:"none",cursor:"pointer",borderBottom:tab===t?`2px solid ${C.purple}`:"2px solid transparent",color:tab===t?C.purple:C.mu,transition:"all 0.2s",whiteSpace:"nowrap"}}>{t}</button>)}
      </nav>

      {/* OVERVIEW */}
      {tab==="overview"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:28}}>
          <StatCard label="Total miles" value={DATA.summary.totalMiles.toLocaleString()} accent/><StatCard label="Total runs" value={DATA.summary.totalRuns.toLocaleString()}/><StatCard label="Total hours" value={DATA.summary.totalHours.toLocaleString()}/><StatCard label="Runs / week" value={DATA.summary.avgPerWeek} unit="avg"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:36}}>
          <PRCard dist="Mile" time={DATA.summary.prMile}/><PRCard dist="5K" time={DATA.summary.pr5k}/><PRCard dist="Half marathon" time={DATA.summary.prHalf}/><PRCard dist="Marathon" time={DATA.summary.prMarathon}/>
        </div>
        <Sec>Year by year</Sec>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:36}}>
          {DATA.yearly.map(y=><div key={y.year} style={{display:"grid",gridTemplateColumns:"48px 1fr 70px 70px",alignItems:"center",gap:12,padding:"6px 0"}}>
            <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{y.year}</span><Bar value={y.miles} max={maxYM} color={y.year>=2024?C.purple:C.pl+"80"}/><span style={{fontSize:13,fontFamily:"'DM Mono',monospace",textAlign:"right"}}>{y.miles.toLocaleString()}<span style={{fontSize:10,opacity:0.4}}> mi</span></span><span style={{fontSize:12,color:C.mu,textAlign:"right"}}>{y.pace}/mi</span></div>)}
        </div>
        <Sec>Home bases</Sec>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:36}}>
          {DATA.homes.map((h,i)=><div key={i} style={{padding:20,borderRadius:12,border:"1px solid rgba(0,0,0,0.08)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:i===2?C.purple:C.pl+"50"}}/>
            <div style={{fontSize:16,fontWeight:600,marginBottom:4}}>{h.name}</div><div style={{fontSize:12,color:C.mu,marginBottom:12}}>{h.dates}</div>
            <div style={{fontSize:13,lineHeight:1.8}}><span style={{fontFamily:"'DM Mono',monospace",fontWeight:500}}>{h.runs.toLocaleString()}</span> runs · <span style={{fontFamily:"'DM Mono',monospace",fontWeight:500}}>{h.miles.toLocaleString()}</span> mi · <span style={{fontFamily:"'DM Mono',monospace"}}>{h.pace}</span>/mi</div>
            <div style={{fontSize:12,color:C.ft,marginTop:8,fontStyle:"italic"}}>{h.note}</div></div>)}
        </div>
        <Sec>Day of week</Sec>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:36}}>
          {DATA.weekday.map(w=><div key={w.d} style={{textAlign:"center",padding:"14px 4px",borderRadius:10,background:w.d==="Sun"?C.pf:C.lf}}>
            <div style={{fontSize:11,color:C.mu,marginBottom:6}}>{w.d}</div><div style={{fontSize:18,fontWeight:600,fontFamily:"'DM Mono',monospace"}}>{w.r}</div><div style={{fontSize:11,color:C.ft,marginTop:2}}>{w.mi.toLocaleString()} mi</div></div>)}
        </div>
      </>}

      {/* MILEAGE */}
      {tab==="mileage"&&<>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,flexWrap:"wrap"}}>
          <span style={{fontSize:13,color:C.mu}}>Year:</span>
          {["all",...DATA.yearly.map(y=>String(y.year))].map(yr=><Pill key={yr} active={yearFilter===yr} onClick={()=>setYearFilter(yr)}>{yr==="all"?"All":yr}</Pill>)}
        </div>
        {yearFilter!=="all"&&<div style={{fontSize:14,color:C.mu,marginBottom:12}}>{(()=>{const y=DATA.yearly.find(y=>String(y.year)===yearFilter);return y?`${y.runs} runs · ${y.miles.toLocaleString()} miles · ${y.pace}/mi avg`:"";})()}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:3,marginBottom:36}}>
          {fMo.map(m=>{const label=yearFilter==="all"?m.m:MONTHS[parseInt(m.m.split("-")[1])-1];return(
            <div key={m.m} style={{display:"grid",gridTemplateColumns:"60px 1fr 50px",alignItems:"center",gap:10,padding:"3px 0"}}>
              <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:C.mu}}>{label}</span><Bar value={m.mi} max={maxFM} height={14} color={m.mi>=180?C.purple:C.pl+"80"}/><span style={{fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"right"}}>{Math.round(m.mi)}</span></div>);})}
        </div>
      </>}

      {/* PACE */}
      {tab==="pace"&&<>
        <Sec>Pace distribution</Sec>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:36}}>
          {DATA.paces.map(p=><div key={p.p} style={{display:"grid",gridTemplateColumns:"56px 1fr 40px",alignItems:"center",gap:10}}>
            <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"right",color:C.mu}}>{p.p}</span><Bar value={p.c} max={maxP} height={20} color={p.p==="6:30"?C.purple:p.p==="6:00"?C.pl:C.pl+"60"}/><span style={{fontSize:12,fontFamily:"'DM Mono',monospace"}}>{p.c}</span></div>)}
          <div style={{fontSize:12,color:C.ft,marginTop:8,paddingLeft:66}}>min/mi — most runs land between 6:00 and 7:00</div>
        </div>
        <Sec>Avg pace by year</Sec>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:36}}>
          {DATA.yearly.map(y=><div key={y.year} style={{display:"grid",gridTemplateColumns:"48px 1fr 60px",alignItems:"center",gap:10}}>
            <span style={{fontSize:12,fontFamily:"'DM Mono',monospace"}}>{y.year}</span>
            <div style={{position:"relative",height:20}}><div style={{position:"absolute",top:9,left:0,right:0,height:1,background:C.ln}}/><div style={{position:"absolute",left:`${((y.paceN-6.0)/1.5)*100}%`,top:2,width:16,height:16,borderRadius:"50%",background:C.purple,opacity:y.year>=2024?1:0.5}}/></div>
            <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:C.mu}}>{y.pace}/mi</span></div>)}
          <div style={{display:"flex",justifyContent:"space-between",paddingLeft:58,paddingRight:70,fontSize:10,color:C.ft}}><span>6:00</span><span>6:30</span><span>7:00</span><span>7:30</span></div>
        </div>
        <Sec>VO2 max</Sec>
        <div style={{display:"flex",alignItems:"flex-end",gap:2,height:100,marginBottom:8,padding:"0 4px"}}>
          {DATA.vo2.map((v,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
            <div style={{fontSize:9,color:C.mu,marginBottom:2}}>{Math.round(v.v)}</div><div style={{width:"100%",maxWidth:32,height:`${((v.v-58)/14)*100}%`,background:v.v>=68?C.purple:C.pl+"70",borderRadius:"3px 3px 0 0"}}/></div>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.ft,padding:"0 4px",marginBottom:36}}>
          {DATA.vo2.map((v,i)=><span key={i} style={{flex:1,textAlign:"center"}}>{v.d.slice(2)}</span>)}
        </div>
        <Sec>Biomechanics</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:36}}>
          <div><div style={{fontSize:12,color:C.mu,marginBottom:10}}>Cadence (steps/min)</div>
            {DATA.bio.map(b=><div key={b.y} style={{display:"grid",gridTemplateColumns:"40px 1fr 36px",alignItems:"center",gap:8,padding:"3px 0"}}>
              <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:C.mu}}>{b.y}</span><Bar value={b.c-82} max={6} height={12} color={C.coral}/><span style={{fontSize:11,fontFamily:"'DM Mono',monospace"}}>{b.c}</span></div>)}</div>
          <div><div style={{fontSize:12,color:C.mu,marginBottom:10}}>Stride length (meters)</div>
            {DATA.bio.map(b=><div key={b.y} style={{display:"grid",gridTemplateColumns:"40px 1fr 36px",alignItems:"center",gap:8,padding:"3px 0"}}>
              <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:C.mu}}>{b.y}</span><Bar value={b.s-1.2} max={0.35} height={12} color={C.blue}/><span style={{fontSize:11,fontFamily:"'DM Mono',monospace"}}>{b.s}</span></div>)}</div>
        </div>
      </>}

      {/* GEOGRAPHY */}
      {tab==="geography"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28}}>
          <StatCard label="Countries" value={DATA.summary.countries}/><StatCard label="U.S. states" value={DATA.summary.usStates} accent/><StatCard label="Cities" value={DATA.summary.cities}/>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>{["map","states","cities","countries"].map(m=><Pill key={m} active={geoMode===m} onClick={()=>setGeoMode(m)}>{m}</Pill>)}</div>
        {geoMode==="map"&&<>
          <div style={{display:"flex",gap:6,marginBottom:12}}><Pill active={mapMode==="miles"} onClick={()=>setMapMode("miles")}>Miles</Pill><Pill active={mapMode==="runs"} onClick={()=>setMapMode("runs")}>Runs</Pill></div>
          <Choropleth mode={mapMode} key={mapMode}/>
          <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:24,flexWrap:"wrap"}}>
            <span style={{fontSize:11,color:C.mu,marginRight:6}}>{mapMode==="miles"?"Miles:":"Runs:"}</span>
            {["#EEEDFE","#CECBF6","#AFA9EC","#7F77DD","#534AB7","#3C3489","#26215C"].map((col,i)=><span key={i} style={{display:"inline-block",width:36,height:12,background:col}}/>)}
            <span style={{fontSize:10,color:C.ft,marginLeft:8}}>{mapMode==="miles"?"0 → 1 → 10 → 50 → 400 → 2k → 5k+":"0 → 1 → 3 → 10 → 50 → 200 → 500+"}</span>
          </div>
          <div style={{marginBottom:36}}>{DATA.usStates.map((s,i)=><div key={s.name} style={{display:"grid",gridTemplateColumns:"130px 1fr 80px 70px",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid ${C.lf}`}}>
            <span style={{fontSize:13,fontWeight:i<3?600:400}}>{s.name}</span><Bar value={s.mi} max={DATA.usStates[0].mi} height={12} color={i===0?C.purple:i<3?C.pl:C.pl+"50"}/><span style={{fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"right"}}>{s.mi.toLocaleString()} mi</span><span style={{fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"right",color:C.mu}}>{s.runs}</span></div>)}</div>
        </>}
        {geoMode==="states"&&<div style={{marginBottom:36}}>{DATA.usStates.map((s,i)=><div key={s.name} style={{display:"grid",gridTemplateColumns:"130px 1fr 80px 70px 1fr",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.lf}`}}>
          <span style={{fontSize:13,fontWeight:i<3?600:400}}>{s.name}</span><Bar value={s.mi} max={DATA.usStates[0].mi} height={14} color={i<3?C.purple:C.pl+"50"}/><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"right"}}>{s.mi.toLocaleString()} mi</span><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"right",color:C.mu}}>{s.runs}</span><span style={{fontSize:11,color:C.ft}}>{s.cities}</span></div>)}</div>}
        {geoMode==="cities"&&<div style={{marginBottom:36}}>
          {DATA.locations.map((l,i)=><div key={l.name} style={{display:"grid",gridTemplateColumns:"140px 1fr 80px 70px",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${C.lf}`}}>
            <span style={{fontSize:13,fontWeight:i<3?600:400}}>{l.name}{i<3&&<span style={{fontSize:9,color:C.purple,marginLeft:6,verticalAlign:"super"}}>HOME</span>}</span>
            <Bar value={l.runs} max={maxLR} height={14} color={i<3?C.purple:C.pl+"50"}/><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"right"}}>{l.mi.toLocaleString()} mi</span><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",textAlign:"right",color:C.mu}}>{l.runs}</span></div>)}
          <div style={{fontSize:12,color:C.ft,marginTop:8}}>+ 30 more cities with 1–2 runs each</div></div>}
        {geoMode==="countries"&&<div style={{marginBottom:36}}>{DATA.countries.map((ct,i)=><div key={ct.name} style={{display:"flex",alignItems:"center",gap:16,padding:"14px 0",borderBottom:`1px solid ${C.ln}`}}>
          <div style={{width:36,height:36,borderRadius:8,background:C.pf,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:C.purple}}>{["US","CA","IE","CN"][i]}</div>
          <div style={{flex:1}}><div style={{fontSize:15,fontWeight:500}}>{ct.name}</div><div style={{fontSize:12,color:C.mu,marginTop:2}}>{ct.detail}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:14,fontFamily:"'DM Mono',monospace",fontWeight:500}}>{ct.mi.toLocaleString()} mi</div><div style={{fontSize:12,color:C.mu}}>{ct.runs} runs</div></div></div>)}</div>}
        <Sec>Home base timeline</Sec>
        <div style={{position:"relative",paddingLeft:28,marginBottom:36}}>
          <div style={{position:"absolute",left:8,top:10,bottom:10,width:2,background:C.pl+"30"}}/>
          {DATA.homes.map((h,i)=><div key={i} style={{position:"relative",padding:"14px 0"}}>
            <div style={{position:"absolute",left:-23,top:20,width:12,height:12,borderRadius:"50%",border:`2px solid ${C.purple}`,background:i===2?C.purple:"#fff"}}/>
            <div style={{fontSize:12,color:C.mu,marginBottom:3}}>{h.dates}</div><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>{h.name}</div>
            <div style={{fontSize:13,color:C.mu}}>{h.runs.toLocaleString()} runs · {h.miles.toLocaleString()} miles · {h.pace}/mi avg</div>
            <div style={{fontSize:12,color:C.ft,fontStyle:"italic",marginTop:4}}>{h.note}</div></div>)}
        </div>
      </>}

      {/* RECORDS */}
      {tab==="records"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:32}}>
          <PRCard dist="Mile" time={DATA.summary.prMile}/><PRCard dist="5K" time={DATA.summary.pr5k}/><PRCard dist="Half marathon" time={DATA.summary.prHalf}/><PRCard dist="Marathon" time={DATA.summary.prMarathon}/>
        </div>
        <Sec>Longest runs</Sec>
        <div style={{marginBottom:32}}>{DATA.longest.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"90px 1fr 60px 70px",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.lf}`}}>
          <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:C.mu}}>{r.date}</span><span style={{fontSize:14,fontWeight:500}}>{r.name}</span><span style={{fontSize:14,fontFamily:"'DM Mono',monospace",fontWeight:600,textAlign:"right"}}>{r.mi}<span style={{fontSize:10,opacity:0.4}}> mi</span></span><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:C.mu,textAlign:"right"}}>{r.pace}/mi</span></div>)}</div>
        <Sec>Fastest runs <span style={{fontSize:12,fontWeight:400,color:C.ft}}>5K+ distance</span></Sec>
        <div style={{marginBottom:32}}>{DATA.fastest.map((r,i)=><div key={i} style={{display:"grid",gridTemplateColumns:"90px 1fr 60px",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.lf}`}}>
          <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:C.mu}}>{r.date}</span><span style={{fontSize:14,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{r.pace}<span style={{fontSize:11,fontWeight:400,opacity:0.4}}>/mi</span></span><span style={{fontSize:12,fontFamily:"'DM Mono',monospace",color:C.mu,textAlign:"right"}}>{r.mi} mi</span></div>)}</div>
      </>}

      {/* FEATURED */}
      {tab==="featured"&&<>
        <div style={{marginBottom:12}}><Sec sub="Detailed analyses of four key races from the past 18 months">Featured races</Sec></div>
        {DATA.featured.map(race=><RaceCard key={race.id} race={race} isOpen={openRace===race.id} onToggle={()=>setOpenRace(openRace===race.id?null:race.id)}/>)}
      </>}

      {/* ABOUT */}
      {tab==="about"&&<AboutTab/>}

      <footer style={{padding:"32px 0",borderTop:`1px solid ${C.ln}`,marginTop:24,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:C.ft}}>Data from Garmin Connect GDPR export · Built with Claude</span>
        <span style={{fontSize:12,color:C.ft}}>Last updated Mar 2026</span>
      </footer>
    </div>);
}
