import type { ReactNode } from "react";

export type TaskPriority = "high" | "medium" | "low";
export type PromotionTarget = "task" | "project" | "campaign";
export type TodayTask = {
  id: string;
  title: string;
  completed: boolean;
  priority?: TaskPriority;
  assignee?: { id: string; label: string };
  dueLabel?: string;
  category?: string;
};

export type TodayTaskCardProps = {
  tasks: TodayTask[];
  title?: string;
  loading?: boolean;
  error?: string;
  onToggle: (id: string, nextCompleted: boolean) => void;
  onAssign?: (id: string) => void;
  onPromote?: (id: string, target: PromotionTarget) => void;
  onAdd?: () => void;
  footer?: ReactNode;
};

/** Controlled, backend-agnostic task queue. All mutations are callbacks. */
export function TodayTaskCard({
  tasks, title = "Today", loading = false, error, onToggle,
  onAssign, onPromote, onAdd, footer,
}: TodayTaskCardProps) {
  const open = tasks.filter((task) => !task.completed).length;
  return (
    <section className="pcl-today" aria-label={title} aria-busy={loading}>
      <header className="pcl-today__head">
        <div><span className="pcl-today__eyebrow">YOUR PRIORITIES</span><h2>{title}</h2></div>
        <span className="pcl-today__count" aria-label={open + " tasks remaining"}>{open} open</span>
      </header>
      {error ? <div className="pcl-today__error" role="alert">{error}</div> : null}
      {loading ? <p className="pcl-today__notice" role="status">Loading tasks…</p> :
        tasks.length === 0 ? <p className="pcl-today__notice">Nothing on your list yet.</p> :
        <ul className="pcl-today__list">
          {tasks.map((task) => (
            <li className={"pcl-task" + (task.completed ? " pcl-task--done" : "")} key={task.id}>
              <label className="pcl-task__main">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(event) => onToggle(task.id, event.currentTarget.checked)}
                />
                <span className="pcl-task__body">
                  <span className="pcl-task__title">{task.title}</span>
                  <span className="pcl-task__meta">
                    {task.priority && <span className={"pcl-priority pcl-priority--" + task.priority}>{task.priority} priority</span>}
                    {task.category && <span>{task.category}</span>}
                    {task.dueLabel && <span>Due {task.dueLabel}</span>}
                    {task.assignee && <span>Assigned: {task.assignee.label}</span>}
                  </span>
                </span>
              </label>
              <div className="pcl-task__actions">
                {onAssign && <button type="button" onClick={() => onAssign(task.id)} aria-label={"Assign " + task.title}>Assign</button>}
                {onPromote && <details className="pcl-task__promote">
                  <summary aria-label={"Promote " + task.title}>Promote</summary>
                  <div className="pcl-task__promotion-choices">
                    {(["task", "project", "campaign"] as const).map((target) =>
                      <button type="button" key={target} onClick={() => onPromote(task.id, target)}>To {target}</button>)}
                  </div>
                </details>}
              </div>
            </li>
          ))}
        </ul>}
      {(onAdd || footer) && <footer className="pcl-today__footer">
        {onAdd && <button className="pcl-today__add" type="button" onClick={onAdd}>+ Add to-do</button>}
        {footer}
      </footer>}
    </section>
  );
}
