/**
 * Admin SOP Guide — how to use every function in the Admin Dashboard.
 * Edit this file to update the SOP index shown at /admin/sop.
 */

export type SopEntry = {
  id: string;
  title: string;
  path: string;
  group: string;
  superOnly?: boolean;
  purpose: string;
  steps: string[];
  tips?: string[];
};

export const SOP_GROUPS = [
  "Getting Started",
  "Orders & Payments",
  "Menu & Specials",
  "Customers",
  "Website Content",
  "Administration",
] as const;

export const ADMIN_SOP_GUIDE: SopEntry[] = [
  {
    id: "login",
    title: "Logging In & Roles",
    path: "/admin/login",
    group: "Getting Started",
    purpose:
      "Sign in to the admin dashboard. Access is limited to active accounts in the admin users list.",
    steps: [
      "Go to /admin/login and enter your admin email and password.",
      "If prompted, set a new password before continuing.",
      "Check the role badge in the sidebar: SUPER ADMIN sees every section, ADMIN sees day-to-day sections only.",
      "Use Sign Out in the sidebar when you finish — this ends the session on that device.",
    ],
    tips: [
      "Locked out? A Super Admin can force-set your password from Admin Users.",
      "Denied access shows an Event ID — copy it when reporting a problem.",
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard Overview",
    path: "/admin",
    group: "Getting Started",
    purpose: "See live counts for active orders, reviews awaiting approval, catering requests, and active specials.",
    steps: [
      "Open Dashboard from the top of the sidebar.",
      "Review each stat card; click through to the matching section for detail.",
      "Start every shift here to spot anything needing attention.",
    ],
  },
  {
    id: "orders",
    title: "Orders",
    path: "/admin/orders",
    group: "Orders & Payments",
    purpose: "View, progress, and fulfill customer orders for pickup and delivery.",
    steps: [
      "Open Orders and select an order to expand its items, totals, and customer details.",
      "Confirm the payment status (paid online vs. awaiting manual payment).",
      "Update the status as the order moves: Confirmed → Preparing → Ready → Completed.",
      "Use Print Ticket to send the order to the kitchen.",
      "Cancel only if the customer requests it or the order cannot be fulfilled.",
    ],
    tips: ["Manual payment orders stay unpaid until you confirm the money was received."],
  },
  {
    id: "payments",
    title: "Payment Settings",
    path: "/admin/payments",
    group: "Orders & Payments",
    superOnly: true,
    purpose: "Control which payment options customers see and how fees and thresholds are applied.",
    steps: [
      "Open Payment Settings (Super Admin only).",
      "Review delivery fee and free-delivery threshold so they match the checkout summary.",
      "Enable or disable payment options for the storefront.",
      "Save, then place a small test order to confirm the totals.",
    ],
  },
  {
    id: "payment-connectors",
    title: "Payment Connectors",
    path: "/admin/payment-connectors",
    group: "Orders & Payments",
    superOnly: true,
    purpose:
      "Activate and monitor payment providers (Stripe, Square, PayPal, manual methods) without exposing any keys in the browser.",
    steps: [
      "Open Payment Connectors and pick a provider card.",
      "Use Settings to set the provider status and public configuration.",
      "Click Test Connector to run the diagnostic checks (enabled state, secrets, config, webhooks, methods).",
      "Turn on Run nightly and pick a UTC hour to have the checks run automatically, or use Run all now.",
      "Enable individual payment methods (Apple Pay, Zelle, Cash App, Pay at Pickup, etc.) once a provider passes.",
    ],
    tips: ["A provider with missing backend secrets stays disabled at checkout — nothing can charge a customer."],
  },
  {
    id: "menu",
    title: "Menu Manager",
    path: "/admin/menu",
    group: "Menu & Specials",
    purpose: "Add, edit, price, and hide menu items shown on the public menu and in online ordering.",
    steps: [
      "Open Menu Manager and search or filter to the item.",
      "Edit name, description, category, and prices (including the second size/price when used).",
      "Upload or drag-and-drop a photo in the image uploader.",
      "Use the toggles: Sold Out, Popular, Online Ordering Enabled, Active.",
      "Save — the public menu updates immediately.",
    ],
    tips: ["Mark items Sold Out instead of deleting them so they return with one click."],
  },
  {
    id: "categories",
    title: "Categories",
    path: "/admin/categories",
    group: "Menu & Specials",
    purpose: "Organize the menu into sections and control their order and visibility.",
    steps: [
      "Open Categories and add or rename a section.",
      "Set the display order to control where it appears on the public menu.",
      "Add a category image or description if you want it featured.",
      "Deactivate a category to hide it and everything in it.",
    ],
  },
  {
    id: "storage",
    title: "Storage / Images",
    path: "/admin/storage",
    group: "Menu & Specials",
    purpose: "Browse, upload, and replace the images used across the site.",
    steps: [
      "Open Storage / Images and choose the bucket you need.",
      "Drag a JPG, PNG, or WEBP onto the uploader (5 MB max) or click to browse.",
      "Copy the image URL to reuse it elsewhere, or replace an existing file to update it everywhere.",
    ],
  },
  {
    id: "specials",
    title: "Specials",
    path: "/admin/specials",
    group: "Menu & Specials",
    purpose: "Run the Special of the Day and limited-time offers.",
    steps: [
      "Open Specials and create or edit a special with name, price, and photo.",
      "Set the active dates and toggle it on.",
      "Turn off the special when it ends so it leaves the homepage and menu.",
    ],
  },
  {
    id: "lunch-specials",
    title: "Lunch Specials",
    path: "/admin/lunch-specials",
    group: "Menu & Specials",
    purpose: "Manage weekday lunch pricing and the items included.",
    steps: [
      "Open Lunch Specials and set the days and serving window.",
      "Add or remove included items and set the lunch price.",
      "Save and verify the lunch section on the public menu.",
    ],
  },
  {
    id: "holiday-calendar",
    title: "Holiday Calendar",
    path: "/admin/holiday-calendar",
    group: "Menu & Specials",
    purpose: "Publish holiday hours, closures, and holiday menus.",
    steps: [
      "Open Holiday Calendar and add a date with a label (Closed, Limited Hours, Holiday Menu).",
      "Add any notes customers should see.",
      "Save — the notice appears on the site for that date range.",
    ],
  },
  {
    id: "catering",
    title: "Catering Requests",
    path: "/admin/catering",
    group: "Customers",
    purpose: "Work through catering inquiries submitted from the website.",
    steps: [
      "Open Catering Requests and read the event details (date, headcount, menu interest).",
      "Contact the customer using the phone or email on the request.",
      "Update the request status as you quote, confirm, or close it.",
    ],
  },
  {
    id: "reviews",
    title: "Reviews & Photo Wall",
    path: "/admin/reviews",
    group: "Customers",
    purpose: "Moderate customer reviews and the customer photo wall.",
    steps: [
      "Open Reviews and read anything pending.",
      "Approve to publish, hide to keep it off the site, or delete spam.",
      "Review uploaded customer photos the same way before they appear publicly.",
    ],
  },
  {
    id: "contact",
    title: "Contact Messages",
    path: "/admin/contact",
    group: "Customers",
    purpose: "Read and clear messages sent through the contact form.",
    steps: [
      "Open Contact and read new messages.",
      "Reply from Support@Asmokingque.com.",
      "Mark handled messages so the queue stays clean.",
    ],
  },
  {
    id: "homepage",
    title: "Homepage Editor",
    path: "/admin/homepage",
    group: "Website Content",
    purpose: "Edit the homepage hero, sections, and featured content.",
    steps: [
      "Open Homepage Editor and select the section to change.",
      "Update headings, body text, buttons, and images.",
      "Toggle a section off to hide it without deleting the content.",
      "Save, then open the public homepage to confirm.",
    ],
  },
  {
    id: "service-area",
    title: "Service Area",
    path: "/admin/service-area",
    group: "Website Content",
    purpose: "Define the delivery and catering areas shown to customers.",
    steps: [
      "Open Service Area and add or edit a city/zone entry.",
      "Set any notes such as minimums or delivery windows.",
      "Save and check the service area section on the public site.",
    ],
  },
  {
    id: "content",
    title: "Site Content",
    path: "/admin/content",
    group: "Website Content",
    superOnly: true,
    purpose: "Edit global site text, labels, and theme values through the content tree.",
    steps: [
      "Open Site Content (Super Admin only).",
      "Expand the tree to the value you want to change and edit it in place.",
      "Save the override — it replaces the default value from the code.",
      "Reset an override to fall back to the built-in default.",
    ],
  },
  {
    id: "settings",
    title: "Business Settings",
    path: "/admin/settings",
    group: "Administration",
    purpose: "Set hours, contact details, ordering toggles, and other store-wide options.",
    steps: [
      "Open Business Settings.",
      "Update hours, phone, address, and email.",
      "Toggle online ordering, pickup, and delivery availability.",
      "Save — changes apply across the site and checkout right away.",
    ],
  },
  {
    id: "users",
    title: "Admin Users",
    path: "/admin/users",
    group: "Administration",
    superOnly: true,
    purpose: "Invite admins, assign roles, disable access, and reset passwords.",
    steps: [
      "Open Admin Users (Super Admin only).",
      "Invite a new admin by email and choose Admin or Super Admin.",
      "Toggle Active off to immediately block someone's access.",
      "Use Set Password to force a new password without sending a reset email.",
    ],
    tips: ["You cannot disable or demote your own account — ask another Super Admin."],
  },
  {
    id: "sop",
    title: "Website SOP",
    path: "/admin/sop",
    group: "Administration",
    purpose: "This page: the searchable how-to index plus the downloadable SOP PDF.",
    steps: [
      "Search the index below for the function you need.",
      "Expand a topic to see its step-by-step instructions and open the page directly.",
      "Upload or replace the SOP PDF to keep the printable training guide current.",
    ],
  },
  {
    id: "daily-open",
    title: "Daily Opening Checklist",
    path: "/admin",
    group: "Getting Started",
    purpose: "Start-of-day routine before taking orders.",
    steps: [
      "Sign in and review Dashboard counts.",
      "Clear any overnight orders in Orders.",
      "Confirm today's specials and lunch specials are active.",
      "Mark anything you're out of as Sold Out in Menu Manager.",
      "Confirm pickup and delivery toggles in Business Settings.",
    ],
  },
  {
    id: "daily-close",
    title: "Daily Closing Checklist",
    path: "/admin/orders",
    group: "Getting Started",
    purpose: "End-of-day routine.",
    steps: [
      "Complete or cancel any remaining open orders.",
      "Verify manual payments were received and marked paid.",
      "Turn off expired specials.",
      "Clear Sold Out flags for items restocking tomorrow.",
      "Approve or hide any pending reviews and photos.",
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting Common Issues",
    path: "/admin",
    group: "Administration",
    purpose: "Quick fixes for the problems that come up most often.",
    steps: [
      "Item missing from the site: check Active, Online Ordering, and that its category is active.",
      "Checkout shows no payment options: run Test Connector in Payment Connectors.",
      "Totals look wrong: compare the delivery fee and free-delivery threshold in Payment Settings.",
      "Can't sign in: have a Super Admin confirm your account is Active and reset your password.",
      "Changes not showing: hard-refresh the public page before reporting an issue.",
    ],
  },
];
