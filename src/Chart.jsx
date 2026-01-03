export default function Chart({ data }) {
  const max = Math.max(...data, 1); // Чтобы избежать деления на 0

  return (
    <div className="chart">
      {data.slice(-20).map((v, i) => (
        <div
          key={i}
          className={`bar ${v >= 0 ? "positive" : "negative"}`}
          style={{ height: `${(Math.abs(v) / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
