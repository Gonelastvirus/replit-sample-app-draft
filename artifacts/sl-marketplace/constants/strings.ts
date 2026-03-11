export type Language = "en" | "ne";

export const strings: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    home: "Home",
    search: "Search",
    map: "Map",
    favorites: "Favorites",
    profile: "Profile",
    services: "Services",
    admin: "Admin",

    // Home
    discover: "Discover",
    your_next_home: "Your Next Home",
    featured: "Featured",
    recent: "Recently Added",
    forSale: "For Sale",
    forRent: "For Rent",
    viewAll: "View All",
    searchPlaceholder: "Search by district, city...",

    // Property types
    house: "House",
    land: "Land",
    apartment: "Apartment",
    commercial: "Commercial",

    // Details
    beds: "Beds",
    baths: "Baths",
    area: "Area",
    builtYear: "Built",
    description: "Description",
    amenities: "Amenities",
    location: "Location",
    contactOwner: "Contact Owner",
    callOwner: "Call Owner",
    whatsapp: "WhatsApp",
    saveProperty: "Save Property",
    savedProperty: "Saved",

    // Amenities
    parking: "Parking",
    balcony: "Balcony",
    garden: "Garden",
    water: "Water Supply",
    internet: "Internet",
    road_access: "Road Access",
    solar: "Solar",
    security: "Security",
    terrace: "Terrace",
    lift: "Lift",

    // Search & Filter
    filters: "Filters",
    applyFilters: "Apply Filters",
    clearFilters: "Clear Filters",
    district: "District",
    priceRange: "Price Range",
    propertyType: "Property Type",
    listingType: "Listing Type",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    bedrooms: "Bedrooms",
    all: "All",

    // Submit
    submitListing: "Submit Listing",
    title: "Title",
    descriptionLabel: "Description",
    price: "Price (NPR)",
    areaLabel: "Area (Dhur)",
    submit: "Submit",
    submitting: "Submitting...",
    submitted: "Submitted for review",
    photoUpload: "Add Photos",
    videoUpload: "Add Video",

    // Auth
    login: "Login",
    register: "Register",
    email: "Email",
    password: "Password",
    name: "Full Name",
    phone: "Phone Number",
    loginTitle: "Welcome Back",
    registerTitle: "Create Account",
    loginSubtitle: "Sign in to save favorites and list properties",
    registerSubtitle: "Join Nepal's leading property marketplace",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    continueAsGuest: "Continue as Guest",
    logout: "Log Out",
    loginRequired: "Login Required",
    loginToFavorite: "Please login to save favorites",

    // Favorites
    favoritesTitle: "Saved Properties",
    favoritesEmpty: "No saved properties",
    favoritesEmptyDesc: "Browse properties and tap the heart icon to save them here",

    // Services
    servicesTitle: "Construction Services",
    servicesSubtitle: "Find professionals for your project",
    callNow: "Call Now",
    plumber: "Plumber",
    brick_supplier: "Brick Supplier",
    electrician: "Electrician",
    cement_supplier: "Cement Supplier",
    contractor: "Contractor",
    hardware_store: "Hardware Store",
    sand_gravel_supplier: "Sand & Gravel",
    tile_supplier: "Tile Supplier",
    iron_supplier: "Iron Supplier",
    interior_designer: "Interior Designer",

    // Admin
    adminPanel: "Admin Panel",
    pendingReview: "Pending Review",
    approve: "Approve",
    reject: "Reject",
    feature: "Feature",
    unfeature: "Unfeature",
    adminLogin: "Admin Login",

    // About
    about: "About Us",
    mission: "Our Mission",
    vision: "Our Vision",
    contactUs: "Contact Us",

    // Map
    mapView: "Map View",
    noPropertiesInArea: "No properties in this area",

    // Status
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",

    // General
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Retry",
    noResults: "No results found",
    per_month: "/month",
    dhur: "Dhur",
    npr: "NPR",
  },
  ne: {
    // Navigation
    home: "गृहपृष्ठ",
    search: "खोज्नुहोस्",
    map: "नक्सा",
    favorites: "मनपर्ने",
    profile: "प्रोफाइल",
    services: "सेवाहरू",
    admin: "प्रशासक",

    // Home
    discover: "खोज्नुहोस्",
    your_next_home: "तपाईंको अर्को घर",
    featured: "विशेष",
    recent: "भर्खर थपिएका",
    forSale: "बिक्रीको लागि",
    forRent: "भाडामा",
    viewAll: "सबै हेर्नुहोस्",
    searchPlaceholder: "जिल्ला, शहर खोज्नुहोस्...",

    // Property types
    house: "घर",
    land: "जग्गा",
    apartment: "अपार्टमेन्ट",
    commercial: "व्यावसायिक",

    // Details
    beds: "कोठा",
    baths: "बाथरूम",
    area: "क्षेत्रफल",
    builtYear: "निर्मित",
    description: "विवरण",
    amenities: "सुविधाहरू",
    location: "स्थान",
    contactOwner: "मालिकलाई सम्पर्क",
    callOwner: "फोन गर्नुहोस्",
    whatsapp: "ह्वाट्सएप",
    saveProperty: "सेभ गर्नुहोस्",
    savedProperty: "सेभ भयो",

    // Amenities
    parking: "पार्किङ",
    balcony: "ब्यालकोनी",
    garden: "बगैचा",
    water: "पानी आपूर्ति",
    internet: "इन्टरनेट",
    road_access: "सडक पहुँच",
    solar: "सोलार",
    security: "सुरक्षा",
    terrace: "छत",
    lift: "लिफ्ट",

    // Search & Filter
    filters: "फिल्टर",
    applyFilters: "फिल्टर लगाउनुहोस्",
    clearFilters: "फिल्टर हटाउनुहोस्",
    district: "जिल्ला",
    priceRange: "मूल्य दायरा",
    propertyType: "सम्पत्ति प्रकार",
    listingType: "सूचीको प्रकार",
    minPrice: "न्यूनतम मूल्य",
    maxPrice: "अधिकतम मूल्य",
    bedrooms: "शयनकक्ष",
    all: "सबै",

    // Submit
    submitListing: "सूची पेश गर्नुहोस्",
    title: "शीर्षक",
    descriptionLabel: "विवरण",
    price: "मूल्य (NPR)",
    areaLabel: "क्षेत्रफल (धुर)",
    submit: "पेश गर्नुहोस्",
    submitting: "पेश गर्दैछ...",
    submitted: "समीक्षाको लागि पेश गरियो",
    photoUpload: "फोटो थप्नुहोस्",
    videoUpload: "भिडियो थप्नुहोस्",

    // Auth
    login: "लगिन",
    register: "दर्ता",
    email: "इमेल",
    password: "पासवर्ड",
    name: "पूरा नाम",
    phone: "फोन नम्बर",
    loginTitle: "स्वागत छ",
    registerTitle: "खाता बनाउनुहोस्",
    loginSubtitle: "मनपर्ने सेभ गर्न र सूची थप्न लगिन गर्नुहोस्",
    registerSubtitle: "नेपालको प्रमुख सम्पत्ति बजारमा सामेल हुनुहोस्",
    alreadyHaveAccount: "पहिल्यै खाता छ?",
    dontHaveAccount: "खाता छैन?",
    continueAsGuest: "अतिथिको रूपमा जारी राख्नुहोस्",
    logout: "लग आउट",
    loginRequired: "लगिन आवश्यक छ",
    loginToFavorite: "मनपर्ने सेभ गर्न लगिन गर्नुहोस्",

    // Favorites
    favoritesTitle: "सेभ गरिएका सम्पत्तिहरू",
    favoritesEmpty: "कुनै सेभ गरिएका सम्पत्ति छैन",
    favoritesEmptyDesc: "सम्पत्ति हेर्नुहोस् र मुटु आइकनमा थिच्नुहोस्",

    // Services
    servicesTitle: "निर्माण सेवाहरू",
    servicesSubtitle: "आफ्नो परियोजनाको लागि विशेषज्ञ खोज्नुहोस्",
    callNow: "अहिले फोन गर्नुहोस्",
    plumber: "प्लम्बर",
    brick_supplier: "ईंट आपूर्तिकर्ता",
    electrician: "इलेक्ट्रिसियन",
    cement_supplier: "सिमेन्ट आपूर्तिकर्ता",
    contractor: "ठेकेदार",
    hardware_store: "हार्डवेयर पसल",
    sand_gravel_supplier: "बालुवा र गिट्टी",
    tile_supplier: "टाइल आपूर्तिकर्ता",
    iron_supplier: "फलाम आपूर्तिकर्ता",
    interior_designer: "इन्टेरियर डिजाइनर",

    // Admin
    adminPanel: "प्रशासक प्यानल",
    pendingReview: "समीक्षाको लागि पर्खिरहेको",
    approve: "स्वीकृत गर्नुहोस्",
    reject: "अस्वीकार गर्नुहोस्",
    feature: "विशेष बनाउनुहोस्",
    unfeature: "विशेष हटाउनुहोस्",
    adminLogin: "प्रशासक लगिन",

    // About
    about: "हाम्रो बारेमा",
    mission: "हाम्रो लक्ष्य",
    vision: "हाम्रो दृष्टि",
    contactUs: "सम्पर्क गर्नुहोस्",

    // Map
    mapView: "नक्सा दृश्य",
    noPropertiesInArea: "यस क्षेत्रमा कुनै सम्पत्ति छैन",

    // Status
    pending: "पर्खिरहेको",
    approved: "स्वीकृत",
    rejected: "अस्वीकार",

    // General
    loading: "लोड हुँदैछ...",
    error: "केही गलत भयो",
    retry: "पुनः प्रयास",
    noResults: "कुनै नतिजा छैन",
    per_month: "/महिना",
    dhur: "धुर",
    npr: "NPR",
  },
};
