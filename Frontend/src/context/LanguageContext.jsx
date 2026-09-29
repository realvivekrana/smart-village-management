import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import extraTranslations from "./extraTranslations";

/*
|--------------------------------------------------------------------------
| Language Context
|--------------------------------------------------------------------------
| Village application ke liye:
|
| Hindi / English language switch
|
| Future me:
| - Voice
| - Regional languages
| - SMS translations
| - Notification translations
|
| bhi isi context ke through manage kiye ja sakte hain.
|--------------------------------------------------------------------------
*/

const LanguageContext =
  createContext(null);

/*
|--------------------------------------------------------------------------
| Supported Languages
|--------------------------------------------------------------------------
*/

export const LANGUAGES = {
  ENGLISH: "en",
  HINDI: "hi",
};

/*
|--------------------------------------------------------------------------
| Translation Dictionary
|--------------------------------------------------------------------------
*/

const translations = {
  en: {
    /*
    |--------------------------------------------------------------------------
    | Common
    |--------------------------------------------------------------------------
    */

    common: {
      appName:
        "Kakarcholi Village Management",

      village:
        "Kakarcholi",

      home: "Home",

      dashboard:
        "Dashboard",

      profile: "Profile",

      settings:
        "Settings",

      admin: "Admin",

      citizen: "Citizen",

      public: "Public",

      search: "Search",

      submit: "Submit",

      save: "Save",

      update: "Update",

      delete: "Delete",

      edit: "Edit",

      view: "View",

      cancel: "Cancel",

      close: "Close",

      back: "Back",

      next: "Next",

      previous: "Previous",

      loading: "Loading...",

      refresh: "Refresh",

      retry: "Retry",

      yes: "Yes",

      no: "No",

      active: "Active",

      inactive: "Inactive",

      published:
        "Published",

      draft: "Draft",

      required:
        "Required",

      optional:
        "Optional",

      status: "Status",

      date: "Date",

      time: "Time",

      phone: "Phone",

      email: "Email",

      address:
        "Address",

      name: "Name",

      description:
        "Description",

      details:
        "Details",

      noData:
        "No data available",

      noResults:
        "No results found",

      success:
        "Operation completed successfully.",

      error:
        "Something went wrong.",

      confirm:
        "Are you sure?",

      yesProceed:
        "Yes, proceed",

      download:
        "Download",

      upload:
        "Upload",

      select:
        "Select",

      all: "All",

      filter:
        "Filter",

      clear:
        "Clear",

      apply:
        "Apply",
    },

    /*
    |--------------------------------------------------------------------------
    | Navigation
    |--------------------------------------------------------------------------
    */

    navigation: {
      home:
        "Home",

      village:
        "Our Village",

      services:
        "Village Services",

      schemes:
        "Government Schemes",

      farmers:
        "Farmer Services",

      health:
        "Health",

      education:
        "Education",

      jobs:
        "Jobs & Employment",

      gramSabha:
        "Gram Sabha",

      complaints:
        "Complaints",

      emergency:
        "Emergency SOS",

      directory:
        "Village Directory",

      notices:
        "Notices",

      events:
        "Events",

      contact:
        "Contact",

      profile:
        "My Profile",

      household:
        "My Household",

      applications:
        "My Applications",

      admin:
        "Admin Panel",
    },

    /*
    |--------------------------------------------------------------------------
    | Village Services
    |--------------------------------------------------------------------------
    */

    services: {
      title:
        "Village Services",

      subtitle:
        "Access important government and village services from one place.",

      governmentSchemes:
        "Government Schemes",

      emergencySOS:
        "Emergency SOS",

      gramSabha:
        "Gram Sabha",

      billsTaxes:
        "Bills & Taxes",

      farmerServices:
        "Farmer Services",

      healthServices:
        "Health Services",

      education:
        "Education",

      villageDirectory:
        "Village Directory",

      transport:
        "Transport",

      lostFound:
        "Lost & Found",

      buySell:
        "Buy & Sell",

      volunteer:
        "Volunteer",

      skillTraining:
        "Skill Training",

      animalHealth:
        "Animal Health",

      vaccination:
        "Vaccination",

      viewDetails:
        "View Details",

      applyNow:
        "Apply Now",

      checkStatus:
        "Check Status",

      learnMore:
        "Learn More",
    },

    /*
    |--------------------------------------------------------------------------
    | Government Schemes
    |--------------------------------------------------------------------------
    */

    schemes: {
      title:
        "Government Schemes",

      subtitle:
        "Find schemes, check eligibility and track your applications.",

      eligibility:
        "Eligibility",

      requiredDocuments:
        "Required Documents",

      applicationProcess:
        "Application Process",

      applicationStatus:
        "Application Status",

      apply:
        "Apply for Scheme",

      track:
        "Track Application",

      pmAwas:
        "PM Awas Yojana",

      ujjwala:
        "Ujjwala Yojana",

      ayushman:
        "Ayushman Bharat",

      kisanSamman:
        "PM Kisan Samman Nidhi",

      pension:
        "Pension",

      scholarship:
        "Scholarship",

      noSchemes:
        "No schemes available.",
    },

    /*
    |--------------------------------------------------------------------------
    | Farmer
    |--------------------------------------------------------------------------
    */

    farmer: {
      title:
        "Farmer Services",

      mandiBhav:
        "Mandi Prices",

      weather:
        "Weather",

      cropAdvice:
        "Crop Advice",

      equipmentRental:
        "Equipment Rental",

      fertilizerSeed:
        "Fertilizer & Seed Availability",

      tractor:
        "Tractor",

      thresher:
        "Thresher",

      pump:
        "Water Pump",

      rent:
        "Rent",

      available:
        "Available",

      unavailable:
        "Unavailable",

      price:
        "Price",

      crop:
        "Crop",

      market:
        "Market",

      updatedAt:
        "Updated At",
    },

    /*
    |--------------------------------------------------------------------------
    | Emergency
    |--------------------------------------------------------------------------
    */

    emergency: {
      title:
        "Emergency SOS",

      subtitle:
        "Use SOS only during a real emergency.",

      sos:
        "SEND SOS",

      sending:
        "Sending SOS...",

      sent:
        "SOS Alert Sent",

      alertSent:
        "Your emergency alert has been sent to the village administration.",

      location:
        "Current Location",

      locationRequired:
        "Location permission is required for accurate emergency response.",

      police:
        "Police",

      ambulance:
        "Ambulance",

      fire:
        "Fire Brigade",

      call:
        "Call",

      emergencyContacts:
        "Emergency Contacts",

      activeAlerts:
        "Active Alerts",

      resolved:
        "Resolved",

      acknowledged:
        "Acknowledged",

      responding:
        "Responding",

      cancelSOS:
        "Cancel SOS",

      confirmSOS:
        "Are you sure you want to send an emergency SOS?",

      falseAlert:
        "Please do not misuse the emergency service.",
    },

    /*
    |--------------------------------------------------------------------------
    | Gram Sabha
    |--------------------------------------------------------------------------
    */

    gramSabha: {
      title:
        "Gram Sabha",

      meetings:
        "Meetings",

      meetingDate:
        "Meeting Date",

      agenda:
        "Agenda",

      attend:
        "I will attend",

      notAttend:
        "I will not attend",

      attendance:
        "Attendance",

      minutes:
        "Meeting Minutes",

      viewMinutes:
        "View Minutes",

      downloadMinutes:
        "Download Minutes",

      upcoming:
        "Upcoming Meetings",

      past:
        "Past Meetings",
    },

    /*
    |--------------------------------------------------------------------------
    | Bills & Taxes
    |--------------------------------------------------------------------------
    */

    bills: {
      title:
        "Bills & Taxes",

      propertyTax:
        "Property Tax",

      waterBill:
        "Water Bill",

      electricityBill:
        "Electricity Bill",

      pending:
        "Pending",

      paid:
        "Paid",

      overdue:
        "Overdue",

      amount:
        "Amount",

      dueDate:
        "Due Date",

      billNumber:
        "Bill Number",

      paymentStatus:
        "Payment Status",

      viewBill:
        "View Bill",
    },

    /*
    |--------------------------------------------------------------------------
    | Household
    |--------------------------------------------------------------------------
    */

    household: {
      title:
        "My Household",

      familyMembers:
        "Family Members",

      addMember:
        "Add Family Member",

      editMember:
        "Edit Family Member",

      removeMember:
        "Remove Member",

      relationship:
        "Relationship",

      dateOfBirth:
        "Date of Birth",

      gender:
        "Gender",

      aadhaar:
        "Aadhaar Number",

      occupation:
        "Occupation",

      education:
        "Education",

      documents:
        "Documents",

      saveHousehold:
        "Save Household",

      householdDetails:
        "Household Details",

      reuseDetails:
        "Use saved family details in government forms.",
    },

    /*
    |--------------------------------------------------------------------------
    | Health
    |--------------------------------------------------------------------------
    */

    health: {
      title:
        "Health Services",

      camps:
        "Health Camps",

      vaccination:
        "Vaccination",

      vaccinationReminder:
        "Vaccination Reminder",

      doctor:
        "Doctor",

      date:
        "Camp Date",

      location:
        "Camp Location",

      register:
        "Register",

      reminder:
        "Set Reminder",

      upcoming:
        "Upcoming Health Camps",
    },

    /*
    |--------------------------------------------------------------------------
    | Animal / Dairy
    |--------------------------------------------------------------------------
    */

    animal: {
      title:
        "Animal Health & Dairy",

      veterinary:
        "Veterinary Doctor",

      dairy:
        "Dairy",

      milkCollection:
        "Milk Collection",

      animalCamp:
        "Animal Health Camp",

      animalType:
        "Animal Type",

      quantity:
        "Quantity",

      collectionDate:
        "Collection Date",

      milkRate:
        "Milk Rate",
    },

    /*
    |--------------------------------------------------------------------------
    | Education
    |--------------------------------------------------------------------------
    */

    education: {
      title:
        "Education",

      scholarships:
        "Scholarships",

      exams:
        "Exam Alerts",

      results:
        "Results",

      deadline:
        "Last Date",

      apply:
        "Apply",

      skillTraining:
        "Skill Training",

      computer:
        "Computer Training",

      tailoring:
        "Tailoring",

      drone:
        "Drone Training",

      enroll:
        "Enroll Now",
    },

    /*
    |--------------------------------------------------------------------------
    | Directory
    |--------------------------------------------------------------------------
    */

    directory: {
      title:
        "Village Directory",

      doctor:
        "Doctor",

      teacher:
        "Teacher",

      mason:
        "Mason",

      electrician:
        "Electrician",

      driver:
        "Driver",

      farmer:
        "Farmer",

      shopkeeper:
        "Shopkeeper",

      contact:
        "Contact",

      call:
        "Call",
    },

    /*
    |--------------------------------------------------------------------------
    | Complaints
    |--------------------------------------------------------------------------
    */

    complaints: {
      title:
        "Complaints",

      newComplaint:
        "New Complaint",

      complaintTitle:
        "Complaint Title",

      complaintDetails:
        "Complaint Details",

      category:
        "Category",

      submit:
        "Submit Complaint",

      track:
        "Track Complaint",

      support:
        "Support",

      votes:
        "Support Count",

      priority:
        "Priority",

      status:
        "Complaint Status",
    },

    /*
    |--------------------------------------------------------------------------
    | Volunteer
    |--------------------------------------------------------------------------
    */

    volunteer: {
      title:
        "Volunteer & Shramdaan",

      cleanVillage:
        "Village Cleanliness",

      plantation:
        "Tree Plantation",

      register:
        "Register as Volunteer",

      participants:
        "Participants",

      join:
        "Join Activity",

      activityDate:
        "Activity Date",
    },

    /*
    |--------------------------------------------------------------------------
    | Transport
    |--------------------------------------------------------------------------
    */

    transport: {
      title:
        "Transport Timetable",

      bus:
        "Bus",

      tempo:
        "Tempo",

      route:
        "Route",

      departure:
        "Departure",

      arrival:
        "Arrival",

      timing:
        "Timing",
    },

    /*
    |--------------------------------------------------------------------------
    | Lost & Found
    |--------------------------------------------------------------------------
    */

    lostFound: {
      title:
        "Lost & Found",

      lost:
        "Lost Item",

      found:
        "Found Item",

      reportLost:
        "Report Lost Item",

      reportFound:
        "Report Found Item",

      itemName:
        "Item Name",

      location:
        "Last Seen Location",

      contactOwner:
        "Contact Owner",
    },

    /*
    |--------------------------------------------------------------------------
    | Buy / Sell
    |--------------------------------------------------------------------------
    */

    marketplace: {
      title:
        "Buy & Sell",

      buy:
        "Buy",

      sell:
        "Sell",

      item:
        "Item",

      price:
        "Price",

      seller:
        "Seller",

      contactSeller:
        "Contact Seller",

      postItem:
        "Post Item",
    },

    /*
    |--------------------------------------------------------------------------
    | Voice
    |--------------------------------------------------------------------------
    */

    voice: {
      start:
        "Start Voice Input",

      stop:
        "Stop Voice Input",

      listening:
        "Listening...",

      notSupported:
        "Voice input is not supported by this browser.",

      permissionDenied:
        "Microphone permission was denied.",

      speakNow:
        "Please speak now.",
    },

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    notifications: {
      title:
        "Notifications",

      noNotifications:
        "No notifications.",

      markRead:
        "Mark as Read",

      markAllRead:
        "Mark All as Read",

      sms:
        "SMS Notification",

      whatsapp:
        "WhatsApp Notification",

      applicationUpdate:
        "Application Status Updated",

      complaintUpdate:
        "Complaint Status Updated",
    },

    /*
    |--------------------------------------------------------------------------
    | Offline / PWA
    |--------------------------------------------------------------------------
    */

    offline: {
      offline:
        "You are currently offline.",

      online:
        "You are back online.",

      cached:
        "Some information may be from cached data.",

      retry:
        "Retry when connection is available.",
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Hindi
  |--------------------------------------------------------------------------
  */

  hi: {
    common: {
      appName:
        "ककरचोली ग्राम प्रबंधन",

      village:
        "ककरचोली",

      home:
        "होम",

      dashboard:
        "डैशबोर्ड",

      profile:
        "प्रोफ़ाइल",

      settings:
        "सेटिंग्स",

      admin:
        "एडमिन",

      citizen:
        "नागरिक",

      public:
        "सार्वजनिक",

      search:
        "खोजें",

      submit:
        "जमा करें",

      save:
        "सेव करें",

      update:
        "अपडेट करें",

      delete:
        "डिलीट करें",

      edit:
        "संपादित करें",

      view:
        "देखें",

      cancel:
        "रद्द करें",

      close:
        "बंद करें",

      back:
        "वापस",

      next:
        "आगे",

      previous:
        "पिछला",

      loading:
        "लोड हो रहा है...",

      refresh:
        "रिफ्रेश करें",

      retry:
        "फिर से कोशिश करें",

      yes:
        "हाँ",

      no:
        "नहीं",

      active:
        "सक्रिय",

      inactive:
        "निष्क्रिय",

      published:
        "प्रकाशित",

      draft:
        "ड्राफ्ट",

      required:
        "जरूरी",

      optional:
        "वैकल्पिक",

      status:
        "स्थिति",

      date:
        "तारीख",

      time:
        "समय",

      phone:
        "फोन",

      email:
        "ईमेल",

      address:
        "पता",

      name:
        "नाम",

      description:
        "विवरण",

      details:
        "जानकारी",

      noData:
        "कोई जानकारी उपलब्ध नहीं है",

      noResults:
        "कोई परिणाम नहीं मिला",

      success:
        "कार्य सफलतापूर्वक पूरा हुआ।",

      error:
        "कुछ गलत हो गया।",

      confirm:
        "क्या आप निश्चित हैं?",

      yesProceed:
        "हाँ, आगे बढ़ें",

      download:
        "डाउनलोड करें",

      upload:
        "अपलोड करें",

      select:
        "चुनें",

      all:
        "सभी",

      filter:
        "फ़िल्टर",

      clear:
        "साफ़ करें",

      apply:
        "लागू करें",
    },

    navigation: {
      home:
        "होम",

      village:
        "हमारा गाँव",

      services:
        "गाँव की सेवाएँ",

      schemes:
        "सरकारी योजनाएँ",

      farmers:
        "किसान सेवाएँ",

      health:
        "स्वास्थ्य",

      education:
        "शिक्षा",

      jobs:
        "नौकरी और रोजगार",

      gramSabha:
        "ग्राम सभा",

      complaints:
        "शिकायतें",

      emergency:
        "आपातकालीन SOS",

      directory:
        "गाँव की निर्देशिका",

      notices:
        "सूचनाएँ",

      events:
        "कार्यक्रम",

      contact:
        "संपर्क",

      profile:
        "मेरी प्रोफ़ाइल",

      household:
        "मेरा परिवार",

      applications:
        "मेरे आवेदन",

      admin:
        "एडमिन पैनल",
    },

    services: {
      title:
        "गाँव की सेवाएँ",

      subtitle:
        "सरकारी और गाँव की महत्वपूर्ण सेवाओं का उपयोग एक ही जगह से करें।",

      governmentSchemes:
        "सरकारी योजनाएँ",

      emergencySOS:
        "आपातकालीन SOS",

      gramSabha:
        "ग्राम सभा",

      billsTaxes:
        "बिल और टैक्स",

      farmerServices:
        "किसान सेवाएँ",

      healthServices:
        "स्वास्थ्य सेवाएँ",

      education:
        "शिक्षा",

      villageDirectory:
        "गाँव की निर्देशिका",

      transport:
        "परिवहन",

      lostFound:
        "खोया-पाया",

      buySell:
        "खरीदें और बेचें",

      volunteer:
        "स्वयंसेवक",

      skillTraining:
        "कौशल प्रशिक्षण",

      animalHealth:
        "पशु स्वास्थ्य",

      vaccination:
        "टीकाकरण",

      viewDetails:
        "विवरण देखें",

      applyNow:
        "अभी आवेदन करें",

      checkStatus:
        "स्थिति देखें",

      learnMore:
        "और जानें",
    },

    schemes: {
      title:
        "सरकारी योजनाएँ",

      subtitle:
        "योजनाएँ खोजें, पात्रता देखें और अपने आवेदन की स्थिति जानें।",

      eligibility:
        "पात्रता",

      requiredDocuments:
        "जरूरी दस्तावेज़",

      applicationProcess:
        "आवेदन प्रक्रिया",

      applicationStatus:
        "आवेदन की स्थिति",

      apply:
        "योजना के लिए आवेदन करें",

      track:
        "आवेदन ट्रैक करें",

      pmAwas:
        "प्रधानमंत्री आवास योजना",

      ujjwala:
        "उज्ज्वला योजना",

      ayushman:
        "आयुष्मान भारत",

      kisanSamman:
        "पीएम किसान सम्मान निधि",

      pension:
        "पेंशन",

      scholarship:
        "छात्रवृत्ति",

      noSchemes:
        "कोई योजना उपलब्ध नहीं है।",
    },

    farmer: {
      title:
        "किसान सेवाएँ",

      mandiBhav:
        "मंडी भाव",

      weather:
        "मौसम",

      cropAdvice:
        "फसल सलाह",

      equipmentRental:
        "कृषि मशीन किराया",

      fertilizerSeed:
        "खाद और बीज उपलब्धता",

      tractor:
        "ट्रैक्टर",

      thresher:
        "थ्रेशर",

      pump:
        "पंप",

      rent:
        "किराया",

      available:
        "उपलब्ध",

      unavailable:
        "उपलब्ध नहीं",

      price:
        "कीमत",

      crop:
        "फसल",

      market:
        "मंडी",

      updatedAt:
        "अपडेट का समय",
    },

    emergency: {
      title:
        "आपातकालीन SOS",

      subtitle:
        "SOS का उपयोग केवल वास्तविक आपातकाल में करें।",

      sos:
        "SOS भेजें",

      sending:
        "SOS भेजा जा रहा है...",

      sent:
        "SOS अलर्ट भेज दिया गया",

      alertSent:
        "आपका आपातकालीन अलर्ट ग्राम प्रशासन को भेज दिया गया है।",

      location:
        "वर्तमान स्थान",

      locationRequired:
        "सही आपातकालीन सहायता के लिए लोकेशन की अनुमति जरूरी है।",

      police:
        "पुलिस",

      ambulance:
        "एम्बुलेंस",

      fire:
        "फायर ब्रिगेड",

      call:
        "कॉल करें",

      emergencyContacts:
        "आपातकालीन संपर्क",

      activeAlerts:
        "सक्रिय अलर्ट",

      resolved:
        "समाधान हो गया",

      acknowledged:
        "देख लिया गया",

      responding:
        "सहायता भेजी जा रही है",

      cancelSOS:
        "SOS रद्द करें",

      confirmSOS:
        "क्या आप आपातकालीन SOS भेजना चाहते हैं?",

      falseAlert:
        "कृपया आपातकालीन सेवा का गलत उपयोग न करें।",
    },

    gramSabha: {
      title:
        "ग्राम सभा",

      meetings:
        "बैठकें",

      meetingDate:
        "बैठक की तारीख",

      agenda:
        "एजेंडा",

      attend:
        "मैं शामिल होऊँगा",

      notAttend:
        "मैं शामिल नहीं होऊँगा",

      attendance:
        "उपस्थिति",

      minutes:
        "बैठक का विवरण",

      viewMinutes:
        "विवरण देखें",

      downloadMinutes:
        "विवरण डाउनलोड करें",

      upcoming:
        "आने वाली बैठकें",

      past:
        "पिछली बैठकें",
    },

    bills: {
      title:
        "बिल और टैक्स",

      propertyTax:
        "घर का टैक्स",

      waterBill:
        "पानी का बिल",

      electricityBill:
        "बिजली का बिल",

      pending:
        "बाकी",

      paid:
        "भुगतान किया गया",

      overdue:
        "समय सीमा पार",

      amount:
        "राशि",

      dueDate:
        "अंतिम तारीख",

      billNumber:
        "बिल नंबर",

      paymentStatus:
        "भुगतान की स्थिति",

      viewBill:
        "बिल देखें",
    },

    household: {
      title:
        "मेरा परिवार",

      familyMembers:
        "परिवार के सदस्य",

      addMember:
        "परिवार का सदस्य जोड़ें",

      editMember:
        "परिवार के सदस्य को संपादित करें",

      removeMember:
        "सदस्य हटाएँ",

      relationship:
        "रिश्ता",

      dateOfBirth:
        "जन्म तारीख",

      gender:
        "लिंग",

      aadhaar:
        "आधार नंबर",

      occupation:
        "व्यवसाय",

      education:
        "शिक्षा",

      documents:
        "दस्तावेज़",

      saveHousehold:
        "परिवार की जानकारी सेव करें",

      householdDetails:
        "परिवार की जानकारी",

      reuseDetails:
        "सरकारी फॉर्म में सेव की गई परिवार की जानकारी का उपयोग करें।",
    },

    health: {
      title:
        "स्वास्थ्य सेवाएँ",

      camps:
        "स्वास्थ्य शिविर",

      vaccination:
        "टीकाकरण",

      vaccinationReminder:
        "टीकाकरण रिमाइंडर",

      doctor:
        "डॉक्टर",

      date:
        "शिविर की तारीख",

      location:
        "शिविर का स्थान",

      register:
        "पंजीकरण करें",

      reminder:
        "रिमाइंडर लगाएँ",

      upcoming:
        "आने वाले स्वास्थ्य शिविर",
    },

    animal: {
      title:
        "पशु स्वास्थ्य और डेयरी",

      veterinary:
        "पशु डॉक्टर",

      dairy:
        "डेयरी",

      milkCollection:
        "दूध संग्रह",

      animalCamp:
        "पशु स्वास्थ्य शिविर",

      animalType:
        "पशु का प्रकार",

      quantity:
        "मात्रा",

      collectionDate:
        "संग्रह की तारीख",

      milkRate:
        "दूध का भाव",
    },

    education: {
      title:
        "शिक्षा",

      scholarships:
        "छात्रवृत्ति",

      exams:
        "परीक्षा अलर्ट",

      results:
        "परिणाम",

      deadline:
        "अंतिम तारीख",

      apply:
        "आवेदन करें",

      skillTraining:
        "कौशल प्रशिक्षण",

      computer:
        "कंप्यूटर प्रशिक्षण",

      tailoring:
        "सिलाई प्रशिक्षण",

      drone:
        "ड्रोन प्रशिक्षण",

      enroll:
        "अभी नामांकन करें",
    },

    directory: {
      title:
        "गाँव की निर्देशिका",

      doctor:
        "डॉक्टर",

      teacher:
        "शिक्षक",

      mason:
        "मिस्त्री",

      electrician:
        "इलेक्ट्रीशियन",

      driver:
        "ड्राइवर",

      farmer:
        "किसान",

      shopkeeper:
        "दुकानदार",

      contact:
        "संपर्क",

      call:
        "कॉल करें",
    },

    complaints: {
      title:
        "शिकायतें",

      newComplaint:
        "नई शिकायत",

      complaintTitle:
        "शिकायत का शीर्षक",

      complaintDetails:
        "शिकायत का विवरण",

      category:
        "श्रेणी",

      submit:
        "शिकायत जमा करें",

      track:
        "शिकायत ट्रैक करें",

      support:
        "समर्थन",

      votes:
        "समर्थन की संख्या",

      priority:
        "प्राथमिकता",

      status:
        "शिकायत की स्थिति",
    },

    volunteer: {
      title:
        "स्वयंसेवक और श्रमदान",

      cleanVillage:
        "गाँव की सफाई",

      plantation:
        "वृक्षारोपण",

      register:
        "स्वयंसेवक के रूप में पंजीकरण करें",

      participants:
        "प्रतिभागी",

      join:
        "गतिविधि में शामिल हों",

      activityDate:
        "गतिविधि की तारीख",
    },

    transport: {
      title:
        "परिवहन समय सारणी",

      bus:
        "बस",

      tempo:
        "टेम्पो",

      route:
        "मार्ग",

      departure:
        "प्रस्थान",

      arrival:
        "पहुंचने का समय",

      timing:
        "समय",
    },

    lostFound: {
      title:
        "खोया-पाया",

      lost:
        "खोई हुई वस्तु",

      found:
        "मिली हुई वस्तु",

      reportLost:
        "खोई वस्तु की जानकारी दें",

      reportFound:
        "मिली वस्तु की जानकारी दें",

      itemName:
        "वस्तु का नाम",

      location:
        "आखिरी बार कहाँ देखी गई",

      contactOwner:
        "मालिक से संपर्क करें",
    },

    marketplace: {
      title:
        "खरीदें और बेचें",

      buy:
        "खरीदें",

      sell:
        "बेचें",

      item:
        "वस्तु",

      price:
        "कीमत",

      seller:
        "विक्रेता",

      contactSeller:
        "विक्रेता से संपर्क करें",

      postItem:
        "वस्तु पोस्ट करें",
    },

    voice: {
      start:
        "आवाज़ से इनपुट शुरू करें",

      stop:
        "आवाज़ इनपुट बंद करें",

      listening:
        "सुन रहा है...",

      notSupported:
        "इस ब्राउज़र में आवाज़ से इनपुट उपलब्ध नहीं है।",

      permissionDenied:
        "माइक्रोफोन की अनुमति नहीं दी गई।",

      speakNow:
        "अब बोलें।",
    },

    notifications: {
      title:
        "सूचनाएँ",

      noNotifications:
        "कोई सूचना नहीं है।",

      markRead:
        "पढ़ा हुआ करें",

      markAllRead:
        "सभी को पढ़ा हुआ करें",

      sms:
        "SMS सूचना",

      whatsapp:
        "WhatsApp सूचना",

      applicationUpdate:
        "आवेदन की स्थिति अपडेट हुई",

      complaintUpdate:
        "शिकायत की स्थिति अपडेट हुई",
    },

    offline: {
      offline:
        "आप अभी ऑफलाइन हैं।",

      online:
        "आप फिर से ऑनलाइन हैं।",

      cached:
        "कुछ जानकारी कैश से दिखाई जा सकती है।",

      retry:
        "कनेक्शन उपलब्ध होने पर फिर कोशिश करें।",
    },
  },
};

/*
| Merge extra translations (nav, layout, sidebar, auth, complaint form...)
| into the main dictionary. Existing keys are kept; new keys are added.
*/
const deepMerge = (target, source) => {
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      target[key] = deepMerge(target[key] || {}, value);
    } else if (target[key] === undefined) {
      target[key] = value;
    }
  });
  return target;
};

deepMerge(translations.en, extraTranslations.en);
deepMerge(translations.hi, extraTranslations.hi);

const interpolate = (text, vars) => {
  if (typeof text !== "string" || !vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    vars[name] !== undefined ? vars[name] : match
  );
};


/*
|--------------------------------------------------------------------------
| Deep Translation Helper
|--------------------------------------------------------------------------
*/

function getNestedValue(
  object,
  path
) {
  return path
    .split(".")
    .reduce(
      (current, key) =>
        current?.[key],
      object
    );
}

/*
|--------------------------------------------------------------------------
| Language Provider
|--------------------------------------------------------------------------
*/

export function LanguageProvider({
  children,
}) {
  const getInitialLanguage =
    () => {
      try {
        const savedLanguage =
          localStorage.getItem(
            "village_language"
          );

        if (
          savedLanguage ===
            LANGUAGES.ENGLISH ||
          savedLanguage ===
            LANGUAGES.HINDI
        ) {
          return savedLanguage;
        }
      } catch (error) {
        console.warn(
          "Unable to read saved language:",
          error
        );
      }

      return LANGUAGES.ENGLISH;
    };

  const [
    language,
    setLanguageState,
  ] = useState(
    getInitialLanguage
  );

  /*
   * --------------------------------------------------------------
   * Save language
   * --------------------------------------------------------------
   */

  useEffect(() => {
    try {
      localStorage.setItem(
        "village_language",
        language
      );
    } catch (error) {
      console.warn(
        "Unable to save language:",
        error
      );
    }

    /*
     * HTML language attribute
     */
    document.documentElement.lang =
      language ===
      LANGUAGES.HINDI
        ? "hi"
        : "en";

    /*
     * Helpful for CSS / styling if needed.
     */
    document.documentElement.dataset.language =
      language;
  }, [language]);

  /*
   * --------------------------------------------------------------
   * Change language
   * --------------------------------------------------------------
   */

  const setLanguage =
    useCallback(
      (newLanguage) => {
        if (
          newLanguage !==
            LANGUAGES.ENGLISH &&
          newLanguage !==
            LANGUAGES.HINDI
        ) {
          console.warn(
            `Unsupported language: ${newLanguage}`
          );

          return;
        }

        setLanguageState(
          newLanguage
        );
      },
      []
    );

  /*
   * --------------------------------------------------------------
   * Toggle language
   * --------------------------------------------------------------
   */

  const toggleLanguage =
    useCallback(() => {
      setLanguageState(
        (current) =>
          current ===
          LANGUAGES.ENGLISH
            ? LANGUAGES.HINDI
            : LANGUAGES.ENGLISH
      );
    }, []);

  /*
   * --------------------------------------------------------------
   * Translation function
   * --------------------------------------------------------------
   *
   * Usage:
   *
   * t("common.save")
   * t("navigation.home")
   *
   */

  const t = useCallback(
    (
      key,
      fallback = "",
      vars
    ) => {
      const currentDictionary =
        translations[
          language
        ];

      const value =
        getNestedValue(
          currentDictionary,
          key
        );

      /*
       * Current language mein value
       */
      if (
        value !== undefined &&
        value !== null
      ) {
        return interpolate(value, vars);
      }

      /*
       * Agar Hindi translation missing
       * hai to English fallback.
       */
      const englishValue =
        getNestedValue(
          translations.en,
          key
        );

      if (
        englishValue !==
          undefined &&
        englishValue !== null
      ) {
        return interpolate(englishValue, vars);
      }

      /*
       * Final fallback
       */
      return interpolate(
        fallback ||
        key,
        vars
      );
    },
    [language]
  );

  /*
   * --------------------------------------------------------------
   * Check current language
   * --------------------------------------------------------------
   */

  const isHindi =
    language ===
    LANGUAGES.HINDI;

  const isEnglish =
    language ===
    LANGUAGES.ENGLISH;

  /*
   * --------------------------------------------------------------
   * Context value
   * --------------------------------------------------------------
   */

  const value =
    useMemo(
      () => ({
        language,

        setLanguage,

        toggleLanguage,

        t,

        isHindi,

        isEnglish,

        languages:
          LANGUAGES,
      }),
      [
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi,
        isEnglish,
      ]
    );

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/*
|--------------------------------------------------------------------------
| useLanguage Hook
|--------------------------------------------------------------------------
*/

export function useLanguage() {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider."
    );
  }

  return context;
}

/*
|--------------------------------------------------------------------------
| Export Context
|--------------------------------------------------------------------------
*/

export default LanguageContext;