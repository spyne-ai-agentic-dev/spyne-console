// @ts-nocheck
/* Spyne Console data + HTML builders — ported verbatim from legacy/public/app.js */
/* ============================================================
   Spyne Console — data-driven SPA
   Primary rail · contextual secondary menu · per-tab home
   ============================================================ */

export const I = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
  studio: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M10 9l5 3-5 3V9z"/>',
  marketing: '<path d="M3 11v2a1 1 0 001 1h3l5 4V6L7 10H4a1 1 0 00-1 1z"/><path d="M17 8a5 5 0 010 8"/>',
  sales: '<path d="M4 19V5M4 19h16M8 16l4-5 3 3 5-7"/>',
  service: '<path d="M14.7 6.3a4 4 0 01-5 5L4 17v3h3l5.7-5.7a4 4 0 005-5l-2.3 2.3-2-2 2.3-2.3z"/>',
  inventory: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
  customers: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3 3 0 010 5.8M18 20c0-2.5-1-4.7-2.5-5.8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.5 7.5 0 000-2l2-1.5-2-3.4-2.4 1a7.5 7.5 0 00-1.7-1l-.4-2.6h-4l-.4 2.6a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.4 2 1.5a7.5 7.5 0 000 2l-2 1.5 2 3.4 2.4-1a7.5 7.5 0 001.7 1l.4 2.6h4l.4-2.6a7.5 7.5 0 001.7-1l2.4 1 2-3.4-2-1.5z"/>',
  billing: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  chat: '<path d="M21 12a8 8 0 01-11.3 7.3L3 21l1.7-6.7A8 8 0 1121 12z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  tag: '<path d="M3 11l8-8 9 9-8 8-9-9z"/><circle cx="8" cy="8" r="1.4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  plug: '<path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 01-10 0V7zM12 16v5"/>',
  bell: '<path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6zM10 21h4"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>',
  spark: '<path d="M12 3v6M12 15v6M3 12h6M15 12h6"/>',
  car: '<path d="M5 13l1.5-4.5A2 2 0 018.4 7h7.2a2 2 0 011.9 1.5L19 13M5 13h14v4H5zM7 17v2M17 17v2"/>',
  segment: '<circle cx="12" cy="12" r="9"/><path d="M12 12V3a9 9 0 019 9z"/>',
  phone: '<path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>',
};

export const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;

/* ---------- helpers to build content blocks ---------- */
export const kpis = (arr) => `<section class="kpis">${arr.map(k =>
  `<div class="kpi"><div class="n">${k.n}</div><div class="l">${k.l}</div>${k.d ? `<div class="d ${k.dk||'up'}">${k.d}</div>` : ''}</div>`).join('')}</section>`;

export const listPanel = (p) => `<div class="panel ${p.span ? 'span2':''}">
  <div class="panel-head"><h3>${p.title}</h3>${p.link ? `<a href="#">${p.link}</a>`:''}</div>
  <div class="rows">${p.items.map(it => `
    <div class="lrow">
      <div class="ava">${it.icon||'•'}</div>
      <div class="tx"><div class="p1">${it.p1}</div><div class="p2">${it.p2}</div></div>
      ${it.tag ? `<span class="tagx ${it.tagk||'n'}">${it.tag}</span>` : `<span class="meta">${it.meta||''}</span>`}
    </div>`).join('')}</div></div>`;

export const progressPanel = (p) => `<div class="panel ${p.span ? 'span2':''}">
  <div class="panel-head"><h3>${p.title}</h3>${p.link ? `<a href="#">${p.link}</a>`:''}</div>
  ${p.rows.map(r => `<div class="prow"><div class="pl"><b>${r.label}</b><span>${r.value}</span></div>
    <div class="track"><i class="${r.acc?'acc':''}" style="width:${r.pct}%"></i></div></div>`).join('')}</div>`;

export const calloutPanel = (p) => `<div class="panel ${p.span ? 'span2':''}">
  <div class="panel-head"><h3>${p.title}</h3>${p.link ? `<a href="#">${p.link}</a>`:''}</div>
  ${p.items.map(c => `<div class="callout" style="margin-bottom:18px"><div class="cico">${c.icon}</div>
    <div class="ct"><div class="h">${c.h}</div><div class="p">${c.p}</div></div>
    ${c.btn ? `<a class="btn ${c.btnk||'light'} sm" href="#">${c.btn}</a>`:''}</div>`).join('')}</div>`;

export const settingsPanel = (p) => `<div class="panel ${p.span ? 'span2':''}">
  <div class="panel-head"><h3>${p.title}</h3>${p.link ? `<a href="#">${p.link}</a>`:''}</div>
  ${p.rows.map(r => `<div class="setrow">
    ${r.icon ? `<div class="ava">${r.icon}</div>`:''}
    <div class="tx"><div class="p1">${r.p1}</div><div class="p2">${r.p2}</div></div>
    ${r.toggle !== undefined ? `<div class="toggle ${r.toggle?'on':''}"></div>` : (r.tag ? `<span class="tagx ${r.tagk||'n'}">${r.tag}</span>` : (r.btn ? `<a class="btn light sm" href="#">${r.btn}</a>`:''))}
  </div>`).join('')}</div>`;

export const renderPanel = (p) => {
  if (p.type === 'progress') return progressPanel(p);
  if (p.type === 'callout') return calloutPanel(p);
  if (p.type === 'settings') return settingsPanel(p);
  return listPanel(p);
};

/* ---------- the configuration ---------- */
export const TABS = [
  {
    id: 'home', label: 'Home', icon: I.home,
    title: 'Home', sub: 'Dealership overview',
    secondary: [
      { label: 'Overview', icon: I.grid },
      { label: 'My day', icon: I.clock, count: '4' },
      { label: 'Activity', icon: I.list },
      { label: 'Insights', icon: I.spark },
      { label: 'Announcements', icon: I.bell },
    ],
    head: { h1: 'Good afternoon, Apex', p: "Here's what's moving across your dealership today.",
      actions: [{ t: 'Go to Inventory', k: 'dark' }, { t: 'Open Studio AI', k: 'light' }] },
    kpis: [
      { n: '60%', l: 'Faster time-to-market', d: '↑ vs last month' },
      { n: '80%', l: 'Lead resolution rate', d: '↑ 6 pts' },
      { n: '3×', l: 'Appointments booked', d: '↑ steady' },
      { n: '31', l: 'Avg days-on-lot', d: '↓ 9 days' },
    ],
    panels: [
      { type:'list', span:true, title:'Needs your attention', link:'View all', items:[
        { icon:'📸', p1:'12 vehicles awaiting publish', p2:'Studio · merchandising ready', tag:'Studio', tagk:'a' },
        { icon:'💬', p1:'26 hot leads unworked', p2:'Sales · Vini qualified overnight', tag:'Sales', tagk:'a' },
        { icon:'🔧', p1:'8 service inquiries routed', p2:'Service · awaiting advisor', tag:'Service', tagk:'n' },
        { icon:'🚙', p1:'5 units aging over 60 days', p2:'Inventory · consider reprice', tag:'Inventory', tagk:'a' },
      ]},
      { type:'progress', title:'Lifecycle today', rows:[
        { label:'Studio queue', value:'34 ready', pct:72 },
        { label:'Conversations', value:'92 handled', pct:81, acc:true },
        { label:'Appointments', value:'40 booked', pct:64 },
      ]},
      { type:'list', title:'Recent activity', link:'Timeline', items:[
        { icon:'✅', p1:'2019 Audi Q5 published', p2:'Studio · 4 min ago', meta:'Day 0' },
        { icon:'📅', p1:'Test drive booked — M. Rivera', p2:'Vini Sales · 12 min ago', meta:'Sat 3pm' },
        { icon:'💳', p1:'Invoice <span class="mono">#4821</span> paid', p2:'Billing · 1 hr ago', meta:'<span class="mono">$2,400</span>' },
      ]},
    ],
  },
  {
    id: 'studio', label: 'Studio', icon: I.studio,
    title: 'Studio', sub: 'Studio AI · visuals',
    secondary: [
      { label: 'Overview', icon: I.grid },
      { label: 'Shoots', icon: I.studio, count: '128' },
      { label: 'Editing queue', icon: I.bolt, count: '12' },
      { label: 'Backgrounds', icon: I.spark },
      { label: 'Publishing', icon: I.car, count: '34' },
      { label: 'Templates', icon: I.grid },
    ],
    head: { h1: 'Studio', p: 'Premium merchandising from day zero — backgrounds, plate-blur, 360° spins.',
      actions: [{ t: 'New shoot', k: 'dark' }, { t: 'Import photos', k: 'light' }] },
    kpis: [
      { n: '128', l: 'Cars shot (7d)', d:'↑ 18%' },
      { n: '12', l: 'In editing queue', d:'On track', dk:'flat' },
      { n: '34', l: 'Ready to publish', d:'↑ today' },
      { n: '4.2m', l: 'Avg edit time', d:'↓ 1.1m' },
    ],
    panels: [
      { type:'progress', span:true, title:'Editing pipeline', link:'Open queue', rows:[
        { label:'Queued', value:'12 vehicles', pct:72 },
        { label:'Retouching', value:'6 in progress', pct:40, acc:true },
        { label:'Ready to publish', value:'34 done', pct:89 },
      ]},
      { type:'list', title:'Recent shoots', link:'All shoots', items:[
        { icon:'🚗', p1:'2021 Toyota RAV4', p2:'42 photos · 360° spin', tag:'Ready', tagk:'g' },
        { icon:'🚙', p1:'2019 Audi Q5', p2:'38 photos · plate blurred', tag:'Published', tagk:'g' },
        { icon:'🚐', p1:'2020 Honda Odyssey', p2:'29 photos · retouching', tag:'Editing', tagk:'a' },
      ]},
      { type:'callout', title:'Backgrounds & presets', items:[
        { icon:'🏙️', h:'Showroom Neutral', p:'Your default virtual studio background', btn:'Edit' },
        { icon:'🌅', h:'Outdoor Sunset', p:'Premium lifestyle scene', btn:'Apply' },
      ]},
    ],
  },
  {
    id: 'marketing', label: 'Marketing', icon: I.marketing,
    title: 'Marketing', sub: 'Marketing AI · demand',
    secondary: [
      { label: 'Overview', icon: I.grid },
      { label: 'Campaigns', icon: I.bolt, count: '5' },
      { label: 'Listings', icon: I.list, count: '312' },
      { label: 'Social', icon: I.chat },
      { label: 'Audiences', icon: I.segment },
      { label: 'Creative', icon: I.spark },
    ],
    head: { h1: 'Marketing', p: 'Turn merchandised inventory into demand across every channel.',
      actions: [{ t: 'New campaign', k: 'dark' }, { t: 'Generate listing', k: 'light' }] },
    kpis: [
      { n: '5', l: 'Live campaigns', d:'2 ending soon', dk:'flat' },
      { n: '184k', l: 'Impressions (7d)', d:'↑ 22%' },
      { n: '4.2%', l: 'Click-through rate', d:'↑ 0.6 pts' },
      { n: '312', l: 'Listings synced', d:'All channels', dk:'flat' },
    ],
    panels: [
      { type:'list', span:true, title:'Campaign performance', link:'All campaigns', items:[
        { icon:'🔥', p1:'Memorial Day SUV Event', p2:'Meta + Google · 5 days left', tag:'+38% CTR', tagk:'g' },
        { icon:'🚘', p1:'Certified Pre-Owned Push', p2:'Marketplace retargeting', tag:'Live', tagk:'g' },
        { icon:'💸', p1:'Aging Inventory Clearance', p2:'Email + social · 18 units', tag:'Live', tagk:'g' },
      ]},
      { type:'progress', title:'Channel mix', rows:[
        { label:'Paid social', value:'92k impr.', pct:64, acc:true },
        { label:'Search', value:'58k impr.', pct:44 },
        { label:'Email', value:'34k opens', pct:30 },
      ]},
      { type:'list', title:'Latest creative', link:'Creative library', items:[
        { icon:'🖼️', p1:'RAV4 — carousel ad', p2:'Auto-generated · approved', meta:'2h ago' },
        { icon:'📝', p1:'Q5 listing copy', p2:'Pushed to website', meta:'3h ago' },
      ]},
    ],
  },
  {
    id: 'sales', label: 'Sales', icon: I.sales,
    title: 'Sales', sub: 'Vini AI · Sales',
    secondary: [
      { label: 'Overview',     icon: I.grid    },
      { label: 'Appointments', icon: I.cal     },
      { label: 'Action Items', icon: I.bolt    },
      { label: 'Campaigns',    icon: I.segment },
      { label: 'Leads',        icon: I.user    },
      { label: 'Reports',      icon: I.doc     },
    ],
    head: { h1: 'Sales', p: 'Vini answers, qualifies, and books — every lead, around the clock.',
      actions: [{ t: 'View leads', k: 'dark' }, { t: 'Configure Vini', k: 'light' }] },
    kpis: [
      { n: '92', l: 'Conversations today', d:'↑ 14%' },
      { n: '26', l: 'Hot leads', d:'↑ overnight' },
      { n: '17', l: 'Appointments booked', d:'↑ 3×' },
      { n: '80%', l: 'Lead resolution', d:'↑ 6 pts' },
    ],
    panels: [
      { type:'list', span:true, title:'Hot leads', link:'All leads', items:[
        { icon:'🔥', p1:'Maria Rivera', p2:'2021 RAV4 · ready to test drive', tag:'Booked', tagk:'g' },
        { icon:'🔥', p1:'James Cole', p2:'Financing question · Vini handling', tag:'Active', tagk:'a' },
        { icon:'🔥', p1:'Priya Anand', p2:'Trade-in valuation requested', tag:'New', tagk:'a' },
      ]},
      { type:'progress', title:'Pipeline', rows:[
        { label:'Engaged', value:'92', pct:88, acc:true },
        { label:'Qualified', value:'41', pct:55 },
        { label:'Appointment set', value:'17', pct:24 },
      ]},
      { type:'list', title:'Upcoming appointments', link:'Calendar', items:[
        { icon:'📅', p1:'M. Rivera — Test drive', p2:'2021 Toyota RAV4', meta:'Sat 3:00pm' },
        { icon:'📅', p1:'D. Okafor — Walk-in', p2:'CPO sedans', meta:'Sat 4:30pm' },
      ]},
    ],
  },
  {
    id: 'service', label: 'Service', icon: I.service,
    title: 'Service', sub: 'Vini AI · Service',
    secondary: [
      { label: 'Overview',     icon: I.grid    },
      { label: 'Appointments', icon: I.cal     },
      { label: 'Action Items', icon: I.bolt    },
      { label: 'Campaigns',    icon: I.segment },
      { label: 'Leads',        icon: I.user    },
      { label: 'Reports',      icon: I.doc     },
    ],
    head: { h1: 'Service', p: 'Vini resolves routine service instantly and routes the rest to advisors.',
      actions: [{ t: 'View schedule', k: 'dark' }, { t: 'Configure Vini', k: 'light' }] },
    kpis: [
      { n: '88%', l: 'Inquiries resolved', d:'↑ 5 pts' },
      { n: '23', l: 'Appointments today', d:'Full', dk:'flat' },
      { n: '8', l: 'Vehicles in bay', d:'In progress', dk:'flat' },
      { n: '12', l: 'Reminders sent', d:'↑ today' },
    ],
    panels: [
      { type:'list', span:true, title:"Today's appointments", link:'Full schedule', items:[
        { icon:'🔧', p1:'Oil change — F-150', p2:'Bay 2 · adv. K. Shah', tag:'In bay', tagk:'a' },
        { icon:'🔧', p1:'Brake inspection — CR-V', p2:'Bay 4 · adv. L. Diaz', tag:'Waiting', tagk:'n' },
        { icon:'🔧', p1:'Tire rotation — Civic', p2:'Booked by Vini', tag:'2:00pm', tagk:'n' },
      ]},
      { type:'progress', title:'Resolution mix', rows:[
        { label:'Resolved by Vini', value:'88%', pct:88, acc:true },
        { label:'Routed to advisor', value:'9%', pct:9 },
        { label:'Escalated', value:'3%', pct:3 },
      ]},
      { type:'list', title:'Reminders queue', link:'All reminders', items:[
        { icon:'⏰', p1:'Service due — 14 owners', p2:'Auto-reminder scheduled', meta:'Tomorrow' },
        { icon:'⏰', p1:'Recall notice — 3 owners', p2:'Vini follow-up', meta:'Today' },
      ]},
    ],
  },
  {
    id: 'receptionist', label: 'Receptionist', icon: I.phone,
    title: 'Receptionist', sub: 'Vini AI · Front Desk',
    secondary: [
      { label: 'Overview',     icon: I.grid  },
      { label: 'Action Items', icon: I.bolt  },
      { label: 'Calls',        icon: I.phone },
      { label: 'Reports',      icon: I.doc   },
    ],
    head: { h1: 'Receptionist', p: 'Vini handles incoming calls, greets customers, and routes inquiries automatically.',
      actions: [{ t: 'View calls', k: 'dark' }, { t: 'Configure', k: 'light' }] },
    kpis: [
      { n: '—', l: 'Calls today' },
      { n: '—', l: 'Avg handle time' },
      { n: '—', l: 'Action items open' },
      { n: '—', l: 'Resolved today' },
    ],
    panels: [],
  },
  {
    id: 'inventory', label: 'Inventory', icon: I.inventory,
    title: 'Inventory', sub: 'Vehicles · stock',
    secondary: [
      { label: 'Overview', icon: I.grid },
      { label: 'All vehicles', icon: I.car, count: '312' },
      { label: 'Aging', icon: I.clock, count: '18' },
      { label: 'Pricing', icon: I.tag },
      { label: 'Acquisition', icon: I.bolt },
      { label: 'Sold', icon: I.list },
    ],
    head: { h1: 'Inventory', p: 'Every VIN from acquisition to sold, with merchandising and pricing at a glance.',
      actions: [{ t: 'Add vehicle', k: 'dark' }, { t: 'Export', k: 'light' }] },
    kpis: [
      { n: '312', l: 'Total units', d:'↑ 24 this week' },
      { n: '278', l: 'Live listings', d:'89% merchandised' , dk:'flat'},
      { n: '31', l: 'Avg days-on-lot', d:'↓ 9 days' },
      { n: '18', l: 'Aging over 60d', d:'Needs action', dk:'flat' },
    ],
    panels: [
      { type:'list', span:true, title:'Aging units', link:'View aging', items:[
        { icon:'🚙', p1:'2018 BMW X3', p2:'68 days · priced $1,200 over market', tag:'Reprice', tagk:'a' },
        { icon:'🚗', p1:'2017 Lexus ES', p2:'72 days · 2 price drops', tag:'Reprice', tagk:'a' },
        { icon:'🚐', p1:'2019 Chrysler Pacifica', p2:'63 days · low engagement', tag:'Promote', tagk:'n' },
      ]},
      { type:'progress', title:'Merchandising status', rows:[
        { label:'Fully merchandised', value:'278', pct:89, acc:true },
        { label:'Photos pending', value:'22', pct:7 },
        { label:'No photos', value:'12', pct:4 },
      ]},
      { type:'list', title:'Recent acquisitions', link:'Acquisition', items:[
        { icon:'➕', p1:'2022 Tesla Model 3', p2:'Trade-in · awaiting Studio', meta:'Day 0' },
        { icon:'➕', p1:'2021 Ford Bronco', p2:'Auction · in transit', meta:'2d' },
      ]},
    ],
  },
  {
    id: 'customers', label: 'Customers', icon: I.customers,
    title: 'Customers', sub: 'Shoppers & owners',
    secondary: [
      { label: 'Overview', icon: I.grid },
      { label: 'Contacts', icon: I.user, count: '4.9k' },
      { label: 'Segments', icon: I.segment },
      { label: 'Follow-ups', icon: I.bell, count: '57' },
      { label: 'Activity', icon: I.list },
      { label: 'Imports', icon: I.doc },
    ],
    head: { h1: 'Customers', p: 'One unified record for every shopper and owner across Vini and your CRM.',
      actions: [{ t: 'Add contact', k: 'dark' }, { t: 'New segment', k: 'light' }] },
    kpis: [
      { n: '4,910', l: 'Total contacts', d:'↑ 312 this month' },
      { n: '1,204', l: 'Active this month', d:'↑ 8%' },
      { n: '57', l: 'Follow-ups due', d:'Today', dk:'flat' },
      { n: '+38', l: 'NPS', d:'↑ 4 pts' },
    ],
    panels: [
      { type:'list', span:true, title:'Follow-ups due', link:'All follow-ups', items:[
        { icon:'📞', p1:'Maria Rivera', p2:'Post test-drive check-in', tag:'Today', tagk:'a' },
        { icon:'📧', p1:'David Okafor', p2:'Finance pre-approval expiring', tag:'Today', tagk:'a' },
        { icon:'📞', p1:'Sandra Lee', p2:'Service satisfaction call', tag:'Tomorrow', tagk:'n' },
      ]},
      { type:'progress', title:'Segments', rows:[
        { label:'In-market shoppers', value:'1,204', pct:62, acc:true },
        { label:'Service customers', value:'2,140', pct:80 },
        { label:'Lapsed (>12m)', value:'566', pct:24 },
      ]},
      { type:'list', title:'Recent activity', link:'Timeline', items:[
        { icon:'💬', p1:'P. Anand replied to Vini', p2:'Trade-in valuation', meta:'8 min' },
        { icon:'🎉', p1:'J. Cole purchased', p2:'2020 Honda Accord', meta:'1 day' },
      ]},
    ],
  },
  {
    id: 'settings', label: 'Settings', icon: I.settings,
    title: 'Profile & Settings', sub: 'Account & workspace',
    secondary: [
      { label: 'Profile', icon: I.user },
      { label: 'Team & roles', icon: I.customers, count: '14' },
      { label: 'Integrations', icon: I.plug },
      { label: 'Notifications', icon: I.bell },
      { label: 'Security', icon: I.shield },
    ],
    head: { h1: 'Profile & Settings', p: 'Manage your account, team, and connected tools.',
      actions: [{ t: 'Edit profile', k: 'light' }] },
    panels: [
      { type:'settings', title:'Team & roles', link:'Manage', rows:[
        { icon:'👤', p1:'Sanjay Varnwal', p2:'Owner · sanjay@spyne.ai', tag:'Owner', tagk:'g' },
        { icon:'👤', p1:'Karan Shah', p2:'Service advisor', tag:'Member', tagk:'n' },
        { icon:'👤', p1:'Lucia Diaz', p2:'Sales manager', tag:'Admin', tagk:'n' },
      ]},
      { type:'settings', title:'Integrations', link:'Browse', rows:[
        { icon:'🔌', p1:'VinSolutions (DMS)', p2:'Syncing inventory & leads', tag:'Connected', tagk:'g' },
        { icon:'🔌', p1:'Google Business Profile', p2:'Listings & reviews', tag:'Connected', tagk:'g' },
        { icon:'🔌', p1:'Meta Ads', p2:'Campaign delivery', btn:'Connect' },
      ]},
      { type:'settings', span:true, title:'Notifications', rows:[
        { p1:'Hot lead alerts', p2:'Notify when Vini flags a high-intent buyer', toggle:true },
        { p1:'Aging inventory digest', p2:'Weekly summary of units over 60 days', toggle:true },
        { p1:'Studio publish confirmations', p2:'Ping when a vehicle goes live', toggle:false },
      ]},
    ],
  },
  {
    id: 'billing', label: 'Billing', icon: I.billing,
    title: 'Billing', sub: 'Plan & usage',
    secondary: [
      { label: 'Overview', icon: I.grid },
      { label: 'Plan', icon: I.spark },
      { label: 'Usage', icon: I.bolt },
      { label: 'Invoices', icon: I.doc },
      { label: 'Payment methods', icon: I.billing },
    ],
    head: { h1: 'Billing', p: 'Your plan, usage, and invoices in one place.',
      actions: [{ t: 'Manage plan', k: 'buy' }] },
    kpis: [
      { n: 'Comprehensive', l: 'Current plan', d:'Renews Jul 1', dk:'flat' },
      { n: '14', l: 'Active seats', d:'2 available', dk:'flat' },
      { n: '278', l: 'Vehicles merchandised', d:'of 350 incl.', dk:'flat' },
      { n: '$2,400', l: 'Next invoice', d:'Jul 1', dk:'flat' },
    ],
    panels: [
      { type:'progress', span:true, title:'Usage this cycle', link:'Details', rows:[
        { label:'Studio vehicles', value:'<span class="mono">278 / 350</span>', pct:79, acc:true },
        { label:'Vini conversations', value:'<span class="mono">6,420 / 10,000</span>', pct:64 },
        { label:'Seats', value:'<span class="mono">14 / 16</span>', pct:88 },
      ]},
      { type:'list', title:'Recent invoices', link:'All invoices', items:[
        { icon:'🧾', p1:'Invoice <span class="mono">#4821</span>', p2:'Jun 1 · Comprehensive', tag:'Paid', tagk:'g' },
        { icon:'🧾', p1:'Invoice <span class="mono">#4760</span>', p2:'May 1 · Comprehensive', tag:'Paid', tagk:'g' },
      ]},
      { type:'callout', title:'Plan', items:[
        { icon:'⭐', h:'Comprehensive', p:'Studio AI + Vini Sales & Service, 350 vehicles, 16 seats', btn:'Upgrade', btnk:'buy' },
      ]},
    ],
  },
];

/* ---------- pure render helpers (return HTML strings; consumed by Console.tsx) ---------- */
export function railHTML(activeTab) {
  return TABS.map((t) =>
    `<button class="rail-item ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}" title="${t.title}">
      ${svg(t.icon)}<span class="rl">${t.label}</span>
    </button>`).join('');
}

export function submenuHTML(tab, curSub) {
  const cur = curSub ?? 0;
  return `
    <div class="sub-title">${tab.title}</div>
    <div class="sub-sub">${tab.sub}</div>
    <div class="sub-list">
      ${tab.secondary.map((s, i) => `<button class="sub-item ${i === cur ? 'active' : ''}" data-sub="${i}">
        <span class="si">${svg(s.icon)}</span>${s.label}
        ${s.count ? `<span class="count">${s.count}</span>` : ''}
      </button>`).join('')}
    </div>
    <div class="sub-foot"><div class="sub-note">
      <div class="h">${tab.id === 'billing' ? 'Need more capacity?' : 'Tip'}</div>
      <div class="p">${tab.id === 'billing' ? 'Upgrade to add vehicles and seats anytime.' : 'Vini handled 92 conversations for you today.'}</div>
      <a class="btn ${tab.id === 'billing' ? 'buy' : 'dark'} sm" href="#">${tab.id === 'billing' ? 'See plans' : 'Open assistant'}</a>
    </div></div>`;
}

export function contentHTML(tab) {
  const h = tab.head;
  let html = `<div class="content-inner">
    <div class="page-head">
      <div><h1>${h.h1}</h1><p>${h.p}</p></div>
      <div class="head-actions">${h.actions.map((a) => `<a class="btn ${a.k}" href="#">${a.t}</a>`).join('')}</div>
    </div>`;
  if (tab.kpis) html += kpis(tab.kpis);
  html += `<div class="panels-grid">${tab.panels.map(renderPanel).join('')}</div></div>`;
  return html;
}

export function crumbsHTML(tab, curSub) {
  const cur = curSub ?? 0;
  return `<b>${tab.title}</b><span class="sep">›</span>${tab.secondary[cur].label}`;
}
