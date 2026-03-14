export function LoadingMask() {
  return (
    <div style={overlay}>
      <div style={spinner}></div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const spinner: React.CSSProperties = {
  width: 40,
  height: 40,
  border: "4px solid #fff",
  borderTop: "4px solid transparent",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};
