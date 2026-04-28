export const appRoutes = {
	dashboard: '/dashboard',
	add: '/add',
	integrations: '/settings/integrations',
	profile: '/settings/profile',
} as const

export type AppRoute = (typeof appRoutes)[keyof typeof appRoutes]
