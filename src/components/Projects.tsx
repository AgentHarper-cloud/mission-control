"use client";

import { useState, useEffect } from "react";

type TaskStatus = 'inbox' | 'up-next' | 'in-progress' | 'waiting-on-aaron' | 'in-review' | 'done' | 'backlog';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus | string;
  priority: TaskPriority | string;
  assigned_agent: string;
  created_at: string;
}

interface DemoState {
  tasks: Task[];
  business: { name: string };
}

const KANBAN_COLUMNS = [
  { id: 'inbox', title: 'Inbox', color: '#94A3B8' },
  { id: 'up-next', title: 'Up Next', color: '#00D9FF' },
  { id: 'in-progress', title: 'In Progress', color: '#E91E8C' },
  { id: 'done', title: 'Done', color: '#34D399' },
];

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: 'rgba(100,116,139,0.2)', text: '#94A3B8', border: '#64748B' },
  medium: { bg: 'rgba(59,130,246,0.2)', text: '#60A5FA', border: '#3B82F6' },
  high: { bg: 'rgba(249,115,22,0.2)', text: '#FB923C', border: '#F97316' },
  urgent: { bg: 'rgba(239,68,68,0.2)', text: '#F87171', border: '#EF4444' },
  critical: { bg: 'rgba(236,72,153,0.2)', text: '#F472B6', border: '#EC4899' },
};

export default function Projects({ businessData }: { businessData?: any }) {
  const [state, setState] = useState<DemoState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("/api/demo", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setState(data);
        }
      } catch (error) {
        console.error("Failed to fetch demo state:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const tasks = state?.tasks || [];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}>
        <div>
          <div style={{
            fontSize: 10,
            letterSpacing: 2,
            color: "#7B61FF",
            fontFamily: "'Orbitron', monospace",
            marginBottom: 4,
          }}>
            PROJECT MANAGEMENT
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#F5F7FA",
            margin: 0,
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            Tasks & Projects
          </h1>
        </div>
        <div style={{
          display: "flex",
          gap: 12,
        }}>
          <StatPill label="Total" value={tasks.length} />
          <StatPill label="In Progress" value={getTasksByStatus("in-progress").length} color="#E91E8C" />
          <StatPill label="Done" value={getTasksByStatus("done").length} color="#34D399" />
        </div>
      </div>

      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          color: "#6B7186",
        }}>
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <div style={{ color: "#F5F7FA", fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            No Tasks Yet
          </div>
          <div style={{ color: "#6B7186", fontSize: 14 }}>
            Start a business build from Live Demo to create tasks
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          alignItems: "flex-start",
        }}>
          {KANBAN_COLUMNS.map((column) => (
            <div key={column.id} style={{
              background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 400,
            }}>
              {/* Column header */}
              <div style={{
                padding: "16px 16px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: column.color,
                }} />
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#F5F7FA",
                }}>
                  {column.title}
                </span>
                <span style={{
                  fontSize: 11,
                  color: "#6B7186",
                  marginLeft: "auto",
                }}>
                  {getTasksByStatus(column.id).length}
                </span>
              </div>

              {/* Tasks */}
              <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                {getTasksByStatus(column.id).map((task) => (
                  <TaskCard key={task.id} task={task} columnColor={column.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, color = "#F5F7FA" }: { label: string; value: number; color?: string }) {
  return (
    <div style={{
      padding: "8px 16px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <span style={{ fontSize: 16, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 11, color: "#6B7186" }}>{label}</span>
    </div>
  );
}

function TaskCard({ task, columnColor }: { task: Task; columnColor: string }) {
  const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 8,
      padding: 12,
      borderLeft: `3px solid ${columnColor}`,
      cursor: "pointer",
      transition: "all 0.15s ease",
    }}>
      <div style={{
        fontSize: 13,
        fontWeight: 500,
        color: "#F5F7FA",
        marginBottom: 8,
        lineHeight: 1.4,
      }}>
        {task.title}
      </div>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{
          fontSize: 9,
          padding: "2px 6px",
          borderRadius: 4,
          background: priorityStyle.bg,
          color: priorityStyle.text,
          border: `1px solid ${priorityStyle.border}40`,
          textTransform: "uppercase",
          fontWeight: 600,
          letterSpacing: 0.5,
        }}>
          {task.priority}
        </span>

        {task.assigned_agent && (
          <span style={{
            fontSize: 10,
            color: "#6B7186",
          }}>
            → {task.assigned_agent}
          </span>
        )}
      </div>
    </div>
  );
}
