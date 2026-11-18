# MargDarshak Gurugram (मार्गदर्शक)

> **Buildathon: Make Wednesdays Great Again**  
> **Track:** Build for the Physical World  
> **Team:** GurugramCivic (@Shriraj22)

---

## 📌 Problem Insight
* **Who faces this problem?** Over 1.5 million residents, daily commuters, and RWAs in Gurugram navigating worsening open waste dumping points and hazardous road craters/potholes across major corridors (Old Gurugram, DLF, Cyber City, Golf Course Road, Sohna Road, and Dwarka Expressway).
* **Why does it happen?** Citizens lack an immediate, zero-friction way to report civic hazards with GPS evidence, and crucially, they do not know which specific **MCG Zone (Zones 1 through 6)**, **Ward (Wards 1 to 36)**, or **Joint Commissioner** holds administrative jurisdiction over their exact spot. Complaints on generic social media get buried with zero accountability.

---

## 💡 Solution: MargDarshak Gurugram
A lightning-fast, mobile-first civic accountability webapp designed for Gurugram:

1. **30-Second Civic Reporting**: Report any garbage blackspot or pothole with GPS-stamped photo evidence, auto-mapped to the relevant MCG Ward and Sector.
2. **Autonomous MCG Authority Routing**: Automatically identifies the responsible **Sanitary Inspector**, **Executive Engineer (Roads)**, and **Joint Commissioner** (Clusters 1 & 2, Zones 1–6) based on official MCG administrative structures.
3. **Interactive Civic Map**: OpenStreetMap/Leaflet integration pinpointing active garbage blackspots and road hazards with color-coded severity.
4. **Public Escalation & Amplification**: One-click drafted escalation for X (Twitter) tagging `@mcg_gurgaon` and `@DC_Gurugram`, plus instant WhatsApp RWA community sharing.
5. **MCG Ward Leaderboard & Analytics**: Live scorecard tracking resolution rates across all 6 MCG Zones to drive civic transparency and public pressure.

---

## 🚀 Running Locally

```bash
cd webapp
npm install
npm run dev
```

App runs on `http://127.0.0.1:5173`.
All data is persisted in browser local storage with zero cloud/API cost.
