// AUTHORED CONTENT — Remi's voice and curated race records.
// Safe to hand-edit. NOT touched by tools/build_data.py.

export const CONTENT = {
  featured: [
    {
      id:"asheville",gpx:"22249863855",title:"Asheville Marathon",subtitle:"Sub-3:00 · BQ · 3rd Masters",
      date:"March 21, 2026",location:"Asheville, NC",distance:"26.2 mi (42.2 km)",
      time:"2:59:27",pace:"6:51/mi",
      photo:"/photos/asheville.jpg",
      photoCaption:"Enjoying downtown Asheville on my way to a 2:59:27 finish",
      segments:[],
      goals:["Break 3:00:00","Boston Marathon qualifier","Masters Division podium"],
      results:["2:59:27 — sub-3 by 33 seconds","BQ time achieved (qualifying standard: 3:05:00)","3rd place, Masters Division"],
      narrative:"The goal was sub-3:00 and I cleared it with 33 seconds to spare — also qualifying for Boston and placing third in the Masters Division. This was my road marathon debut in North Carolina, built on a foundation of ultra training including the Frosty 50K in January (7:44/mi) and months of volume. The Asheville course is net downhill (−220 ft) but features punchy climbs totaling 941 ft of gain. I ran the entire race at threshold — 79% of the time in HR zone 5, peaking at 188 bpm. My 6:51/mi average pace was pretty consistent throughout the race. My last long run — a 21-miler at 6:52/mi — came 20 days before, and race week was a classic taper to 19 miles.",
    },
    {
      id:"fonta-flora",gpx:"20795217749",title:"Fonta Flora 50K",subtitle:"First ultramarathon · Sub-5:00",
      date:"October 25, 2025",location:"Burke County, NC",distance:"32.38 mi (52.1 km)",
      time:"4:48:12",pace:"8:54/mi",
      photo:"/photos/fontaflora.jpeg",
      photoCaption:"On the Fonta Flora trail in the Blue Ridge foothills",
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
      goals:["Complete first ultramarathon","Break 5:00:00"],
      results:["Finished in 4:48:12 — sub-5 by nearly 12 minutes","32.38 miles with 3,523 ft of climbing on trail"],
      narrative:"My first ultra — 50 kilometers through the Blue Ridge foothills in Lake James State Park. The course featured relentless rolling terrain with 3,523 ft of climbing through winding single-track, beautiful woods, mountain bike trails, and the lakefront. I went out conservatively, holding 8:00–8:13/mi through the first four segments (26.8 miles), then slowed to 9:36–10:10/mi as fatigue set in over the final 5.6 miles. Heart rate stayed high — 92% of the race in zones 4–5 — and cadence dropped from 84 to 82 spm as stride shortened. The 6-week build peaked at 45 miles in week -4, tapering to 19 miles race week. Nearly 47,000 steps and 15,500 calories — the biggest day in the dataset by a wide margin.",
    },
    {
      id:"mistletoe",gpx:"17710808922",title:"2024 Mistletoe Run",subtitle:"Half marathon PR · 1st Masters · 8th overall",
      date:"December 7, 2024",location:"Winston-Salem, NC",distance:"13.23 mi (21.3 km)",
      time:"1:18:55",pace:"6:01/mi",
      photo:"/photos/mistletoe.png",
      photoCaption:"My finisher certificate from the 2024 Mistletoe Run",
      segments:[],
      goals:["Masters Division podium","Target sub-1:20"],
      results:["1:18:55 — half marathon PR by 6 seconds","1st place, Masters Division","8th place overall"],
      narrative:"After 31 half-marathon-distance runs across 7 years, I finally broke through the 1:19 barrier at the Mistletoe Run in Winston-Salem — winning the Masters Division and placing 8th overall. The 6:01/mi average was my fastest ever over 13+ miles, 6 seconds quicker than my previous best set during a training run in Cambridge two years earlier. Biomechanics were dialed: 88 spm cadence and a 1.52 m stride, both distance bests. The course has moderate hills through my neighborhood and Wake Forest's campus (492 ft gain), and cold December conditions were ideal (it was about 20 degrees when we started). A sharp taper — 47 miles six weeks out, dropping to just 12 miles two weeks before on account of a minor injury — left me fresh.",
    },
    {
      id:"salem-lake",gpx:"17152917951",title:"Salem Lake 30K",subtitle:"3rd place overall",
      date:"September 28, 2024",location:"Winston-Salem, NC",distance:"18.90 mi (30.4 km)",
      time:"2:02:00",pace:"6:33/mi",
      photo:"/photos/salemlake.jpg",
      photoCaption:"Award tile featuring original artwork from a participant at Monarch's Studio 651",
      segments:[],
      goals:["Complete first Salem Lake 30K","Compete for a podium finish"],
      results:["2:02:00 finish time","3rd place overall","VO2 max reading of 69 — season peak"],
      narrative:"My first Salem Lake 30K — a hilly loop course around Salem Lake in Winston-Salem with 1,686 ft of climbing over 18.9 miles. I was pleasantly surprised to place third overall at a 6:33/mi pace, which at the time was my fastest race effort at any distance beyond a half marathon. The course is demanding — the elevation profile never lets up — and my max pace hit 5:24/mi on the downhills. Heart rate averaged 156 with a max of 174, and Garmin recorded a VO2 max of 69, my peak for the year. This race marked the beginning of my move into longer race distances, setting the stage for the Fonta Flora 50K and the Asheville Marathon that followed.",
    },
  ],
  photos: {
    frosty: "/photos/frosty50.jpg",
  },
  homeNotes: {
    "Denver, CO": "7 years at altitude, City Park loops",
    "Cambridge, MA": "11 months along the Charles",
    "Winston-Salem, NC": "Ultra & marathon training base"
  },

  // ── PHASE 4 ADDITIONS ──────
  // Editorial voice lines: exactly one Fraunces-italic line per view, in your
  // voice. These are placeholders; rewrite each as the graph's topic sentence.
  voiceLines: {
    overview: "curating a running ledger, a decade of data from my years as a runner",
    mileage: "lacing up forty pairs of shoes, give or take",
    pace: "finding rhythm with heat, rain, snow, toddler in stroller, illness, injuries, recovery, goals",
    geography: "enjoying seven years at altitude, a sabbatical along the Charles, and my new home base",
    timeline: "training across my three home bases, with some selected wandering",
    trails: "visualizing groundtruth—a mix of familiar and singular trails",
    records: "celebrating my personal records from both races and training",
    featured: "featuring four recent races—two road, two trail—around North Carolina",
    log: "\"all that raw land that rolls... and all that road going...\"",
  },

  // ── LOG (microblog) ──────
  // Weekly-ish authored notes about training, recovery, events, and races.
  // Pipeline never touches this. The renderer sorts newest-first, so add an
  // entry anywhere in the array (each is { date: "YYYY-MM-DD", body: "…" }).
  // NOTE: these notes may mention runs that post-date the last Garmin export,
  // so they intentionally aren't reflected in the portfolio totals until the
  // next data refresh — see microblogNote.
  microblog: [
    { date: "2026-08-02", body: "calm Sunday morning at Salem Lake, light rain, first time running here since my surgery. If I can do one loop now with no pain, I can do four during next year's 50k."},
    { date: "2026-07-31", body: "left food said good morning with some brief pangs but more importantly, no ab dullness or core pain, easy 4.7 out-and-back to Reynolda with calm-ish HR and relaxed pace, off tomorrow, I need to stretch."},
    { date: "2026-07-29", body: "this is the kind of recovery run that builds my confidence, set the treadmill at 7 mph and relaxed into 5 miles, focused entirely on breath and settling my heart rate, pleased to see avg HR at 131 in low zone 3. A little dull ache in left abs around mile 3, faded as with other runs. Rest tomorrow."},
    { date: "2026-07-28", body: "4.1 in the neighborhood, no pain including in lower abdominal and that's a first since I started running, felt very comfortable and could feel my pace increasing and focus sharpening. I've got an engine and I could finally feel it dormant beneath the surface today. 7:47 avg, 140 HR, goal tomorrow is low HR on treadmill to shake out." },
    { date: "2026-07-26", body: "after a day of rest and lots of stretching ran 6 through Reynolda village (first run outdoors post-op), minor pain and hard stiffness in lower right abdominal around mile 4 (similar to mesh feeling on last two runs), but that dissipated and I was generally relaxed, legs felt fine at 8:12 avg pace, HR a little high at the start but I'll take the 149 avg for the run." },
    { date: "2026-07-24", body: "long stretch and a mile walk then 3.5 on the indoor track at the Y, higher HR compared to yesterday but I felt as relaxed as could be, no pain. some stiffness on left side morning after, doc mentioned I might feel the mesh as I get back into physical activity, presume this is what she meant." },
    { date: "2026-07-23", body: "had my one-month post-op yesterday, cleared to start light physical activity and running, doc noted that pain would be my indicator if I was pushing too hard, should listen to my body. Walked a mile first then 3.1 on the treadmill at the Y, very slow pace, breathing only through my nose, no pain, some stiffness on right side. No pain later in the day or next morning." },
  ],
  microblogNote: "My notes log runs as they happen. The totals elsewhere in this portfolio reflect the last Garmin export (updated June 20, 2026), so my runs mentioned here aren't counted in total miles, runs, and hours yet — these data will fold in at the next refresh.",

  // Timeline "trips away" for the Geography → When ribbon.
  //   Home BANDS come from data.js `homes` (generated).
  //   These TRIPS are authored curation — which trips to show, how to label them.
  //   `frac`  = position on the decade axis (year + fraction of year).
  //   `lane`  = readability stagger for the label (0 = short/low … 2 = tall/high),
  //             so adjacent trips don't collide. Retune by editing these numbers.
  //   Dates transcribed from the Phase 3 mockup — please confirm months/years.
  timeline: {
    trips: [
      // Vancouver ’17 and Sachuest Point ’23 dates/fracs are GPX-confirmed
      // (activity_1679709996 → Apr 9 2017; activity_10589223658 → Feb 24 2023).
      // The 2017–2019 cluster packs four trips whose labels all overlap in x, so
      // it needs a fourth tier — Vancouver ’17 rides lane 3 (highest) to clear
      // the ’19 Vancouver tick that shares its column of the timeline.
      { label: "Vancouver",         date: "Apr ’17", frac: 2017.27, lane: 3 }, // Stanley Park
      { label: "Toronto",           date: "May ’18", frac: 2018.37, lane: 2 },
      { label: "Niagara Falls",     date: "Oct ’18", frac: 2018.79, lane: 0 },
      { label: "Vancouver",         date: "Nov ’19", frac: 2019.87, lane: 1 },
      { label: "Camden-Wyoming",    date: "Sep ’22", frac: 2022.40, lane: 2 },
      { label: "Sachuest Point",    date: "Feb ’23", frac: 2023.15, lane: 1 }, // RI, during the Cambridge band
      { label: "Shanghai + Suzhou", date: "Mar ’25", frac: 2025.20, lane: 2 },
      { label: "Fort Worth",        date: "Jun ’26", frac: 2026.45, lane: 0 },
    ],
  },

  // Records ladder for the Records view — authored curation, mile → 50K.
  //   Which runs count as "the record," the training-vs-official distinction,
  //   the locations and race context are all your calls, not computed values.
  //   `official: true` earns the moss anchor (an official race result).
  //   Values drafted from the Phase 3 mock — please confirm, especially the
  //   10K and the stroller 5K (mile/5K echo data.js; half/marathon echo
  //   the featured races; 50K updated to Frosty 50). Times are the record; pace is the average for it.
  records: [
    { dist: "mile",                 time: "5:20",    pace: "5:20 / mi", note: "Denver · training-run best",                   official: false },
    { dist: "5K",                   time: "16:53",   pace: "5:26 / mi", note: "Winston-Salem · training-run best",            official: false },
    { dist: "5K · jogging stroller",time: "21:15",   pace: "6:50 / mi", note: "2020 Mama Goose (virtual) · Denver City Park", official: true },
    { dist: "10K",                  time: "33:58",   pace: "5:28 / mi", note: "2014 GSAFE Run for Safe Schools · Madison · 1st place", official: true },
    { dist: "15K",                  time: "53:44",   pace: "5:46 / mi", note: "2014 UW Running Club Fall 15K · 2nd place",    official: true },
    { dist: "half marathon",        time: "1:18:55", pace: "6:01 / mi", note: "2024 Mistletoe Run · 1st Masters",             official: true },
    { dist: "30K",                  time: "2:02:00", pace: "6:33 / mi", note: "2024 Salem Lake Trail Races · 3rd place",      official: true },
    { dist: "marathon",             time: "2:59:27", pace: "6:51 / mi", note: "2026 Asheville · sub-3 · Boston qualifier",    official: true },
    { dist: "50K",                  time: "4:00:09", pace: "7:44 / mi", note: "2026 Frosty 50 · second ultra",                official: true },
  ],

  // Atlas — which places the anchor-and-spread map features and labels.
  //   Home bases come from data.js `homes` (filled, sized by runs).
  //   `visits` is your curated narrative selection — coordinates and run counts
  //   are looked up from data.js `geo` by exact name (so these strings must match
  //   the resolved city labels, e.g. the overrides "Altadena/Pasadena",
  //   "Camden-Wyoming", "Sachuest Point"). Add or remove places freely.
  //   `abroad` places (far off the North-America frame) show in the inset row.
  atlas: {
    visits: ["Altadena/Pasadena", "Vancouver", "Toronto", "Sachuest Point", "Camden-Wyoming"],
    abroad: [
      { country: "Ireland", cities: "Dublin · Galway" },
      { country: "China",   cities: "Shanghai · Suzhou" },
    ],
  },

  // Trails atlas — the 18 curated "favorite grounds." Each maps a Garmin
  //   activity id to its authored label, note, terrain, and year; the route
  //   geometry (path shape) and GPS distance come from routes.js by id.
  //   To add a route: export its GPX to raw/gpx/, run parse_gpx.py, then add a
  //   row here with the new activity id. Order here is the display order.
  trails: [
    { id: "1824675899",  place: "Ann Arbor",      note: "Huron River · Argo, Bandemer, Barton",  terrain: "rolling",   year: "’17" },
    { id: "1740323724",  place: "Galway",         note: "Mutton Island Causeway · North Atlantic", terrain: "flat",      year: "’17" },
    { id: "1748658838",  place: "Dublin",         note: "Out to Dublin Bay",                     terrain: "flat",      year: "’17" },
    { id: "18609562872", place: "Shanghai",       note: "East Bund Riverside Bike Path",         terrain: "flat",      year: "’25" },
    { id: "1980903070",  place: "NYC",            note: "Central Park loop",                     terrain: "flat",      year: "’17" },
    { id: "14672924307", place: "Denver",         note: "Cherry Creek & South Platte trails",    terrain: "flat",      year: "’24" },
    { id: "1605507551",  place: "Boulder",        note: "Betasso Preserve into the foothills",   terrain: "hilly",     year: "’17" },
    { id: "3055180062",  place: "Littleton",      note: "Mary Carter to Chatfield Reservoir",    terrain: "flat",      year: "’18" },
    { id: "10919210731", place: "Cambridge",      note: "Along the Charles River",               terrain: "flat",      year: "’23" },
    { id: "11374446598", place: "Jamaica Pond",   note: "Boston's Emerald Necklace",             terrain: "flat",      year: "’23" },
    { id: "9970252465",  place: "Boston",         note: "2022 Boston Half Marathon",             terrain: "flat",      year: "’22" },
    { id: "16596850271", place: "Eaton Canyon",   note: "Up to Henninger Flats · burned Jan ’25", terrain: "big climb", year: "’24" },
    { id: "16596819851", place: "Altadena",       note: "Altadena Crest Trail · burned Jan ’25", terrain: "big climb", year: "’24" },
    { id: "1679709996",  place: "Stanley Park",   note: "Seawall Path from downtown Vancouver",  terrain: "rolling",   year: "’17" },
    { id: "4261307475",  place: "Vancouver",      note: "Pacific Spirit Regional Park",          terrain: "rolling",   year: "’19" },
    { id: "22810120046", place: "Pilot Mountain", note: "Birthday climb · near WSNC",            terrain: "hilly",     year: "’26" },
    { id: "21432674282", place: "Frosty 50K",     note: "4 loops around Salem Lake · WSNC",      terrain: "big climb", year: "’26" },
    { id: "19792144959", place: "Ridley Creek",   note: "Ridley Creek State Park · near Philly", terrain: "rolling",   year: "’25" },
  ],
};
