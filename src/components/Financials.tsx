"use client";

import { useState, useEffect } from "react";

interface DemoState {
  business: {
    name: string;
    niche: string;
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
    tasksCompleted: number;
  }>;
  tasks: Array<{
    status: string;
  }>;
}

export default function Financials({ businessData }: { businessData?: any }) {
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
  const tasks = state?.tasks || [];

  // Calculate financial projections
  const avgDealSize = 500;
  const closeRate = (metrics?.conversionRate || 2) / 100;
  const monthlyRevenue = (metrics?.leads || 0) * 4 * closeRate * avgDealSize;
  const monthlyExpenses = 500; // AI costs
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? ((monthlyProfit / monthlyRevenue) * 100).toFixed(1) : "0";

  const expenses = [
    { name: "AI Agent Costs", amount: 200, icon: "🤖" },
    { name: "Email Infrastructure", amount: 100, icon: "📧" },
    { name: "Lead Database", amount: 150, icon: "📊" },
    { name: "Tools & Software", amount: 50, icon: "🔧" },
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
          FINANCIALS
        </div>
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#F5F7FA",
          margin: 0,
          fontFamily: "'Space Grotesk', sans-serif",
        }}>
          Financial Overview
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
          Loading financial data...
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
          <div style={{ fontSize: 64, marginBottom: 24 }}>💵</div>
          <div style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            marginBottom: 8,
          }}>
            No Financial Data Yet
          </div>
          <div style={{
            color: "#6B7186",
            fontSize: 16,
          }}>
            Start a business build to see financials
          </div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}>
            <FinancialCard
              label="Monthly Revenue"
              value={`$${monthlyRevenue.toLocaleString()}`}
              icon="💰"
              color="#10B981"
              trend="+12%"
            />
            <FinancialCard
              label="Monthly Expenses"
              value={`$${monthlyExpenses}`}
              icon="📉"
              color="#F59E0B"
            />
            <FinancialCard
              label="Net Profit"
              value={`$${monthlyProfit.toLocaleString()}`}
              icon="📈"
              color={monthlyProfit > 0 ? "#10B981" : "#EF4444"}
            />
            <FinancialCard
              label="Profit Margin"
              value={`${profitMargin}%`}
              icon="🎯"
              color="#7B61FF"
            />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}>
            {/* Expenses Breakdown */}
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
                📊 Monthly Expenses
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {expenses.map((expense) => (
                  <div
                    key={expense.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 14,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{expense.icon}</span>
                      <span style={{ fontSize: 14, color: "#F5F7FA" }}>{expense.name}</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#F59E0B" }}>
                      ${expense.amount}
                    </span>
                  </div>
                ))}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 14px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  marginTop: 8,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>
                    ${expenses.reduce((sum, e) => sum + e.amount, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* ROI Calculator */}
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
                🚀 Business Metrics
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <MetricRow label="Total Leads" value={metrics?.leads || 0} />
                <MetricRow label="Close Rate" value={`${metrics?.conversionRate || 0}%`} />
                <MetricRow label="Avg Deal Size" value="$500" />
                <MetricRow label="Tasks Completed" value={tasks.filter(t => t.status === "done").length} />
                <MetricRow label="AI Agents Active" value={agents.filter(a => (a as any).status !== "idle").length} />
                <div style={{
                  padding: 16,
                  background: "linear-gradient(135deg, #10B98120, #10B98110)",
                  borderRadius: 10,
                  border: "1px solid #10B98140",
                  marginTop: 8,
                }}>
                  <div style={{ fontSize: 12, color: "#10B981", marginBottom: 4 }}>ESTIMATED ROI</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#10B981" }}>
                    {monthlyExpenses > 0 ? `${((monthlyProfit / monthlyExpenses) * 100).toFixed(0)}%` : "∞"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FinancialCard({ label, value, icon, color, trend }: { 
  label: string; 
  value: string; 
  icon: string; 
  color: string;
  trend?: string;
}) {
  return (
    <div style={{
      background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.08)",
      padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 11, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>
          {label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
        {trend && (
          <span style={{
            fontSize: 11,
            color: trend.startsWith("+") ? "#10B981" : "#EF4444",
          }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}>
      <span style={{ fontSize: 13, color: "#8A8F98" }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#F5F7FA" }}>{value}</span>
    </div>
  );
}
