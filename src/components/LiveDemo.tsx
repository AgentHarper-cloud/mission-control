"use client";

import { useState, useEffect } from "react";

interface DemoState {
  businessName: string;
  phase: string;
  revenuePlannerData: any | null;
}

const STORAGE_KEY = "aim-demo-state";

export default function LiveDemo() {
  const [state, setState] = useState<DemoState | null>(null);
  const [waveStatus, setWaveStatus] = useState({
    wave1: { status: "pending", progress: 0 },
    wave2: { status: "pending", progress: 0 },
    wave3: { status: "pending", progress: 0 },
  });
  const [agents, setAgents] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  // Load state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(parsed);
        
        // If building phase, start simulating the waves
        if (parsed.phase === "building" && parsed.revenuePlannerData) {
          startWaveSimulation(parsed.revenuePlannerData);
        }
      } catch (e) {
        console.error("Failed to load state:", e);
      }
    }
  }, []);

  const startWaveSimulation = (plannerData: any) => {
    // Spawn Wave 1 agents
    const wave1Agents = [
      { id: "website", name: "Website Bot", avatar: "🌐", role: "Building landing page", status: "working", progress: 0, wave: 1 },
    ];
    
    if (plannerData.profit?.cart === "now") {
      wave1Agents.push({ id: "cart", name: "Cart Page Bot", avatar: "🛒", role: "Building sales page", status: "idle", progress: 0, wave: 1 });
    }
    if (plannerData.profit?.call === "now") {
      wave1Agents.push({ id: "call", name: "Call Funnel Bot", avatar: "📞", role: "Building application funnel", status: "idle", progress: 0, wave: 1 });
    }
    
    setAgents(wave1Agents);
    
    addActivity("🚀 Wave 1 starting — Foundation phase", "signal", "[MASTER: WAVE 1 SPAWNING]");
    addActivity(`🤖 Spawning ${wave1Agents.length} agents for Wave 1`, "success");
    
    setWaveStatus(prev => ({
      ...prev,
      wave1: { status: "running", progress: 0 },
    }));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Complete Wave 1
        setWaveStatus(prev => ({
          ...prev,
          wave1: { status: "complete", progress: 100 },
        }));
        addActivity("✅ Wave 1 Complete — Foundation built!", "signal", "[MASTER: WAVE 1 COMPLETE]");
        
        // Start Wave 2
        setTimeout(() => startWave2(plannerData), 1000);
      }
      
      setWaveStatus(prev => ({
        ...prev,
        wave1: { ...prev.wave1, progress: Math.min(progress, 100) },
      }));
      
      // Update agent progress
      setAgents(prev => prev.map(a => ({
        ...a,
        status: progress < 30 ? "working" : progress < 70 ? "working" : progress < 100 ? "working" : "complete",
        progress: Math.min(progress, 100),
      })));
    }, 500);
  };

  const startWave2 = (plannerData: any) => {
    const wave2Agents = [
      { id: "email", name: "Email Sequence Bot", avatar: "📧", role: "Writing email sequences", status: "working", progress: 0, wave: 2 },
    ];
    
    if (plannerData.promote?.prospect === "now") {
      wave2Agents.push({ id: "outbound", name: "Outbound Bot", avatar: "📤", role: "Setting up cold outreach", status: "idle", progress: 0, wave: 2 });
    }
    
    setAgents(prev => [...prev.map(a => ({ ...a, status: "complete" })), ...wave2Agents]);
    addActivity("🚀 Wave 2 starting — Sequences phase", "signal", "[MASTER: WAVE 2 SPAWNING]");
    
    setWaveStatus(prev => ({
      ...prev,
      wave2: { status: "running", progress: 0 },
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setWaveStatus(prev => ({
          ...prev,
          wave2: { status: "complete", progress: 100 },
        }));
        addActivity("✅ Wave 2 Complete — Sequences ready!", "signal", "[MASTER: WAVE 2 COMPLETE]");
        
        // Check if Wave 3 needed
        if (plannerData.promote?.publish === "now" || plannerData.promote?.paid === "now") {
          setTimeout(() => startWave3(plannerData), 1000);
        } else {
          setTimeout(() => completeDemo(), 1000);
        }
      }
      
      setWaveStatus(prev => ({
        ...prev,
        wave2: { ...prev.wave2, progress: Math.min(progress, 100) },
      }));
    }, 500);
  };

  const startWave3 = (plannerData: any) => {
    const wave3Agents: any[] = [];
    
    if (plannerData.promote?.publish === "now") {
      wave3Agents.push({ id: "content", name: "Content Bot", avatar: "📱", role: "Creating content plan", status: "working", progress: 0, wave: 3 });
    }
    if (plannerData.promote?.paid === "now") {
      wave3Agents.push({ id: "ads", name: "Ads Bot", avatar: "📺", role: "Building ad creative", status: "working", progress: 0, wave: 3 });
    }
    
    setAgents(prev => [...prev.map(a => ({ ...a, status: a.wave < 3 ? "complete" : a.status })), ...wave3Agents]);
    addActivity("🚀 Wave 3 starting — Content & Ads phase", "signal", "[MASTER: WAVE 3 SPAWNING]");
    
    setWaveStatus(prev => ({
      ...prev,
      wave3: { status: "running", progress: 0 },
    }));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 5 + 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setWaveStatus(prev => ({
          ...prev,
          wave3: { status: "complete", progress: 100 },
        }));
        addActivity("✅ Wave 3 Complete — Content & Ads ready!", "signal", "[MASTER: WAVE 3 COMPLETE]");
        
        setTimeout(() => completeDemo(), 1000);
      }
      
      setWaveStatus(prev => ({
        ...prev,
        wave3: { ...prev.wave3, progress: Math.min(progress, 100) },
      }));
    }, 500);
  };

  const completeDemo = () => {
    addActivity("🎉 ALL BOTS COMPLETE — Your AI Workforce is ready!", "signal", "[MASTER: ALL BOTS COMPLETE]");
    setAgents(prev => prev.map(a => ({ ...a, status: "complete", progress: 100 })));
    
    // Update localStorage phase
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.phase = "complete";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  };

  const addActivity = (message: string, type: string, signal?: string) => {
    setActivity(prev => [{
      id: `activity-${Date.now()}`,
      message,
      type,
      signal,
      timestamp: new Date().toISOString(),
    }, ...prev].slice(0, 50));
  };

  if (!state) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8A8F98",
      }}>
        Loading demo state...
      </div>
    );
  }

  if (state.phase !== "building" && state.phase !== "complete") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0B0F19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 40,
      }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <h2 style={{ color: "#F5F7FA", fontSize: 24, marginBottom: 10 }}>
            Waiting to Build
          </h2>
          <p style={{ color: "#8A8F98", fontSize: 14, maxWidth: 400 }}>
            Complete the Vision Intake conversation, then lock your Revenue Planner to start building your AI workforce.
          </p>
        </div>
      </div>
    );
  }

  const waveStatusColors = {
    pending: { bg: "rgba(100,116,139,0.1)", text: "#6B7186", border: "#374151" },
    running: { bg: "rgba(255,78,219,0.1)", text: "#FF4EDB", border: "#FF4EDB" },
    complete: { bg: "rgba(16,185,129,0.1)", text: "#10B981", border: "#10B981" },
  };

  const activityColors = {
    info: "#2F80FF",
    success: "#10B981",
    warning: "#F59E0B",
    signal: "#FF4EDB",
    gate: "#7B61FF",
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
        padding: "20px 24px",
        background: "linear-gradient(135deg, #111624, #0D1117)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div>
          <div style={{
            fontSize: 10,
            letterSpacing: 2,
            color: "#FF4EDB",
            fontFamily: "'Orbitron', monospace",
            marginBottom: 4,
          }}>
            🔴 LIVE BUILD
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F5F7FA",
            margin: 0,
          }}>
            {state.businessName}
          </h1>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#10B981",
            animation: "pulse 2s infinite",
          }} />
          <span style={{ fontSize: 12, color: "#10B981" }}>Live</span>
        </div>
      </div>

      {/* Wave Status Bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16,
        marginBottom: 24,
      }}>
        {(["wave1", "wave2", "wave3"] as const).map((waveKey, idx) => {
          const wave = waveStatus[waveKey];
          const style = waveStatusColors[wave.status as keyof typeof waveStatusColors];
          return (
            <div
              key={waveKey}
              style={{
                padding: 16,
                background: style.bg,
                borderRadius: 12,
                border: `2px solid ${style.border}`,
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "#6B7186", textTransform: "uppercase", letterSpacing: 1 }}>
                    Wave {idx + 1}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: style.text, marginTop: 4 }}>
                    {wave.status.toUpperCase()}
                  </div>
                </div>
                <span style={{ fontSize: 28 }}>
                  {wave.status === "pending" ? "⏳" : wave.status === "running" ? "⚡" : "✅"}
                </span>
              </div>
              {wave.status === "running" && (
                <div style={{
                  marginTop: 12,
                  height: 4,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${wave.progress}%`,
                    height: "100%",
                    background: style.text,
                    transition: "width 0.3s ease",
                  }} />
                </div>
              )}
              <div style={{ fontSize: 11, color: "#6B7186", marginTop: 8 }}>
                {idx === 0 && "Foundation (Website + Funnels)"}
                {idx === 1 && "Sequences (Email + Outreach)"}
                {idx === 2 && "Content & Ads"}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left Column - Activity Feed */}
        <div style={{
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 20,
          maxHeight: "calc(100vh - 340px)",
          overflow: "auto",
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
            <span>📡</span> Signal Log
          </h2>
          
          {activity.length === 0 ? (
            <div style={{
              color: "#6B7186",
              fontSize: 13,
              textAlign: "center",
              padding: 40,
            }}>
              Waiting for signals...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activity.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 12,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 8,
                    borderLeft: `3px solid ${activityColors[item.type as keyof typeof activityColors] || "#6B7186"}`,
                  }}
                >
                  <p style={{ color: "#F5F7FA", fontSize: 13, margin: 0, lineHeight: 1.4 }}>
                    {item.message}
                  </p>
                  {item.signal && (
                    <p style={{
                      color: "#FF4EDB",
                      fontSize: 10,
                      margin: "6px 0 0",
                      fontFamily: "'Orbitron', monospace",
                    }}>
                      {item.signal}
                    </p>
                  )}
                  <p style={{ color: "#6B7186", fontSize: 10, margin: "4px 0 0" }}>
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - AI Agents */}
        <div style={{
          background: "linear-gradient(180deg, #111624 0%, #0D1117 100%)",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.08)",
          padding: 20,
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
            <span>🤖</span> Active Bots ({agents.length})
          </h2>
          
          {agents.length === 0 ? (
            <div style={{
              color: "#6B7186",
              fontSize: 13,
              textAlign: "center",
              padding: 40,
            }}>
              Bots spawning...
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {agents.map((agent) => {
                const statusColors = {
                  idle: { bg: "rgba(100,116,139,0.2)", text: "#94A3B8" },
                  working: { bg: "rgba(124,58,237,0.2)", text: "#A78BFA" },
                  complete: { bg: "rgba(16,185,129,0.2)", text: "#10B981" },
                };
                const statusStyle = statusColors[agent.status as keyof typeof statusColors] || statusColors.idle;
                
                return (
                  <div
                    key={agent.id}
                    style={{
                      padding: 14,
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 8,
                      border: `1px solid ${statusStyle.text}30`,
                    }}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 8,
                    }}>
                      <span style={{ fontSize: 24 }}>{agent.avatar}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F7FA" }}>
                          {agent.name}
                        </div>
                        <div style={{ fontSize: 11, color: "#8A8F98" }}>
                          {agent.role} • Wave {agent.wave}
                        </div>
                      </div>
                      <div style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        fontSize: 9,
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}>
                        {agent.status}
                      </div>
                    </div>
                    
                    {agent.status === "working" && (
                      <div style={{
                        height: 4,
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}>
                        <div style={{
                          width: `${agent.progress}%`,
                          height: "100%",
                          background: statusStyle.text,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
