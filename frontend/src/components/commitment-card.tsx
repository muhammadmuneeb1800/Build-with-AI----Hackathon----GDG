// import type { Commitment } from '../api'
// import { PRIORITY_COPY, STATUS_COPY } from '../constants'
// import { PriorityBadge } from './priority-badge'
// import { StatusPill } from './status-pill'

// interface CommitmentCardProps {
//   commitment: Commitment
//   onToggleStatus: (commitmentId: string, currentStatus: Commitment['status']) => void
// }

// function formatDeadline(deadline: string | null) {
//   if (!deadline) {
//     return 'No deadline detected'
//   }

//   return new Intl.DateTimeFormat('en', {
//     dateStyle: 'medium',
//     timeStyle: 'short',
//   }).format(new Date(deadline))
// }

// export function CommitmentCard({ commitment, onToggleStatus }: CommitmentCardProps) {
//   return (
//     <article className="commitment-card">
//       <div className="commitment-topline">
//         <div>
//           <h3 className="commitment-title">{commitment.task}</h3>
//           <div className="section-caption">{commitment.content}</div>
//         </div>
//         <PriorityBadge priority={commitment.priority} />
//       </div>

//       <div className="commitment-meta">
//         <StatusPill status={commitment.status} />
//         <span>{STATUS_COPY[commitment.status]}</span>
//         <span>{PRIORITY_COPY[commitment.priority]}</span>
//         <span>{formatDeadline(commitment.deadline)}</span>
//         <button className="button button-ghost" type="button" onClick={() => onToggleStatus(commitment.id, commitment.status)}>
//           {commitment.status === 'done' ? 'Reopen' : 'Mark done'}
//         </button>
//       </div>
//     </article>
//   )
// }

import type { Commitment } from "../api";
import { PRIORITY_COPY, STATUS_COPY } from "../constants";
import { PriorityBadge } from "./priority-badge";
import { StatusPill } from "./status-pill";

interface CommitmentCardProps {
  commitment: Commitment;
  onToggleStatus: (
    commitmentId: string,
    currentStatus: Commitment["status"],
    action_text?: string | null,
  ) => void;
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return "No deadline detected";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(deadline));
}

export function CommitmentCard({
  commitment,
  onToggleStatus,
}: CommitmentCardProps) {
  const isDone = commitment.status === "done";
  const actionText = commitment.actions[0]?.action_text;

  return (
    <article
      className={[
        "group flex flex-col gap-3 p-4 rounded-xl",
        "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
        "hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface)]",
        "hover:shadow-[var(--shadow-sm)]",
        "transition-all duration-200",
        isDone ? "opacity-55" : "",
      ].join(" ")}
    >
      {/* Top row: title + priority badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <h3
            className={[
              "text-[13px] font-semibold leading-snug text-[var(--text-primary)] m-0",
              isDone ? "line-through text-[var(--text-muted)]" : "",
            ].join(" ")}
          >
            {commitment.task}
          </h3>
          {commitment.content && (
            <p className="text-[12px] text-[var(--text-muted)] leading-relaxed m-0 line-clamp-2">
              {commitment.content}
            </p>
          )}
        </div>
        <PriorityBadge priority={commitment.priority} />
      </div>

      {/* Action hint */}
      {actionText && (
        <div
          className="
          text-[12px] text-[var(--text-secondary)] leading-relaxed
          px-3 py-2 rounded-md
          bg-[var(--bg-base)] border-l-2 border-[var(--accent-soft)]
        "
        >
          {actionText}
        </div>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={commitment.status} />

        <span className="text-[11px] text-[var(--text-muted)]">
          {STATUS_COPY[commitment.status]}
        </span>

        <span className="text-[var(--border-strong)] text-[11px]">·</span>

        <span className="text-[11px] text-[var(--text-muted)]">
          {PRIORITY_COPY[commitment.priority]}
        </span>

        <span className="text-[var(--border-strong)] text-[11px]">·</span>

        <span className="text-[11px] text-[var(--text-muted)]">
          {formatDeadline(commitment.deadline)}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Toggle button */}
        <button
          type="button"
          onClick={() => onToggleStatus(commitment.id, commitment.status)}
          className={[
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md",
            "text-[11px] font-semibold border cursor-pointer",
            "transition-all duration-150",
            isDone
              ? "border-[var(--border-strong)] text-[var(--text-muted)] bg-transparent hover:bg-[var(--bg-subtle)]"
              : "border-[var(--accent-soft)] text-[var(--accent)] bg-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)]",
          ].join(" ")}
        >
          {isDone ? (
            <>
              <span className="text-[10px]">↩</span> Reopen
            </>
          ) : (
            <>
              <span className="text-[10px]">✓</span> Mark done
            </>
          )}
        </button>
      </div>
    </article>
  );
}
