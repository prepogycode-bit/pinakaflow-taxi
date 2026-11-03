// ---------------------------------------------------------------------------
// Everything you are likely to change lives in this one file.
// Edit the values, save, and the whole site updates.
// ---------------------------------------------------------------------------

// ---- Release ---------------------------------------------------------------
// The installer ZIP (Setup.exe + manual) is a GitHub Release attachment on
// this PUBLIC repo — tag v<version>, file PinakaFlowTAXI-<version>-Setup.zip.
// Build the ZIP with:  python tools/package_website_release.py --manual <file>
const GITHUB_REPO = 'prepogycode-bit/pinakaflow-taxi'
const VERSION = '5.27.2'

// Leave false until the release is published on GitHub. While false, the
// download card shows but links nowhere, and tells the visitor the link goes
// live soon — nobody gets a 404.
const RELEASE_LIVE = true

const INSTALLER_NAME = `PinakaFlowTAXI-${VERSION}-Setup.zip`

export const site = {
  version: VERSION,
  releaseDate: '25 OCT 2026',
  // The ZIP's size, as printed by the packaging script. Since 5.27 the
  // browser is inside the installer, so nothing is downloaded on first run.
  installerSize: '209 MB',

  githubRepo: GITHUB_REPO,
  installerName: INSTALLER_NAME,
  installerUrl: RELEASE_LIVE
    ? `https://github.com/${GITHUB_REPO}/releases/download/v${VERSION}/${INSTALLER_NAME}`
    : '',

  // ---- Trial ---------------------------------------------------------------
  // Match this to the server's trial broadcast. true = "Free trial is live",
  // "Try for free" buttons; false = plain "Download" wording.
  trialLive: true,

  // ---- Contact -------------------------------------------------------------
  supportEmail: 'pinakaflow@gmail.com',
  siteDomain: 'PINAKAFLOW.IN',

  // ---- Page switches -------------------------------------------------------
  // showLiveDemo: the animated dashboard under the hero.
  // gateRequiresSignIn: false skips step 1 and starts visitors on the form.
  showLiveDemo: true,
  gateRequiresSignIn: true,
}

// ---- LedgerX ----------------------------------------------------------------
// PinakaFlow's Excel-to-Tally tool, shown in its own section. With no
// downloadUrl the button opens an email to support instead.
export const ledgerx = {
  version: '2.2.0',
  downloadUrl: '',
}

// What's new list, shown in the Setup guide section. The packaging script
// also copies these lines into the GitHub release notes, so keep each one on
// a single line in single quotes.
export const changelog = [
  'One database for the whole office: every PC that opens the same Credentials workbook sees the same returns status, groups and flags.',
  'A client whose password the portal refuses turns grey and is skipped until the password is changed, with Update password and Already correct buttons.',
  'Group your clients, and archive the ones you no longer work with.',
  'A hard-to-read captcha? Press New captcha (or F5) for another one.',
  'Update database closes its browsers when it is done, and reads clients registered this year correctly.',
  'Everything in one installer: the browser comes inside it, so a new PC needs nothing else and nothing downloads on first run.',
  'Every client shows its next due return, or what is overdue, and the list filters by Filed, Due and Overdue.',
  'Update database reads the returns status of every client from the portal, five clients at a time.',
  'A new Credentials workbook in TAXI colours, with a QRMP / Normal / No idea mark per client: mark No idea and TAXI finds out itself.',
  'A calmer screen: clients on the left, automation on the right, and Activity, Bots and Downloads one click away in the top bar.',
  'Search finds clients by their initials too: type "st" for Sharma Traders.',
]
