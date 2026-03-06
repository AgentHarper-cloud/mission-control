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
    role: string;
    status: string;
    tasksCompleted: number;
  }>;
}

export default function RevenueEngine({ businessData }: { businessData?: any }) {
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
  const metrics = state?.metrics;
  const agents = state?.agents || [];

  // Revenue engine channels based on agents
  const channels = [
    {
      name: "Cold Outreach",
      icon: "📧",
      status: agents.find(a => a.id === "outreach")?.status === "active" ? "active" : "pending",
      leads: Math.floor((metrics?.leads || 0) * 0.6),
      conversion: "4.2%",
      agent: "Outreach",
    },
    {
      name: "Inbound Leads",
      icon: "🎯",
      status: agents.find(a => a.id === "scout")?.status === "active" ? "active" : "pending",
      leads: Math.floor((metrics?.leads || 0) * 0.25),
      conversion: "8.5%",
      agent: "Scout",
    },
    {
      name: "Referrals",
      icon: "🤝",
      status: "pending",
      leads: Math.floor((metrics?.leads || 0) * 0.15),
      conversion: "12.3%",
      agent: "Fulfill",
    },
  ];

  const pipeline = [
    { stage: "Leads", count: metrics?.leads || 0, color: "#2F80FF" },
    { stage: "Contacted", count: Math.floor((metrics?.leads || 0) * 0.5), color: "#7B61FF" },
    { stage: "Replied", count: Math.floor((metrics?.leads || 0) * 0.1), color: "#FF4EDB" },
    { stage: "Booked", count: Math.floor((metrics?.leads || 0) * 0.02), color: "#10B981" },
    { stage: "Closed", count: Math.floor((metrics?.leads || 0) * 0.005), color: "#F59E0B" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0F19",
      padding: 24,
    }}>
      {/* Header */}
      <div style={{
        marginBottom: 24,
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: "#10B981",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 4,
        }}>
          REVENUE ENGINE
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Lead Generation & Sales
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
          Loading revenue data...
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>💰</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Revenue Data Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
            textAlign: "center",
          }}>
            Start a business build from <span style={{ color: "#FF4EDB" }}>🔴 LIVE BUILD</span> to see your revenue engine
          </div>
        </div>
      ) : (
        <>
          {/* Pipeline Funnel */}
          <div style={{
            background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.08)",
            padding: 24,
            marginBottom: 24,
          }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#F5F7FA",
              marginBottom: 24,
            }}>
              📈 Sales Pipeline
            </h2>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              height: 200,
              gap: 16,
            }}>
              {pipeline.map((stage, i) => {
                const maxCount = pipeline[0].count || 1;
                const height = Math.max(20, (stage.count / maxCount) * 180);
                return (
                  <div key={stage.stage} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: stage.color,
                      marginBottom: 8,
                    }}>
                      {stage.count}
                    </div>
                    <div style={{
                      height,
                      background: `linear-gradient(180deg, ${stage.color}, ${stage.color}60)`,
                      borderRadius: "8px 8px 0 0",
                      transition: "height 0.5s ease",
                    }} />
                    <div style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "#8A8F98",
                      fontWeight: 500,
                    }}>
                      {stage.stage}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Channels Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 24,
          }}>
            {channels.map((channel) => (
              <div
                key={channel.name}
                style={{
                  background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: 24,
                }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{channel.icon}</span>
                    <div>
                      <div style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#F5F7FA",
                      }}>
                        {channel.name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "#6B7186",
                      }}>
                        via {channel.agent}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: 9,
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: channel.status === "active" ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.2)",
                    color: channel.status === "active" ? "#10B981" : "#94A3B8",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}>
                    {channel.status}
                  </span>
                </div>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#2F80FF" }}>{channel.leads}</div>
                    <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase" }}>Leads</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>{channel.conversion}</div>
                    <div style={{ fontSize: 10, color: "#6B7186", textTransform: "uppercase" }}>Conv Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Offer Stack */}
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
              💎 Offer Stack
            </h2>
            <div style={{
              padding: 20,
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              borderLeft: "4px solid #FF4EDB",
            }}>
              <div style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#F5F7FA",
                marginBottom: 8,
              }}>
                {state?.business?.mainOffer || "Main Offer"}
              </div>
              <div style={{
                fontSize: 13,
                color: "#8A8F98",
                lineHeight: 1.5,
              }}>
                Target: {state?.business?.targetAudience || "Not defined"}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
