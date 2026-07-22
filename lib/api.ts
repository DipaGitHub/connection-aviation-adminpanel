const isProd = process.env.NODE_ENV === 'production';
const envApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const HOST_URL = isProd
  ? "https://aviation.braventra.in"
  : envApiUrl.replace(/\/api\/?$/, '');

export const API_BASE_URL = HOST_URL;
export const API_BASE_PATH = `${API_BASE_URL}/api`;

export const API = {
  hero: `${API_BASE_PATH}/hero`,
  services: `${API_BASE_PATH}/services`,
  faqs: `${API_BASE_PATH}/faqs`,
  about: `${API_BASE_PATH}/about`,
  blogs: `${API_BASE_PATH}/blogs`,
  testimonials: `${API_BASE_PATH}/testimonials`,
  enquiries: `${API_BASE_PATH}/enquiries`,
  helicopterEnquiries: `${API_BASE_PATH}/helicopter-enquiries`,
  templates: `${API_BASE_PATH}/templates`,
  news: `${API_BASE_PATH}/news`,
  serviceFaqs: `${API_BASE_PATH}/service-faqs`,
  history: `${API_BASE_PATH}/history`,

  // --- Chatbot: PUBLIC (used by the website chat widget) ---
  chatbotPublicTopics: `${API_BASE_PATH}/chatbot/topics`, // GET active topics for the widget
  chatbotSubmitLead: `${API_BASE_PATH}/chatbot/leads`,    // POST captured lead + transcript

  // --- Chatbot: ADMIN (used by /admin panel) ---
  chatbotLeads: `${API_BASE_PATH}/chatbot/admin/leads`,   // GET all leads
  chatbotTopics: `${API_BASE_PATH}/chatbot/admin/topics`, // GET/POST topics
  chatbotTopicById: (id: number | string) => `${API_BASE_PATH}/chatbot/admin/topics/${id}`, // PUT/DELETE
};