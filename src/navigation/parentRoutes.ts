import type { Href } from "expo-router";

export const parentRoutes = {
  index: null,
  home: null,
  "+not-found": "/",
  login: "/",
  "2fa": "/login",
  recover: "/login",
  code: "/recover",
  redefine: "/recover",
  notices: "/home",
  "notices/[id]": "/notices",
  "create-notice": "/notices",
  meetings: "/home",
  "meetings/[id]": "/meetings",
  "create-meeting": "/meetings",
  complaints: "/home",
  "complaints/[id]": "/complaints",
  "create-complaint": "/complaints",
  "party-saloon": "/home",
  "party-saloon/[id]": "/party-saloon",
  "create-party-saloon-reservation": "/party-saloon",
  moving: "/home",
  "moving/[id]": "/moving",
  "create-moving-reservation": "/moving",
  deliveries: "/home",
  "deliveries/[id]": "/deliveries",
  "create-delivery": "/deliveries",
  residents: "/home",
  "residents/[id]": "/residents",
  "residents/import": "/residents",
  register: "/residents",
  entrance: "/home",
  "register-porter": "/entrance",
  reports: "/home",
  messages: "/home",
  "messages/[id]": "/messages",
  "contact-manager": "/home",
  chatbot: "/home",
  "support/[id]": "/chatbot",
} as const satisfies Record<string, Href | null>;

export function parentForScreen(name: string) {
  return Object.prototype.hasOwnProperty.call(parentRoutes, name)
    ? parentRoutes[name as keyof typeof parentRoutes]
    : null;
}
