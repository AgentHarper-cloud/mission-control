"use client";

import { useState, useEffect } from "react";

interface DemoState {
  business: {
    name: string;
    niche: string;
    targetAudience: string;
    mainOffer: string;
  };
  metrics: {
    revenue: number;
    leads: number;
    adSpend: number;
    cpa: number;
    conversionRate: number;
  };
  agents: Array<{
    id: string;
    name: string;
    avatar: string;
    status: string;
    tasksCompleted: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
  activity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: "info" | "success" | "warning";
  }>;
}

const activityColors = {
  info: "#2F80FF",
  success: "#10B981",
  warning: "#F59E0B",
};

export default function CEODashboard({ businessData }: { businessData?: any }) {
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

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6B7186",
      }}>
        Loading dashboard...
      </div>
    );
  }

  const business = state?.business;
  const metrics = state?.metrics;
  const agents = state?.agents || [];
  const tasks = state?.tasks || [];
  const activity = state?.activity || [];

  const hasData = business?.name && business.name !== "Demo Business";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 24,
        padding: "24px",
        background: "linear-gradient(135deg, #111624, #0D1117)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#FF4EDB",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 8,
        }}>
          CEO DASHBOARD
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          {hasData ? business.name : "Your AI Business"}
        </h1>
        {hasData && (
          <p style={{
            color: "#8A8F98",
            margin: "8px 0 0",
            fontSize: 14,
          }}>
            {business.niche}
          </p>
        )}
      </div>

      {!hasData ? (
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>🚀</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
            textAlign: "center",
          }}>
            Ready to Build Your AI Business
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
            textAlign: "center",
            maxWidth: 400,
          }}>
            Go to the <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> tab and start building your business. Watch it populate across all dashboards in real-time.
          </div>
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}>
            <MetricCard
              label="Leads"
              value={metrics?.leads || 0}
              icon="👥"
              color="#2F80FF"
            />
            <MetricCard
              label="Agents Active"
              value={agents.filter(a => a.status !== "idle").length}
              icon="🤖"
              color="#7B61FF"
            />
            <MetricCard
              label="Tasks Done"
              value={tasks.filter(t => t.status === "done").length}
              icon="✅"
              color="#10B981"
            />
            <MetricCard
              label="In Progress"
              value={tasks.filter(t => t.status === "in-progress").length}
              icon="⚡"
              color="#F59E0B"
            />
            <MetricCard
              label="Conversion"
              value={`${metrics?.conversionRate || 0}%`}
              icon="📈"
              color="#FF4EDB"
            />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
          }}>
            {/* Activity Feed */}
            <div style={{
              background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              padding: 24,
              maxHeight: 500,
              overflow: "auto",
            }}>
              <h2 style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F5F7FA",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span>📡</span> Recent Activity
              </h2>
              
              {activity.length === 0 ? (
                <div style={{
                  color: "#6B7186",
                  fontSize: 14,
                  textAlign: "center",
                  padding: 40,
                }}>
                  No activity yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {activity.slice(0, 15).map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 14,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 10,
                        borderLeft: `3px solid ${activityColors[item.type]}`,
                      }}
                    >
                      <p style={{
                        color: "#F5F7FA",
                        fontSize: 14,
                        margin: 0,
                        lineHeight: 1.5,
                      }}>
                        {item.message}
                      </p>
                      <p style={{
                        color: "#6B7186",
                        fontSize: 11,
                        margin: "8px 0 0",
                        fontFamily: "'Orbitron', monospace",
                      }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Agents & Business Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Business Info */}
              <div style={{
                background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: 24,
              }}>
                <h2 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#F5F7FA",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span>🏢</span> Business Profile
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <InfoRow label="Target" value={business.targetAudience} />
                  <InfoRow label="Offer" value={business.mainOffer} />
                </div>
              </div>

              {/* AI Team Summary */}
              <div style={{
                background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                padding: 24,
              }}>
                <h2 style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#F5F7FA",
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span>🤖</span> AI Team
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: 10,
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: 8,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{agent.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#F5F7FA" }}>
                          {agent.name}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 10,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: agent.status === "active" ? "rgba(16,185,129,0.2)" : 
                                   agent.status === "working" ? "rgba(124,58,237,0.2)" : "rgba(100,116,139,0.2)",
                        color: agent.status === "active" ? "#10B981" : 
                               agent.status === "working" ? "#A78BFA" : "#94A3B8",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}>
                        {agent.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
          <div style={{ fontSize: 11, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#F5F7FA", lineHeight: 1.4 }}>
        {value || "Not set"}
      </div>
    </div>
  );
}
