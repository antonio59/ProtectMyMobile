type MobileProvider = {
  id: string;
  name: string;
  colour: string;
  initial: string;
  emergencyContact: {
    uk: string;
    abroad?: string;
    available: string;
  };
  network: 'EE' | 'O2' | 'Three' | 'Vodafone'; // Host network
  website: string;
  steps: string[];
  additionalInfo?: string;
};

export const mobileProviders: MobileProvider[] = [
  // Main UK Mobile Networks
  {
    id: "ee",
    name: "EE",
    colour: "#1db954",
    initial: "E",
    emergencyContact: {
      uk: "+44 7953 966 250",
      available: "Available 24/7",
    },
    network: "EE",
    website: "https://ee.co.uk",
    steps: [
      "Call EE customer services to report your SIM stolen",
      "Request to block your SIM card immediately",
      "Ask for a replacement SIM card",
      "Change any account PIN codes or passwords",
      "Request that they make a note that your device was stolen",
    ],
    additionalInfo: "EE may ask for your account PIN or password, so have this ready if possible.",
  },
  {
    id: "o2",
    name: "O2",
    colour: "#0019a5",
    initial: "O",
    emergencyContact: {
      uk: "0344 809 0202",
      abroad: "+44 7860 980 202",
      available: "Available 8am-8pm, 7 days a week",
    },
    network: "O2",
    website: "https://o2.co.uk",
    steps: [
      "Call O2 customer services to report theft",
      "Provide your O2 phone number and account information",
      "Request an immediate block on your SIM card",
      "Change your My O2 account password",
      "Ask them to note that your device was stolen",
    ],
  },
  {
    id: "three",
    name: "Three",
    colour: "#4b0082",
    initial: "T",
    emergencyContact: {
      uk: "0333 338 1001",
      abroad: "+44 7782 333 333",
      available: "Available 8am-8pm weekdays, 8am-6pm weekends",
    },
    network: "Three",
    website: "https://three.co.uk",
    steps: [
      "Contact Three customer services immediately",
      "Report your SIM as stolen",
      "Ask them to block your SIM and number",
      "Change your My3 account password",
      "Request to protect your account with additional security",
    ],
  },
  {
    id: "vodafone",
    name: "Vodafone",
    colour: "#e60000",
    initial: "V",
    emergencyContact: {
      uk: "0333 304 0191",
      abroad: "+44 7836 191 191",
      available: "Available 24/7",
    },
    network: "Vodafone",
    website: "https://vodafone.co.uk",
    steps: [
      "Call Vodafone customer services immediately",
      "Report your SIM card as stolen",
      "Request an immediate block on your number",
      "Change your My Vodafone password",
      "Request extra security on your account",
    ],
    additionalInfo: "Vodafone can usually process a SIM block within minutes of your call.",
  },
  
  // EE MVNOs
  {
    id: "bt-mobile",
    name: "BT Mobile",
    colour: "#6400aa",
    initial: "B",
    emergencyContact: {
      uk: "0800 800 150",
      available: "Available 8am-9pm Mon-Fri, 8am-8pm weekends",
    },
    network: "EE",
    website: "https://bt.com/mobile",
    steps: [
      "Call BT customer services to report your SIM stolen",
      "Provide your phone number and account details",
      "Request to block your SIM card immediately",
      "Change your BT account password",
      "Ask for a replacement SIM",
    ],
  },
  {
    id: "plusnet-mobile",
    name: "Plusnet Mobile",
    colour: "#ff6b35",
    initial: "P",
    emergencyContact: {
      uk: "0800 079 1133",
      available: "Available 8am-8pm Mon-Fri, 9am-6pm weekends",
    },
    network: "EE",
    website: "https://plusnet.co.uk/mobile",
    steps: [
      "Call Plusnet Mobile customer services",
      "Report your SIM as stolen",
      "Ask for an immediate block on your number",
      "Change your Plusnet account password",
      "Request a replacement SIM card",
    ],
  },
  {
    id: "talktalk-mobile",
    name: "TalkTalk Mobile",
    colour: "#171920",
    initial: "T",
    emergencyContact: {
      uk: "0345 172 0088",
      available: "Available 8am-8pm Mon-Fri, 9am-6pm weekends",
    },
    network: "EE",
    website: "https://talktalk.co.uk/mobile",
    steps: [
      "Call TalkTalk customer services",
      "Report your SIM card as stolen",
      "Request an immediate block on your number",
      "Change your TalkTalk account password",
      "Request a new SIM card if needed",
    ],
  },
  {
    id: "utility-warehouse",
    name: "Utility Warehouse",
    colour: "#5D2D91",
    initial: "U",
    emergencyContact: {
      uk: "0333 777 0777",
      available: "Available 9am-5:30pm Mon-Fri, 9am-4:30pm Sat",
    },
    network: "EE",
    website: "https://utilitywarehouse.co.uk",
    steps: [
      "Contact Utility Warehouse customer services",
      "Report your SIM as stolen",
      "Request immediate suspension of your service",
      "Change your online account password",
      "Ask for additional account security",
    ],
  },
  {
    id: "1pmobile",
    name: "1pMobile",
    colour: "#eb3f3b",
    initial: "1",
    emergencyContact: {
      uk: "0333 220 1212",
      available: "Available 8am-8pm, 7 days a week",
    },
    network: "EE",
    website: "https://1pmobile.com",
    steps: [
      "Contact 1pMobile customer services",
      "Report your SIM as stolen",
      "Request immediate blocking of your SIM",
      "Change your online account password",
      "Get information about a replacement SIM",
    ],
  },
  
  // O2 MVNOs
  {
    id: "giffgaff",
    name: "Giffgaff",
    colour: "#FF6100",
    initial: "G",
    emergencyContact: {
      uk: "Online only - using another device",
      available: "Support via online account only",
    },
    network: "O2",
    website: "https://giffgaff.com",
    steps: [
      "Log into your giffgaff account on another device",
      "Go to 'My giffgaff' then 'Report lost or stolen'",
      "Follow the online steps to report your SIM stolen",
      "Change your giffgaff password",
      "Order a replacement SIM if needed",
    ],
    additionalInfo: "Giffgaff doesn't have a call centre - all support is provided online through your account or the community forums.",
  },
  {
    id: "tesco-mobile",
    name: "Tesco Mobile",
    colour: "#00539b",
    initial: "T",
    emergencyContact: {
      uk: "0345 301 4455",
      available: "Available 8am-9pm Mon-Fri, 8am-8pm weekends",
    },
    network: "O2",
    website: "https://tescomobile.com",
    steps: [
      "Call Tesco Mobile customer services",
      "Report your SIM card as stolen",
      "Request immediate deactivation of your SIM",
      "Change your Tesco Mobile password",
      "Order a replacement SIM if required",
    ],
  },
  {
    id: "sky-mobile",
    name: "Sky Mobile",
    colour: "#0072c9",
    initial: "S",
    emergencyContact: {
      uk: "0333 759 3949",
      available: "Available 8am-9pm, 7 days a week",
    },
    network: "O2",
    website: "https://sky.com/shop/mobile",
    steps: [
      "Call Sky Mobile customer services",
      "Report your SIM as stolen",
      "Request to suspend your service immediately",
      "Change your Sky ID password",
      "Discuss options for replacing your SIM",
    ],
  },
  
  // Three MVNOs
  {
    id: "id-mobile",
    name: "iD Mobile",
    colour: "#ea047e",
    initial: "i",
    emergencyContact: {
      uk: "0333 003 7777",
      available: "Available 8am-8pm Mon-Fri, 9am-6pm weekends",
    },
    network: "Three",
    website: "https://idmobile.co.uk",
    steps: [
      "Call iD Mobile customer services",
      "Report your SIM card as stolen",
      "Ask for an immediate network block",
      "Change your iD Mobile account password",
      "Request a replacement SIM card",
    ],
  },
  {
    id: "smarty",
    name: "SMARTY",
    colour: "#028843",
    initial: "S",
    emergencyContact: {
      uk: "Online only - web chat",
      available: "Available 8am-8pm daily via web chat",
    },
    network: "Three",
    website: "https://smarty.co.uk",
    steps: [
      "Log into your SMARTY account on another device",
      "Contact support via web chat",
      "Report your SIM as stolen and request blocking",
      "Change your SMARTY account password",
      "Follow their instructions for a replacement SIM",
    ],
    additionalInfo: "SMARTY primarily offers support through web chat, accessible through your online account.",
  },
  {
    id: "superdrug-mobile",
    name: "Superdrug Mobile",
    colour: "#d50032",
    initial: "S",
    emergencyContact: {
      uk: "0345 671 9777",
      available: "Available 9am-6pm Mon-Fri, 9am-5pm Sat",
    },
    network: "Three",
    website: "https://superdrugmobile.com",
    steps: [
      "Call Superdrug Mobile customer service",
      "Report your SIM as stolen",
      "Request immediate deactivation of your SIM",
      "Change your account password",
      "Ask about a replacement SIM",
    ],
  },
  
  // Vodafone MVNOs
  {
    id: "voxi",
    name: "VOXI",
    colour: "#2D70F7",
    initial: "V",
    emergencyContact: {
      uk: "Online only - web chat",
      available: "Available 8am-9pm, 7 days a week via web chat",
    },
    network: "Vodafone",
    website: "https://voxi.co.uk",
    steps: [
      "Log into your VOXI account on another device",
      "Contact support through web chat",
      "Report your SIM card as stolen",
      "Request immediate suspension of your service",
      "Change your VOXI account password",
    ],
    additionalInfo: "VOXI is a digital-first service offering support primarily through web chat and social media.",
  },
  {
    id: "lebara",
    name: "Lebara Mobile",
    colour: "#F1485D",
    initial: "L",
    emergencyContact: {
      uk: "0207 031 0791",
      available: "Available 8am-9pm Mon-Fri, 10am-6pm weekends",
    },
    network: "Vodafone",
    website: "https://lebara.co.uk",
    steps: [
      "Call Lebara customer services",
      "Report your SIM as stolen",
      "Request immediate blocking of your number",
      "Change your Lebara account password",
      "Ask about getting a replacement SIM",
    ],
  },
  {
    id: "asda-mobile",
    name: "ASDA Mobile",
    colour: "#78BE20",
    initial: "A",
    emergencyContact: {
      uk: "0800 079 2732",
      available: "Available 8am-8pm Mon-Fri, 9am-6pm weekends",
    },
    network: "Vodafone",
    website: "https://mobile.asda.com",
    steps: [
      "Call ASDA Mobile customer services",
      "Report your SIM card as stolen",
      "Request to block your SIM immediately",
      "Change your ASDA mobile account password",
      "Discuss options for a replacement SIM",
    ],
  },
];