// ---------------------------------------------------------------------------
// Firebase — Google sign-in + storing trial sign-ups.
//
// TO SWITCH IT ON:
//   1. Firebase console -> Project settings -> Your apps -> Web app.
//      Copy the firebaseConfig object and paste its values below.
//   2. Authentication -> Sign-in method -> enable Google.
//   3. Authentication -> Settings -> Authorized domains -> add the domain the
//      site is served from (e.g. <user>.github.io, or your custom domain).
//   4. Firestore Database -> Create database. Rules for a sign-up form that
//      only ever writes (nobody can read the leads back from the browser):
//
//        rules_version = '2';
//        service cloud.firestore {
//          match /databases/{database}/documents {
//            match /trialSignups/{doc} {
//              allow create: if request.auth != null;
//              allow read, update, delete: if false;
//            }
//          }
//        }
//
// UNTIL THEN: isFirebaseConfigured() is false, and the download gate runs in
// local mode — the flow and validation work exactly the same, the details are
// just kept in the browser instead of being sent anywhere.
// ---------------------------------------------------------------------------

// Web app "pinakaflow.in website" in project pinakaflow-e4ebd. These values
// are public by design; access is controlled by the Firestore rules.
export const firebaseConfig = {
  apiKey: 'AIzaSyBjq6W8EWVoPeveE9RMSYIxt11Jo-8aEgM',
  authDomain: 'pinakaflow-e4ebd.firebaseapp.com',
  projectId: 'pinakaflow-e4ebd',
  storageBucket: 'pinakaflow-e4ebd.firebasestorage.app',
  messagingSenderId: '22378749859',
  appId: '1:22378749859:web:3790343dcf6540688b8416',
}

// Firestore collection the sign-ups are written to.
export const SIGNUPS_COLLECTION = 'trialSignups'

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)
}

// The Firebase SDK is only ever loaded if a config is present, so an
// unconfigured site ships none of it to the visitor.
let appPromise = null

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const { initializeApp, getApps } = await import('firebase/app')
      return getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    })()
  }
  return appPromise
}

// Pops the Google account chooser. Returns { name, email } or throws.
export async function signInWithGoogle() {
  const app = await getApp()
  const { getAuth, GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
  const auth = getAuth(app)
  const result = await signInWithPopup(auth, new GoogleAuthProvider())
  return {
    uid: result.user.uid,
    name: result.user.displayName || '',
    email: result.user.email || '',
  }
}

// ---- Admin panel (#admin) ---------------------------------------------------
// Reading and changing enquiries is allowed only to the admin account named in
// the Firestore rules; any other account gets "permission-denied".

// Admins who sign in with a user ID get a Firebase email/password account on
// this made-up domain: "ravi" -> ravi@admins.pinakaflow.in. Typing a real email
// works too.
export const ADMIN_ID_DOMAIN = 'admins.pinakaflow.in'
export const ADMINS_COLLECTION = 'admins'

export function adminIdToEmail(userId) {
  const id = String(userId || '').trim().toLowerCase()
  return id.includes('@') ? id : `${id}@${ADMIN_ID_DOMAIN}`
}

export function emailToAdminId(email) {
  const e = String(email || '')
  return e.endsWith('@' + ADMIN_ID_DOMAIN) ? e.slice(0, -ADMIN_ID_DOMAIN.length - 1) : e
}

export async function watchAuth(callback) {
  const app = await getApp()
  const { getAuth, onAuthStateChanged } = await import('firebase/auth')
  return onAuthStateChanged(getAuth(app), (u) =>
    callback(
      u
        ? {
            uid: u.uid,
            name: u.displayName || '',
            email: u.email || '',
            provider: u.providerData[0]?.providerId || 'password',
          }
        : null
    )
  )
}

export async function signInWithPassword(userId, password) {
  const app = await getApp()
  const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth')
  return signInWithEmailAndPassword(getAuth(app), adminIdToEmail(userId), password)
}

export async function changeMyPassword(current, next) {
  const app = await getApp()
  const { getAuth, EmailAuthProvider, reauthenticateWithCredential, updatePassword } =
    await import('firebase/auth')
  const user = getAuth(app).currentUser
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current))
  return updatePassword(user, next)
}

export async function watchAdmins(onRows, onError) {
  const app = await getApp()
  const { getFirestore, collection, onSnapshot } = await import('firebase/firestore')
  return onSnapshot(
    collection(getFirestore(app), ADMINS_COLLECTION),
    (snap) =>
      onRows(
        snap.docs
          .map((d) => {
            const data = d.data()
            return { id: d.id, ...data, addedAt: data.addedAt?.toDate ? data.addedAt.toDate() : null }
          })
          .sort((a, b) => (a.addedAt?.getTime() || 0) - (b.addedAt?.getTime() || 0))
      ),
    onError
  )
}

async function writeAdmin(id, record) {
  const app = await getApp()
  const { getFirestore, doc, setDoc, serverTimestamp } = await import('firebase/firestore')
  const { getAuth } = await import('firebase/auth')
  const me = getAuth(app).currentUser
  return setDoc(doc(getFirestore(app), ADMINS_COLLECTION, id), {
    ...record,
    addedBy: me?.email || '',
    addedAt: serverTimestamp(),
  })
}

// A Google admin is allowed by email; the rules only accept it from a Google
// sign-in (a verified address).
export async function addGoogleAdmin(email, name) {
  const e = String(email).trim().toLowerCase()
  return writeAdmin(`email:${e}`, { kind: 'google', email: e, name: name || '' })
}

// A user-ID admin: the login is created right here, on a second Firebase
// instance so the admin doing it stays signed in. Allowed by its uid.
export async function addPasswordAdmin(userId, name, password) {
  const { initializeApp, getApps, deleteApp } = await import('firebase/app')
  const { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } = await import(
    'firebase/auth'
  )
  const helper =
    getApps().find((a) => a.name === 'admin-maker') || initializeApp(firebaseConfig, 'admin-maker')
  try {
    const helperAuth = getAuth(helper)
    const email = adminIdToEmail(userId)
    const cred = await createUserWithEmailAndPassword(helperAuth, email, password)
    if (name) await updateProfile(cred.user, { displayName: name })
    await signOut(helperAuth)
    await writeAdmin(`uid:${cred.user.uid}`, {
      kind: 'password',
      email,
      userId: emailToAdminId(email),
      name: name || '',
      uid: cred.user.uid,
    })
  } finally {
    await deleteApp(helper).catch(() => {})
  }
}

export async function removeAdmin(id) {
  const app = await getApp()
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore')
  return deleteDoc(doc(getFirestore(app), ADMINS_COLLECTION, id))
}

export async function signOutAdmin() {
  const app = await getApp()
  const { getAuth, signOut } = await import('firebase/auth')
  return signOut(getAuth(app))
}

// Live list of every enquiry, newest first. Returns the unsubscribe function.
export async function watchSignups(onRows, onError) {
  const app = await getApp()
  const { getFirestore, collection, query, orderBy, onSnapshot } = await import(
    'firebase/firestore'
  )
  const q = query(collection(getFirestore(app), SIGNUPS_COLLECTION), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) =>
      onRows(
        snap.docs.map((d) => {
          const data = d.data()
          return {
            id: d.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : null,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
          }
        })
      ),
    onError
  )
}

export async function updateSignup(id, patch) {
  const app = await getApp()
  const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
  return updateDoc(doc(getFirestore(app), SIGNUPS_COLLECTION, id), {
    ...patch,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSignup(id) {
  const app = await getApp()
  const { getFirestore, doc, deleteDoc } = await import('firebase/firestore')
  return deleteDoc(doc(getFirestore(app), SIGNUPS_COLLECTION, id))
}

// Writes one trial sign-up. `record` is the seven form fields plus whatever
// the Google account told us.
export async function saveSignup(record) {
  const app = await getApp()
  const { getFirestore, collection, addDoc, serverTimestamp } = await import(
    'firebase/firestore'
  )
  const db = getFirestore(app)
  return addDoc(collection(db, SIGNUPS_COLLECTION), {
    ...record,
    createdAt: serverTimestamp(),
    userAgent: navigator.userAgent,
  })
}
