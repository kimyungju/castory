export const sidebarLinks = [
  {
    route: "/",
    label: "Home",
    imgURL: "/icons/home.svg",
  },
  {
    route: "/discover",
    label: "Discover",
    imgURL: "/icons/discover.svg",
  },
  {
    route: "/create-podcast",
    label: "Create Podcast",
    imgURL: "/icons/microphone.svg",
  },
  {
    route: "/create-news-podcast",
    label: "News Podcast",
    imgURL: "/icons/newspaper.svg",
  },
  {
    route: "/profile",
    label: "Profile",
    imgURL: "/icons/profile.svg",
  },
];

export const voiceCategories = ["alloy", "shimmer", "nova", "echo", "fable", "onyx"];

export const newsTopics = [
  { value: "technology", label: "Technology", icon: "Cpu" },
  { value: "sports", label: "Sports", icon: "Trophy" },
  { value: "business", label: "Business", icon: "TrendingUp" },
  { value: "science", label: "Science", icon: "FlaskConical" },
  { value: "health", label: "Health", icon: "Heart" },
  { value: "entertainment", label: "Entertainment", icon: "Film" },
  { value: "politics", label: "Politics", icon: "Landmark" },
  { value: "world", label: "World", icon: "Globe" },
] as const;

export const scriptTones = [
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "analytical", label: "Analytical" },
] as const;

export const scriptDurations = [
  { value: "short", label: "Short (~2 min)" },
  { value: "medium", label: "Medium (~5 min)" },
  { value: "long", label: "Long (~10 min)" },
] as const;

