# TNB CSR dashboard: setup

The app is a set of plain files (`index.html`, `app.js`, `config.js`).
It runs free on GitHub Pages, keeps its data in Firebase (Google), and shows a free OpenStreetMap street map with a satellite option.
The project data is never stored in the repository: it lives only in Firebase.

You need a Google account and a GitHub account. Total time is about 20 minutes.

## 1. Firebase (database and sign-in)
1. Go to https://console.firebase.google.com and click **Create a project**. Any name works, for example `csr-solar-dashboard`. Google Analytics is not needed.
2. **Build > Firestore Database > Create database.** Choose location `asia-southeast1 (Singapore)` and start in **production mode**.
3. In Firestore, open the **Rules** tab, replace everything with the contents of `firestore.rules`, and click **Publish**.
4. In Firestore **Data**, click **Start collection**:
   - Collection ID: `config`, Document ID: `access`
   - Field `editors`, type **array**: add each editor's Google email (yours first, in lowercase)
   - Field `viewers`, type **array**: emails that may only view (can be empty)
   - Field `publicRead`, type **boolean**: `false` (set `true` only if anyone with the link may view)
5. **Build > Authentication > Get started > Google**, turn it on, and save.
6. **Project settings (gear icon) > General > Your apps > Web (`</>`)**. Register an app (no hosting needed) and copy the `apiKey`, `authDomain`, `projectId` and `appId` values into `config.js`.

## 2. Google Maps key (skip: this dashboard uses the free OpenStreetMap map)
Leave `googleMapsKey` empty in `config.js`. The steps below are only for switching to Google Maps later.

Google Maps needs a billing account on the same Google Cloud project. Normal use by a small team stays inside Google's free monthly quota.
1. Open https://console.cloud.google.com, select the Firebase project from the top bar.
2. **Billing**: link a billing account if asked.
3. **APIs & Services > Library**: enable **Maps JavaScript API**.
4. **APIs & Services > Credentials > Create credentials > API key**. Then edit the key:
   - Application restrictions: **Websites**, add `https://YOUR-GITHUB-NAME.github.io/*`
   - API restrictions: **Maps JavaScript API** only
5. Paste the key into `googleMapsKey` in `config.js`.
6. Optional but recommended: **Billing > Budgets & alerts**, set a small budget (for example RM 20) so you get an email if usage ever goes past the free quota.

If you leave `googleMapsKey` empty, the app uses a free OpenStreetMap street map with a satellite option instead.

## 3. Publish on GitHub Pages
1. Create a new repository on GitHub, for example `csr-solar-dashboard` (private is fine on paid plans; public on free plans).
2. Upload all files from this folder to it.
3. **Settings > Pages**: Source **Deploy from a branch**, branch `main`, folder `/ (root)`. The site appears at `https://YOUR-GITHUB-NAME.github.io/csr-solar-dashboard/` after a minute.
4. Back in Firebase: **Authentication > Settings > Authorized domains > Add domain**: `YOUR-GITHUB-NAME.github.io`.

## 4. First run
Open the site, click **Sign in with Google** with an editor email. The list will be empty with an **Import projects file** button. Click it and choose `seed-projects.json` (sent to you separately, not kept in GitHub). Do this once.

## Day-to-day
- Add or remove editors and viewers by editing `config/access` in the Firestore console.
- Pick a pillar (Environment, Economic Social, Education, Wakalah, Sports) and then a programme along the top. Click any pin or row to see details. Editors click **Edit** to change status, value, dates or location. **Pick on map** with satellite view is the quickest way to pin the exact rooftop.
- **Export to Excel** downloads what you are looking at, one sheet per programme, with each programme's own columns plus coordinates. An exported sheet can be edited and imported again.

## Adding other years (2025, 2027 to 2030)
- Use the **year selector** next to the filters to view one year or all years together. Each project has a **Year** field.
- To bring in a whole year's list, an editor clicks **Import list** and chooses that year's Excel file. Use the same columns as the Masterlist sheet (No., Component, Project Name, State, Month, Application Received Date, Project Value (RM), Project Status, ...). The app reads the sheet named "Masterlist" (or the first sheet).
- The year comes from a "Year" column if the file has one, otherwise from the Application Received Date, otherwise the year currently selected.
- Projects already in the dashboard (same name and year) are skipped, so importing the same file twice is safe.
- Imported projects have no map pin yet. Open each one, click **Edit project**, then **Pick on map**.

## Project photos
- Open a project and click **+ Add photos**. You can pick several at once, and on a phone you can take them with the camera. Click a photo to view it full size, add a caption, or delete it.
- Photos are shrunk in the browser (longest side about 1600 px) and stored in Firestore, so no paid Firebase Storage plan is needed. The free plan holds about 1 GB, which is roughly 4,000 to 6,000 photos.
- **One-time step:** photos need the updated rules. In Firebase, go to **Firestore > Rules**, replace everything with the contents of `firestore.rules`, and click **Publish**.
- iPhone photos in HEIC format may not open in Chrome or Windows. Set **iPhone Settings > Camera > Formats > Most Compatible**, or send them as JPEG.

## Pillars and programmes
| Pillar | Programmes | What each record is |
|---|---|---|
| Environment | Solar Rooftop & Streetlight, Tree for a Tree, Other environment projects | a project |
| Economic Social | Sumbangan Kenderaan Terpakai | a vehicle donation |
| Education | Ceria Ke Sekolah, Sekolah Angkat JEK | a school |
| Wakalah | Projek Baiti Jannati (PBJ), Perumahan Mesra Rakyat (PMR) | a house |
| Sports | Sekolah Hoki Angkat TNB | a school |

Each programme has its own form fields and statuses:
- Environment: Site Visit, Pending Proposal, Pending Approval Memo, Approved, Ongoing, Completed.
- PBJ and PMR: Application received, Approved, Vendor appointed, Under construction, Completed.
- The others: Planning, Approved, Ongoing, Completed.

The **Overview** and pillar views combine programmes, so they group statuses into four stages: In pipeline, Approved, In progress, Completed.

To add a record, open the programme and click **+ Add** (or pick the programme in the form). To bring in a list, open the programme first, then **Import list** with an Excel file that uses the same column names as that programme's export.

## Importing the PBJ and PMR list (one time)
An editor opens the dashboard, clicks **Import list** and picks `pbj-pmr-seed.json` (sent separately, not kept in GitHub). It holds 214 houses from the 2026 PBJ masterlist (2023 to 2026).
- IC numbers were left out on purpose. Names, addresses and background notes are personal data, so keep `publicRead` set to `false` in `config/access`.
- House pins are placed at the town or district, not the house. Open a house, click **Edit**, then **Pick on map** to set the exact spot.
- Importing the same file twice is safe: houses already in the dashboard are skipped.

## Sign in with Microsoft
The **Sign in with Microsoft** button lets people use their TNB Microsoft (Outlook / Office 365) account. It needs a one-time setup in two places. The Azure part usually needs TNB IT, because it is done in TNB's Microsoft directory.

**A. Firebase (you)**
1. Firebase console > **Authentication > Sign-in method > Add new provider > Microsoft**. Turn it on.
2. Copy the **callback URL** it shows. It is `https://csr-solar-dashboard.firebaseapp.com/__/auth/handler`.
3. Leave the window open: you will paste two values from step B.

**B. Azure app registration (TNB IT, or anyone allowed to register apps in TNB's directory)**
1. Go to https://portal.azure.com > **Microsoft Entra ID > App registrations > New registration**.
2. Name: `TNB CSR Dashboard`. Supported account types: **Accounts in this organizational directory only (single tenant)**. This keeps sign-in to TNB accounts only.
3. Redirect URI: platform **Web**, paste the callback URL from A2. Click **Register**.
4. Copy the **Application (client) ID** and the **Directory (tenant) ID** from the Overview page.
5. **Certificates & secrets > New client secret**. Copy the secret **Value** (it is shown once).

**C. Finish in Firebase**
1. Paste the client ID as **Application ID** and the secret **Value** as **Application secret**, then **Save**.
2. In `config.js`, set `microsoft: { enabled: true, tenant: "PASTE-DIRECTORY-TENANT-ID" }`. This sends people straight to TNB's sign-in page. (Needed for single-tenant apps.)
3. Firestore > **Rules**: paste the latest `firestore.rules` and **Publish**. The new rules accept Microsoft accounts, which often don't report a "verified" email.
4. Add the person's Microsoft email (for example `name@tnb.com.my`) to `editors` or `viewers` in `config/access`, in lowercase.

Notes
- If someone already signed in with Google using the same email, Firebase will ask them to keep using Google. Either button works for anyone whose email is on the list.
- Client secrets expire (Azure's maximum is 2 years). Put a reminder to create a new one and paste it into Firebase before then.
- If you don't want the Microsoft button yet, set `enabled: false` in `config.js`.
