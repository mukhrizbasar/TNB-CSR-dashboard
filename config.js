// Fill these in once (see SETUP.md). None of these values are secret:
// they are protected by Firestore rules and by restricting the Maps key to your site's address.
export const CONFIG = {
  // Google Maps JavaScript API key. Leave empty ("") to use the free OpenStreetMap map instead.
  googleMapsKey: "",

  // Firebase web app config (Firebase console > Project settings > Your apps > Web app > Config).
  firebase: {
    apiKey: "AIzaSyCg6AN7zSiCVydvf5bCLwW9svtLYeSnt7k",
    authDomain: "csr-solar-dashboard.firebaseapp.com",
    projectId: "csr-solar-dashboard",
    appId: "1:476559184445:web:f2392d7902b8f255431054"
  },

  // Sign in with Microsoft (see SETUP.md, "Sign in with Microsoft").
  // tenant: leave "" for any Microsoft account, or put TNB's Directory (tenant) ID to show only TNB's sign-in page.
  // enabled: set to false to hide the Microsoft button.
  microsoft: { enabled: true, tenant: "" },

  // Optional: shown in the header.
  title: "TNB CSR Dashboard"
};
