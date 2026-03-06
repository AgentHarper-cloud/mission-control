"use client";

import { useState, useEffect } from "react";

interface DemoState {
  business: {
    name: string;
    niche: string;
    mainOffer: string;
  };
  metrics: {
    revenue: number;
    leads: number;
    adSpend: number;
    cpa: number;
    conversionRate: number;
  };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
  }>;
}

export default function ProfitPipeline({ businessData }: { businessData?: any }) {
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
  const tasks = state?.tasks || [];

  // Calculate projected metrics
  const leadsPerMonth = (metrics?.leads || 0) * 4;
  const avgDealSize = 500;
  const closeRate = (metrics?.conversionRate || 2) / 100;
  const projectedRevenue = leadsPerMonth * closeRate * avgDealSize;
  const projectedProfit = projectedRevenue * 0.7;

  const profitDrivers = [
    {
      name: "Lead Volume",
      current: metrics?.leads || 0,
      target: 500,
      icon: "👥",
      color: "#2F80FF",
    },
    {
      name: "Close Rate",
      current: metrics?.conversionRate || 0,
      target: 5,
      unit: "%",
      icon: "🎯",
      color: "#10B981",
    },
    {
      name: "Avg Deal Size",
      current: avgDealSize,
      target: 1000,
      unit: "$",
      icon: "💰",
      color: "#FF4EDB",
    },
    {
      name: "Tasks Completed",
      current: tasks.filter(t => t.status === "done").length,
      target: 10,
      icon: "✅",
      color: "#7B61FF",
    },
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
          color: "#10B981",
          fontFamily: "'Orbitron', monospace",
          marginBottom: 4,
        }}>
          PROFIT PIPELINE
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Revenue Projections
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
          Loading profit data...
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>📈</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Profit Data Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
          }}>
            Start a business build to see projections
          </div>
        </div>
      ) : (
        <>
          {/* Revenue Projections */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
            marginBottom: 24,
          }}>
            <ProjectionCard
              label="Monthly Leads"
              value={leadsPerMonth}
              icon="👥"
              color="#2F80FF"
            />
            <ProjectionCard
              label="Projected Revenue"
              value={`$${projectedRevenue.toLocaleString()}`}
              icon="💰"
              color="#10B981"
            />
            <ProjectionCard
              label="Projected Profit"
              value={`$${projectedProfit.toLocaleString()}`}
              icon="📈"
              color="#FF4EDB"
              subtitle="70% margin"
            />
          </div>

          {/* Profit Drivers */}
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
              🎯 Profit Drivers
            </h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}>
              {profitDrivers.map((driver) => {
                const progress = Math.min(100, (driver.current / driver.target) * 100);
                return (
                  <div
                    key={driver.name}
                    style={{
                      padding: 20,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 12,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{driver.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "#F5F7FA" }}>
                          {driver.name}
                        </span>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 700, color: driver.color }}>
                        {driver.unit === "$" && "$"}{driver.current}{driver.unit === "%" && "%"}
                      </span>
                    </div>
                    <div style={{
                      height: 8,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${driver.color}, ${driver.color}80)`,
                        borderRadius: 4,
                        transition: "width 0.5s ease",
                      }} />
                    </div>
                    <div style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "#6B7186",
                    }}>
                      Target: {driver.unit === "$" && "$"}{driver.target}{driver.unit === "%" && "%"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Formula */}
          <div style={{
            background: "linear-gradient(135deg, #10B98120, #10B98110)",
            borderRadius: 16,
            border: "1px solid #10B98140",
            padding: 24,
          }}>
            <h2 style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#10B981",
              marginBottom: 16,
            }}>
              💡 Growth Formula
            </h2>
            <div style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#F5F7FA",
              fontFamily: "'Orbitron', monospace",
              textAlign: "center",
              padding: 20,
            }}>
              {leadsPerMonth} leads × {(metrics?.conversionRate || 2)}% close × ${avgDealSize} = 
              <span style={{ color: "#10B981", marginLeft: 10 }}>${projectedRevenue.toLocaleString()}/mo</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ProjectionCard({ label, value, icon, color, subtitle }: { 
  label: string; 
  value: string | number; 
  icon: string; 
  color: string;
  subtitle?: string;
}) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
      borderRadius: 16,
      border: "1px solid rgba(255,255,255,0.08)",
      padding: 24,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
      {subtitle && (
        <div style={{ fontSize: 12, color: "#6B7186", marginTop: 4 }}>{subtitle}</div>
      )}
    </div>
  );
}
