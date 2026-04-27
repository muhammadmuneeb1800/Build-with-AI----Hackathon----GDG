import { axiosInstance } from '../utils/axiosInstance'
import { API_ENDPOINTS } from './endpoint'

export type Priority = 'low' | 'medium' | 'high'
export type CommitmentStatus = 'pending' | 'done' | 'missed'

export interface ActionItem {
	id: string
	commitment_id: string
	action_text: string
	status: string
	created_at: string
}

export interface Commitment {
	id: string
	content: string
	task: string
	deadline: string | null
	priority: Priority
	status: CommitmentStatus
	created_at: string
	actions: ActionItem[]
}

export interface RiskItem {
	commitment_id: string
	task: string
	reason: string
	priority: Priority
	deadline: string | null
	action_text: string
}

export interface RiskResponse {
	overdue: RiskItem[]
	high_priority_pending: RiskItem[]
	generated_at: string
}

export interface DailyBriefResponse {
	top_priorities: string[]
	risks: string[]
	suggested_actions: string[]
	generated_at: string
}

export interface AddCommitmentPayload {
	text: string
}

export interface StatusUpdatePayload {
	status: CommitmentStatus
}

export async function fetchCommitments() {
	const response = await axiosInstance.get<Commitment[]>(API_ENDPOINTS.commitments)
	return response.data
}

export async function fetchRisks() {
	const response = await axiosInstance.get<RiskResponse>(API_ENDPOINTS.risks)
	return response.data
}

export async function fetchDailyBrief() {
	const response = await axiosInstance.get<DailyBriefResponse>(API_ENDPOINTS.dailyBrief)
	return response.data
}

export async function addCommitment(payload: AddCommitmentPayload) {
	const response = await axiosInstance.post<Commitment>(API_ENDPOINTS.addCommitment, payload)
	return response.data
}

export async function updateCommitmentStatus(commitmentId: string, payload: StatusUpdatePayload) {
	const response = await axiosInstance.patch<Commitment>(
		`${API_ENDPOINTS.commitments}/${commitmentId}/status`,
		payload,
	)
	return response.data
}
