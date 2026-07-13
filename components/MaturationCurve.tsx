type Props = {
  start: number;
  peak: number;
  end: number;
  current: number;
};

export default function MaturationCurve({
  start,
  peak,
  end,
  current,
}: Props) {
  return (
    <div
      style={{
        border: "1px solid #eee",
        borderRadius: 16,
        padding: 16,
      }}
    >
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        Fase di maturazione
      </div>

      <div
        style={{
          position: "relative",
          height: 120,
          background:
            "linear-gradient(to top, rgba(160,120,60,0.3), rgba(160,120,60,0.05))",
          borderRadius: 12,
        }}
      >
        {/* START */}
        <div
          style={{
            position: "absolute",
            left: "0%",
            bottom: 0,
            fontSize: 11,
          }}
        >
          Giovane<br />{start}
        </div>

        {/* PEAK */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 0,
            transform: "translateX(-50%)",
            fontSize: 11,
            fontWeight: 700,
            color: "#9c6b2f",
          }}
        >
          Apice<br />{peak}
        </div>

        {/* END */}
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: 0,
            fontSize: 11,
          }}
        >
          Declino<br />{end}
        </div>

        {/* CURRENT */}
        <div
          style={{
            position: "absolute",
            left: `${Math.min(
              100,
              Math.max(0, ((current - start) / (end - start)) * 100)
            )}%`,
            top: 0,
            bottom: 0,
            width: 2,
            background: "#8b0000",
          }}
        />
      </div>
    </div>
  );
}