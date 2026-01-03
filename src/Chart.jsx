export default function Chart({ data }) {
  const max = Math.max(...data, 1); // Чтобы не было деления на 0

  return (
    <div className="chart">
      {data.slice(-20).map((v, i) => (
        <div
          key={i}
          className="bar"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}
