// ============================================================
//  TRAVEL DATA — the only file you need to edit!
//
//  HOW TO ADD A NEW COUNTRY:
//    1. Look up its ISO numeric code (column "Numeric" at
//       https://en.wikipedia.org/wiki/ISO_3166-1_numeric)
//    2. Add a new entry below following the same pattern.
//
//  HOW TO ADD PHOTOS:
//    Just drop image files into  photos/<folder>/
//    They appear automatically — no code changes needed!
//
//  HOW TO ADD A LOCATION INSIDE AN EXISTING COUNTRY:
//    Add a new key under that country's  locations  object.
// ============================================================

const TRAVEL_DATA = {
  vietnam: {
    name: "Vietnam",
    countryCode: 704,
    locations: {
      "phu-quoc": { name: "Phu Quoc", folder: "vietnam/phu-quoc", music: "phu-quoc.mp3", date: "Tháng 6, 2019" },
      "sapa":     { name: "Sapa",     folder: "vietnam/sapa",     music: "sapa.mp3",     date: "Tháng 9, 2025" }
    }
  },

  usa: {
    name: "United States",
    countryCode: 840,
    locations: {
      "san-jose": { name: "San Jose", folder: "usa/san-jose", music: "san-jose.mp3", date: "Tháng 8, 2022" },
      "malibu":   { name: "Malibu",   folder: "usa/malibu",   music: "malibu.mp3",   date: "Tháng 8, 2022" },
      "big-sur":  { name: "Big Sur",  folder: "usa/big-sur",  music: "big-sur.mp3",  date: "Tháng 8, 2022" }
    }
  },

  bahamas: {
    name: "Bahamas",
    countryCode: 44,
    locations: {
      "bahamas": { name: "Bahamas", folder: "bahamas", music: "bahamas.mp3", date: "Tháng 7, 2023" }
    }
  }
};
