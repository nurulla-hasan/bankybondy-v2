export const CACHE_TAGS = {
  ME: "me",
  USERS: "users",
  SERVICES: "services",
  SURVEYORS: "surveyors",
  SURVEYOR: (id: string) => `surveyor-${id}`,
  SURVEYOR_PROFILE: "surveyor-profile",
  CALCULATIONS: "calculations",
  REVIEWS: "reviews",
  PLANS: "plans",
  SUBSCRIBERS: "subscribers",
  BROADCASTS: "broadcasts",
  DISTRICTS: "districts",
  APP_CONFIG: "app-config",
} as const;

export const CACHE_TIME = {
  FIVE_MINUTES: 300,
  HOUR: 3600,
  DAY: 86400,
} as const;