'use client';

/**
 * Professional Loading Components
 * Usage: Import and use <LoadingSpinner />, <LoadingOverlay />, or <SkeletonLoader />
 */

// Simple spinning loader
export function LoadingSpinner({ size = 40, color = "#a855f7" }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `3px solid rgba(168, 85, 247, 0.1)`,
      borderTop: `3px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite"
    }}>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Full screen overlay with spinner
export function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(4px)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999,
      gap: 20
    }}>
      <LoadingSpinner size={50} />
      <div style={{
        color: "#fff",
        fontSize: 16,
        fontFamily: "'Georgia', serif",
        fontWeight: 500
      }}>
        {message}
      </div>
    </div>
  );
}

// Centered loader for sections
export function LoadingSection({ message = "Loading...", minHeight = 400 }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight,
      gap: 16
    }}>
      <LoadingSpinner size={44} />
      <div style={{
        color: "rgba(255, 255, 255, 0.5)",
        fontSize: 14,
        fontFamily: "'Georgia', serif"
      }}>
        {message}
      </div>
    </div>
  );
}

// Skeleton loader for roadmap cards
export function SkeletonRoadmap() {
  return (
    <div style={{ padding: "36px 56px" }}>
      {/* Header skeleton */}
      <div style={{
        background: "rgba(255, 255, 255, 0.025)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 14,
        padding: "24px 28px",
        marginBottom: 28,
        animation: "pulse 1.5s ease-in-out infinite"
      }}>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "rgba(255, 255, 255, 0.05)"
          }} />
          <div style={{ flex: 1 }}>
            <div style={{
              height: 24,
              width: "40%",
              background: "rgba(255, 255, 255, 0.08)",
              borderRadius: 6,
              marginBottom: 8
            }} />
            <div style={{
              height: 16,
              width: "60%",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 4
            }} />
          </div>
        </div>
      </div>

      {/* Stage skeletons */}
      {[1, 2, 3].map(i => (
        <div key={i} style={{ marginBottom: 40 }}>
          <div style={{
            height: 32,
            width: 200,
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: 8,
            marginBottom: 16,
            animation: "pulse 1.5s ease-in-out infinite"
          }} />
          <div style={{
            height: 80,
            background: "rgba(255, 255, 255, 0.025)",
            borderRadius: 10,
            marginBottom: 10,
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`
          }} />
          <div style={{
            height: 80,
            background: "rgba(255, 255, 255, 0.025)",
            borderRadius: 10,
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1 + 0.05}s`
          }} />
        </div>
      ))}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// Skeleton for forum posts
export function SkeletonForum() {
  return (
    <div style={{ padding: "24px" }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{
          background: "rgba(255, 255, 255, 0.025)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          animation: "pulse 1.5s ease-in-out infinite",
          animationDelay: `${i * 0.1}s`
        }}>
          <div style={{
            height: 20,
            width: "30%",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: 4,
            marginBottom: 12
          }} />
          <div style={{
            height: 16,
            width: "80%",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 4,
            marginBottom: 8
          }} />
          <div style={{
            height: 16,
            width: "60%",
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: 4
          }} />
        </div>
      ))}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
