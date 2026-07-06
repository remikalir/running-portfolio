import { useState, useEffect, useRef } from "react";
import { DATA } from "./data.js";
import { CONTENT } from "./content.js";

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
      <img src={CONTENT.photos.frosty} alt="Remi running the Frosty 50" style={{width:"100%",height:"auto",display:"block",borderRadius:12}} loading="lazy"/>
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
        <p style={{fontSize:15,color:C.mu,marginTop:8,lineHeight:1.5}}>{DATA.summary.totalRuns.toLocaleString()} runs across {DATA.summary.countries} countries and {DATA.summary.usStates} U.S. states — Dec 2016 to Jun 2026</p>
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
            <div style={{fontSize:12,color:C.ft,marginTop:8,fontStyle:"italic"}}>{CONTENT.homeNotes[h.name]}</div></div>)}
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
          <div style={{fontSize:12,color:C.ft,marginTop:8}}>+ {DATA.moreCities} more cities with 1–2 runs each</div></div>}
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
            <div style={{fontSize:12,color:C.ft,fontStyle:"italic",marginTop:4}}>{CONTENT.homeNotes[h.name]}</div></div>)}
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
        {CONTENT.featured.map(race=><RaceCard key={race.id} race={race} isOpen={openRace===race.id} onToggle={()=>setOpenRace(openRace===race.id?null:race.id)}/>)}
      </>}

      {/* ABOUT */}
      {tab==="about"&&<AboutTab/>}

      <footer style={{padding:"32px 0",borderTop:`1px solid ${C.ln}`,marginTop:24,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:12,color:C.ft}}>Data from Garmin Connect GDPR export · Built with Claude</span>
        <span style={{fontSize:12,color:C.ft}}>Last updated Jul 2026</span>
      </footer>
    </div>);
}
