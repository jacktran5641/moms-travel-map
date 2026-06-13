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
      "phu-quoc": {
        name: "Phu Quoc",
        folder: "vietnam/phu-quoc"
      }
    }
  },

  usa: {
    name: "United States",
    countryCode: 840,
    locations: {
      "san-jose": { name: "San Jose", folder: "usa/san-jose" },
      "malibu":   { name: "Malibu",   folder: "usa/malibu"   },
      "big-sur":  { name: "Big Sur",  folder: "usa/big-sur"  }
    }
  },

  bahamas: {
    name: "Bahamas",
    countryCode: 44,
    locations: {
      "bahamas": {
        name: "Bahamas",
        folder: "bahamas"
      }
    }
  }
};
