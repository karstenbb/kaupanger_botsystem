const COLORS = [
  '#1E88E5', '#43A047', '#FB8C00', '#E53935',
  '#8E24AA', '#00ACC1', '#F4511E', '#5C6BC0',
  '#26A69A', '#D81B60', '#7CB342', '#FFB300',
];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function Avatar({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const cls = `avatar${size !== 'md' ? ` avatar-${size}` : ''}`;
  return (
    <div className={cls} style={{ background: getColor(name), color: '#fff' }}>
      {getInitials(name)}
    </div>
  );
}
