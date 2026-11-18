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
- **Click to filter, like Power BI.** Click a KPI card (Completed, Under way, In pipeline, Paid, "not paid", "without a value yet"), a status in the pipeline, a state, a programme, an agency, a fund or any bar, and every card, chart, map pin and the list update. Click it again to clear it. Hold **Ctrl** (Cmd on Mac) or **Shift** to pick several. Clicking a coloured part of a bar filters by that row and that status together.
- **Filters** opens slicers with tick boxes and counts for stage, status, state, district, agency, fund, vendor, component, school, year, payment and more. Active filters show as chips under the search box. Click ✕ on a chip, or **Clear all**.
- The **RM / Count** switch changes the charts between value and number of records. The second chart's dropdown picks what to break down by (agency, district, fund, vendor, programme…). The list has its own sort.
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
- Open a project and click **+ Add photos**. Each project can have **2 photos** (for example before and after). Once it has 2, the button is greyed out until you delete one. You can pick both at once, and on a phone you can take them with the camera. Click a photo to view it full size, add a caption, or delete it.
- Photos are shrunk automatically when uploaded: the longest side becomes 1600 px (1000 px at least) and the file is compressed to about 300 KB, which still shows site details clearly. You can upload phone photos of any size. They are stored in Firestore, so no paid Firebase Storage plan is needed. The free 1 GB holds about 3,000 photos.
- **One-time step:** photos need the updated rules, which also enforce the 2-photo limit (re-publish them after this update). In Firebase, go to **Firestore > Rules**, replace everything with the contents of `firestore.rules`, and click **Publish**.
- iPhone photos in HEIC format may not open in Chrome or Windows. Set **iPhone Settings > Camera > Formats > Most Compatible**, or send them as JPEG.

## Pillars and programmes
| Pillar | Programmes | What each record is |
|---|---|---|
| Environment | Solar Rooftop & Streetlight, Tree for a Tree, Other environment projects | a project |
| Economic Social | Sumbangan Kenderaan Terpakai, Perumahan Mesra Rakyat (PMR) | a vehicle donation, a house |
| Education | Ceria Ke Sekolah (CKS), Sekolah Angkat JEK | a voucher handover in a YB's area (CKS), a contribution to an adopted school (JEK) |
| Wakalah | Projek Baiti Jannati (PBJ) | a house |
| Sports | Sekolah Hoki Angkat TNB | a school |

Each programme has its own form fields and statuses:
- Environment: Site Visit, Pending Proposal, Pending Approval Memo, Approved, Ongoing, Completed.
- PBJ and PMR: Application received, Approved, Vendor appointed, Under construction, Completed, Rejected.
- The others: Planning, Approved, Ongoing, Completed.

The **Overview** and pillar views combine programmes, so they group statuses into stages: In pipeline, Approved, In progress, Completed (plus Rejected for PBJ and PMR).

To add a record, open the programme and click **+ Add** (or pick the programme in the form). To bring in a list, open the programme first, then **Import list** with an Excel file that uses the same column names as that programme's export.

## Importing the PBJ and PMR list (one time)
An editor opens the dashboard, clicks **Import list** and picks `pbj-pmr-seed.json` (sent separately, not kept in GitHub). It holds 214 houses from the 2026 PBJ masterlist (2023 to 2026).
- IC numbers were left out on purpose. Names, addresses and background notes are personal data, so keep `publicRead` set to `false` in `config/access`.
- House pins are placed at the town or district, not the house. Open a house, click **Edit**, then **Pick on map** to set the exact spot.
- Importing the same file twice is safe: houses already in the dashboard are skipped.


## Importing the Sekolah Angkat JEK list (one time)
An editor clicks **Import list** and picks `jek-seed.json` (sent separately). It holds 41 records from the "JEK List CSR" sheet, updated to 30 Oct 2026:
- 35 contributions: RM 134,885 in 2025 and RM 211,040 in 2026, matching the sheet's totals.
- 6 nominated schools with no contribution yet (status Planning). Two of them are still "TBC".
- Each contribution keeps its JEK member, position, school and category (ED, ES, SP, ENV).
- Contributions are set to **Approved** and **Not Paid**. Update them when they are paid or done.
- School pins are placed at the town, not the school.

## Importing the CKS 2027 list (one time)
An editor clicks **Import list** and picks `cks-seed.json` (sent separately). It holds 91 handovers from the "Cadangan Tarikh & Lokasi Pelaksanaan CKS 2027" sheet, under year **2027**:
- 10,050 pupils and RM 1,005,000 in total (RM100 voucher each), matching the sheet's JUMLAH row.
- Each handover keeps its YB and position, area, handover date and venue, method, vendor and the SharePoint link to photos and the recipient list.
- Status: **Completed** where the sheet says Selesai, **Date confirmed** where a handover date is set, otherwise **Planning**. Vague dates such as "Disember 2026" and times go into Remarks.
- Pins are placed at the area (Parlimen / DUN), not the venue.
