import { appRoutes } from '../navigation/route'

export const APP_NAME = 'Founder Decision Engine'
export const APP_TAGLINE = 'Autopilot AI for founder commitments'

export const NAV_ITEMS = [
	{
		label: 'Dashboard',
		description: 'Commitments, risks, and priorities',
		href: appRoutes.dashboard,
		icon: 'dashboard',
	},
	{
		label: 'Add commitment',
		description: 'Capture a new founder input',
		href: appRoutes.add,
		icon: 'add',
	},
	{
		label: 'Integrations',
		description: 'Connect and manage external tools',
		href: appRoutes.integrations,
		icon: 'integrations',
	},
	{
		label: 'Profile',
		description: 'AI preferences and notifications',
		href: appRoutes.profile,
		icon: 'profile',
	},
] as const

export const PRIORITY_COPY = {
	high: 'High priority',
	medium: 'Medium priority',
	low: 'Low priority',
} as const

export const STATUS_COPY = {
	pending: 'Pending',
	done: 'Done',
	missed: 'Missed',
} as const

export const SAMPLE_INPUT = 'Follow up with investor tomorrow and send the updated MRR summary by noon.'
