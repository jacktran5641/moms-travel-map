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
  },

  france: {
    name: "France",
    countryCode: 250,
    locations: {
      "paris": { name: "Paris", folder: "france/paris", music: "", date: "", placeholder: true }
    }
  },

  uk: {
    name: "United Kingdom",
    countryCode: 826,
    locations: {
      "london": { name: "London", folder: "uk/london", music: "", date: "", placeholder: true }
    }
  },

  southafrica: {
    name: "South Africa",
    countryCode: 710,
    locations: {
      "south-africa": { name: "South Africa", folder: "southafrica", music: "", date: "", placeholder: true }
    }
  },

  peru: {
    name: "Peru",
    countryCode: 604,
    locations: {
      "peru": { name: "Peru", folder: "peru", music: "", date: "", placeholder: true }
    }
  },

  argentina: {
    name: "Argentina",
    countryCode: 32,
    locations: {
      "argentina": { name: "Argentina", folder: "argentina", music: "", date: "", placeholder: true }
    }
  },

  brazil: {
    name: "Brazil",
    countryCode: 76,
    locations: {
      "brazil": { name: "Brazil", folder: "brazil", music: "", date: "", placeholder: true }
    }
  },

  uae: {
    name: "UAE",
    countryCode: 784,
    locations: {
      "dubai": { name: "Dubai", folder: "uae/dubai", music: "", date: "", placeholder: true }
    }
  },

  singapore: {
    name: "Singapore",
    countryCode: 702,
    locations: {
      "singapore": { name: "Singapore", folder: "singapore", music: "", date: "", placeholder: true }
    }
  },

  indonesia: {
    name: "Indonesia",
    countryCode: 360,
    locations: {
      "bali": { name: "Bali", folder: "indonesia/bali", music: "", date: "", placeholder: true }
    }
  },

  australia: {
    name: "Australia",
    countryCode: 36,
    locations: {
      "australia": { name: "Australia", folder: "australia", music: "", date: "", placeholder: true }
    }
  },

  japan: {
    name: "Japan",
    countryCode: 392,
    locations: {
      "japan": { name: "Japan", folder: "japan", music: "", date: "", placeholder: true }
    }
  },

  germany: {
    name: "Germany",
    countryCode: 276,
    locations: {
      "germany": { name: "Germany", folder: "germany", music: "", date: "", placeholder: true }
    }
  }
};
