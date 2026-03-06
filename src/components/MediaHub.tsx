"use client";

import { useState, useEffect } from "react";

interface DemoState {
  business: {
    name: string;
    niche: string;
    mainOffer: string;
  };
  agents: Array<{
    id: string;
    name: string;
    avatar: string;
    role: string;
    status: string;
    tasksCompleted: number;
  }>;
  activity: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: string;
  }>;
}

export default function MediaHub({ businessData }: { businessData?: any }) {
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

  const hasData = state?.business?.name && state.business.name !== "Demo Business";
  const agents = state?.agents || [];
  const activity = state?.activity || [];

  // Find content/outreach agent
  const contentAgent = agents.find(a => a.role?.toLowerCase().includes("content") || a.id === "outreach");

  // Generate content items from activity
  const contentItems = activity
    .filter(a => a.message.includes("📧") || a.message.includes("email") || a.message.includes("CAMPAIGN"))
    .slice(0, 6)
    .map((a, i) => ({
      id: a.id,
      type: a.message.includes("CAMPAIGN") ? "campaign" : "email",
      title: a.message.replace(/^[^\s]+\s/, ""),
      status: "sent",
      timestamp: a.timestamp,
    }));

  const channels = [
    { name: "Email", icon: "📧", count: contentItems.filter(c => c.type === "email").length, color: "#2F80FF" },
    { name: "Campaigns", icon: "🚀", count: contentItems.filter(c => c.type === "campaign").length, color: "#FF4EDB" },
    { name: "LinkedIn", icon: "💼", count: 0, color: "#0A66C2" },
    { name: "Twitter", icon: "🐦", count: 0, color: "#1DA1F2" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#FF4EDB",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 4,
        }}>
          MEDIA HUB
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Content & Campaigns
        </h1>
      </div>

      {loading ? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          color: "#6B7186",
        }}>
          Loading media data...
        </div>
      ) : !hasData ? (
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>🎬</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Media Content Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
          }}>
            Start a business build to see your content
          </div>
        </div>
      ) : (
        <>
          {/* Channel Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}>
            {channels.map((channel) => (
              <div
                key={channel.name}
                style={{
                  background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 20,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{channel.icon}</span>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: channel.color }}>{channel.count}</div>
                    <div style={{ fontSize: 11, color: "#6B7186", textTransform: "uppercase" }}>{channel.name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Content Agent */}
          {contentAgent && (
            <div style={{
              background: "linear-gradient(135deg, #7B61FF20, #7B61FF10)",
              borderRadius: 16,
              border: "1px solid #7B61FF40",
              padding: 24,
              marginBottom: 24,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}>
                <span style={{ fontSize: 40 }}>{contentAgent.avatar}</span>
                <div>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#F5F7FA",
                  }}>
                    {contentAgent.name} - {contentAgent.role}
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: "#A78BFA",
                    marginTop: 4,
                  }}>
                    {contentAgent.tasksCompleted} tasks completed • Status: {contentAgent.status}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Content */}
          <div style={{
            background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 24,
          }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#F5F7FA",
              marginBottom: 20,
            }}>
              📬 Recent Outreach
            </h2>
            {contentItems.length === 0 ? (
              <div style={{
                color: "#6B7186",
                fontSize: 14,
                textAlign: "center",
                padding: 40,
              }}>
                No content sent yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {contentItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 16,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                      borderLeft: `3px solid ${item.type === "campaign" ? "#FF4EDB" : "#2F80FF"}`,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}>
                      <div style={{
                        fontSize: 14,
                        color: "#F5F7FA",
                        flex: 1,
                      }}>
                        {item.title}
                      </div>
                      <span style={{
                        fontSize: 9,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: "rgba(16,185,129,0.2)",
                        color: "#10B981",
                        textTransform: "uppercase",
                        fontWeight: 600,
                      }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: "#6B7186",
                      marginTop: 8,
                      fontFamily: "'Orbitron', monospace",
                    }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
