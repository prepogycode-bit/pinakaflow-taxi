// Static content for the animated dashboard under the hero. Nothing here talks
// to the real app — it is a scripted replay of what a run looks like.

// Each client carries the tags "Update database" draws on its row in the app
// (data/compliance_status.py): [text, kind], kind = overdue | due | ok.
export const CLIENTS = [
  {
    name: 'Verma & Associates', username: 'vermaassoc_gst', sel: true,
    tags: [['GSTR-1 Sep · due 11 Oct', 'due'], ['GSTR-3B Sep · due 20 Oct', 'due']],
  },
  {
    name: 'S. R. Traders', username: 'srtraders27', sel: true,
    tags: [['GSTR-1 Sep (Q) · due 13 Oct', 'due'], ['GSTR-3B Sep (Q) · due 24 Oct', 'due']],
  },
  {
    name: 'Nandi Textiles Pvt Ltd', username: 'nanditex_wb', sel: true,
    tags: [['GSTR-3B Aug · overdue', 'overdue']],
  },
  {
    name: 'Bharat Auto Spares', username: 'bharatauto19', sel: true,
    tags: [['✓ Filed to Sep', 'ok']],
  },
  {
    name: 'Kalyani Enterprises', username: 'kalyanient', sel: false,
    tags: [['GSTR-1 Aug · overdue', 'overdue'], ['GSTR-3B Aug · overdue', 'overdue']],
  },
  { name: 'Ghosh & Sons', username: 'ghoshsons_gst', sel: false, tags: [['✓ Filed to Sep', 'ok']] },
  {
    name: 'Meridian Exports LLP', username: 'meridianexp', sel: false,
    tags: [['GSTR-1 Sep · due 11 Oct', 'due'], ['✓ GSTR-3B to Aug', 'ok']],
  },
]

// [background, text] -- the app's _TAG_COLORS.
export const TAG_COLORS = {
  overdue: ['#FDECEC', '#B42318'],
  due: ['#FFF4E5', '#B54708'],
  ok: ['#ECFDF3', '#067647'],
}

export const STATUS_FILTERS = [
  ['all', 'All'],
  ['filed', 'Filed'],
  ['due', 'Due'],
  ['overdue', 'Overdue'],
]

// The filter buttons a client appears under, exactly as ui/client_panel.py
// decides: due / overdue if any tag is; filed only when nothing is pending.
export function statusKeys(tags) {
  const kinds = new Set(tags.map(([, kind]) => kind))
  const keys = new Set(['all'])
  if (kinds.has('overdue')) keys.add('overdue')
  if (kinds.has('due')) keys.add('due')
  if (kinds.has('ok') && !kinds.has('due') && !kinds.has('overdue')) keys.add('filed')
  return keys
}

export const FRAMES = [
  {
    pct: 0, stage: 'Idle', client: '\u2014', left: '\u2014', elapsed: '\u2014', eta: '\u2014',
    pill: 'Ready', files: 0,
    log: ['Ready \u2014 select clients and a period, then press Start', 'INFO'],
  },
  {
    pct: 8, stage: 'Signing in', client: 'Verma & Associates', left: '4', elapsed: '0:06', eta: '2:10',
    pill: 'Running', files: 0,
    log: ['Opening the GST portal in TAXI Browser\u2026', 'INFO'],
  },
  {
    pct: 21, stage: 'Signed in', client: 'Verma & Associates', left: '4', elapsed: '0:24', eta: '1:58',
    pill: 'Running', files: 0,
    log: ['Signed in as vermaassoc_gst', 'SUCCESS'],
  },
  {
    pct: 34, stage: 'Downloading', client: 'Verma & Associates', left: '3', elapsed: '0:41', eta: '1:36',
    pill: 'Running', files: 1,
    log: ['GSTR-3B (April 2025).pdf saved', 'SUCCESS'],
  },
  {
    pct: 47, stage: 'Signing in', client: 'S. R. Traders', left: '3', elapsed: '1:02', eta: '1:14',
    pill: 'Running', files: 1,
    log: ['Session reused \u2014 no re-login, no captcha', 'INFO'],
  },
  {
    pct: 60, stage: 'Downloading', client: 'S. R. Traders', left: '2', elapsed: '1:19', eta: '0:58',
    pill: 'Running', files: 2,
    log: ['GSTR-3B (May 2025).pdf saved', 'SUCCESS'],
  },
  {
    pct: 73, stage: 'Retrying', client: 'Nandi Textiles Pvt Ltd', left: '2', elapsed: '1:38', eta: '0:41',
    pill: 'Retrying', files: 2,
    log: ['Firewall refused the login page \u2014 retrying via the homepage', 'WARNING'],
  },
  {
    pct: 88, stage: 'Downloading', client: 'Nandi Textiles Pvt Ltd', left: '1', elapsed: '1:57', eta: '0:18',
    pill: 'Running', files: 3,
    log: ['GSTR-3B (June 2025).pdf saved', 'SUCCESS'],
  },
  {
    pct: 100, stage: 'Complete', client: 'Bharat Auto Spares', left: '0', elapsed: '2:14', eta: '0:00',
    pill: 'Complete', files: 4,
    log: ['ALL TASKS COMPLETED \u2014 4 clients, 4 files, summary rebuilt', 'SUCCESS'],
  },
]

// Each return type owns a two-stop gradient — the same pairs as the desktop
// app's config/themes.py TOOL_ACCENT, so the demo and the product match.
export const MODES = {
  '3B': {
    label: 'GSTR-3B', sub: 'PDF Download', glyph: 'description',
    colors: ['#5048E5', '#9D4EDD'],
    blurb: 'Download filed GSTR-3B returns as PDF, client by client.',
  },
  '1': {
    label: 'GSTR-1', sub: 'JSON / PDF', glyph: 'list_alt',
    colors: ['#2563EB', '#0891B2'],
    blurb: 'Pull the filed GSTR-1 summary for every selected client.',
  },
  '2B': {
    label: 'GSTR-2B', sub: 'Excel / PDF', glyph: 'download',
    colors: ['#0D9488', '#16A34A'],
    blurb: 'Fetch GSTR-2B statements as PDF or Excel in one pass.',
  },
  ITR: {
    label: 'ITR', sub: 'Returns + AIS / TIS', glyph: 'account_balance',
    colors: ['#EA7A0C', '#E11D48'],
    blurb: 'Returns, AIS / TIS and Form 26AS from the income-tax portal.',
  },
}

export const MODE_ORDER = ['3B', '1', '2B', 'ITR']

// [pill fill, text, dot]
export const PILLS = {
  Ready: ['#E3F7EF', '#0B7A55', '#12A874'],
  Running: ['#EEEDFF', '#3F37C9', '#5048E5'],
  Retrying: ['#FEF3DC', '#9A5B00', '#F59E0B'],
  Complete: ['#E3F7EF', '#0B7A55', '#12A874'],
}

export const FILE_NAMES = [
  'GSTR-3B (April 2025).pdf',
  'GSTR-3B (May 2025).pdf',
  'GSTR-3B (June 2025).pdf',
  'GSTR-3B (July 2025).pdf',
]

export const ACTION_SETS = {
  '1': {
    title: 'GSTR-1 Action',
    rows: [['Download PDF', 'Download the filed summary as PDF']],
  },
  '2B': {
    title: 'GSTR-2B Download',
    rows: [
      ['Download PDF', 'GSTR-2B summary as PDF'],
      ['Download Excel', 'GSTR-2B details as Excel'],
      ['Download B2B Excel', 'B2B invoices only, as Excel'],
    ],
  },
  ITR: {
    title: 'ITR Settings',
    rows: [
      ['ITR returns', 'Form / Receipt / JSON \u2014 last 3 years'],
      ['AIS / TIS', 'Annual Information Statement + TIS'],
      ['Form 26AS', 'Tax credit statement'],
    ],
  },
}

// Gradient discs, white initials — as in the app's client list.
export const AVATARS = [
  ['#6366F1', '#A855F7'],
  ['#0EA5E9', '#2563EB'],
  ['#10B981', '#0D9488'],
  ['#F59E0B', '#EA580C'],
  ['#EC4899', '#E11D48'],
  ['#8B5CF6', '#6D28D9'],
  ['#14B8A6', '#0891B2'],
]

// [dot, text]
export const LOG_COLORS = {
  INFO: ['#8B85FF', '#0E1428'],
  SUCCESS: ['#12A874', '#0B7A55'],
  WARNING: ['#F59E0B', '#9A5B00'],
  ERROR: ['#E5484D', '#B42328'],
}
