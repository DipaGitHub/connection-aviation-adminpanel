# Aviation Admin Panel

An enterprise-grade, modern administrative dashboard for managing the Aviation platform, built using **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Radix UI**, **Recharts**, and **Tiptap Editor**.

---

## 📌 Features

- **Executive Analytics Dashboard**: Overview of charter enquiries, website traffic metrics, recent customer bookings, and performance charts.
- **Hero & Content Management**: Live controls for customizing home page hero banners, headlines, sub-text, and media assets.
- **Service Catalog Management**: Add, update, and manage private jet options, helicopter charter packages, and VIP travel services.
- **Enquiry & Booking Manager**: View, filter, export, and respond to charter flight enquiries and customer requests.
- **Rich Text Blog & News Editor**: Integrated **Tiptap** WYSIWYG editor for publishing blog posts, press releases, and industry news updates.
- **Interactive FAQ & Testimonials Manager**: Manage general FAQs, service FAQs, and client feedback.
- **AI Support Chat logs**: Monitor chatbot inquiries and customer communication history.
- **Responsive & Dark Mode UI**: Full dark/light theme switching with smooth UI components powered by Radix UI primitives.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI & Components**: React 19, Tailwind CSS v4, Radix UI Primitives, Lucide Icons
- **Rich Text Editor**: Tiptap Editor
- **Forms & Validation**: React Hook Form, Zod
- **Charts & Data Visualization**: Recharts
- **State & Theme Management**: Next Themes
- **Language**: TypeScript

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.x or higher)
- **pnpm** / **npm** / **yarn**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<username>/connection-aviation-adminpanel.git
   cd connection-aviation-adminpanel
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Environment Setup:
   Create `.env.local` in the root folder:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   ```

4. Run the Development Server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   Open `http://localhost:3000` (or `http://localhost:3001`) in your browser.

5. Build for Production:
   ```bash
   npm run build
   npm run start
   ```

---

## 📂 Project Structure

```
connection-aviation-adminpanel/
├── app/
│   ├── admin/
│   │   ├── about/            # About page CMS
│   │   ├── blogpage/         # Blog management
│   │   ├── chat/             # Chatbot logs & management
│   │   ├── enquery/          # Customer enquiries manager
│   │   ├── faqs/             # FAQ management
│   │   ├── hero/             # Hero banner CMS
│   │   ├── history/          # Company history timeline
│   │   ├── newspage/         # News & articles CMS
│   │   ├── services/         # Services catalog CMS
│   │   └── testimonials/     # Testimonials CMS
│   ├── globals.css           # Styling rules & Tailwind imports
│   └── layout.tsx            # Main root layout
├── components/               # Reusable UI components & Radix wrappers
├── hooks/                    # Custom React hooks
├── lib/                      # Helper functions and API utilities
└── public/                   # Static assets & icons
```

---

## 🔒 Security & Privacy

This repository contains the administrative portal logic for Aviation Braventra. Access is restricted to authorized personnel only.
