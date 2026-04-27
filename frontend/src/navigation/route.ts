export const appRoutes = {
	dashboard: '/dashboard',
	add: '/add',
} as const

export type AppRoute = (typeof appRoutes)[keyof typeof appRoutes]
