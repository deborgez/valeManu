type Barra = { label: string; valor: number };

export default function DesempenhoChart({ dados }: { dados: Barra[] }) {
  const max = Math.max(1, ...dados.map((d) => d.valor));
  const altura = 160;
  const larguraBarra = 28;
  const gap = 12;
  const largura = dados.length * (larguraBarra + gap) + gap;

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <svg
        viewBox={`0 0 ${largura} ${altura + 30}`}
        className="h-48"
        style={{ minWidth: largura }}
      >
        <line
          x1={0}
          y1={altura}
          x2={largura}
          y2={altura}
          className="stroke-slate-300 dark:stroke-slate-600"
          strokeWidth={1}
        />
        {dados.map((d, i) => {
          const h = d.valor === 0 ? 0 : Math.max((d.valor / max) * (altura - 20), 3);
          const x = gap + i * (larguraBarra + gap);
          const y = altura - h;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={larguraBarra}
                height={h}
                rx={4}
                className="fill-blue-500 dark:fill-blue-400"
              >
                <title>{`${d.label}: ${d.valor}`}</title>
              </rect>
              {d.valor > 0 && (
                <text
                  x={x + larguraBarra / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-slate-600 text-[10px] dark:fill-slate-300"
                >
                  {d.valor}
                </text>
              )}
              <text
                x={x + larguraBarra / 2}
                y={altura + 16}
                textAnchor="middle"
                className="fill-slate-400 text-[9px] dark:fill-slate-500"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
