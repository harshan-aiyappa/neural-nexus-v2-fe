import { getEntityColor, toSentenceCase } from '@/utils/graphColors';

interface Props {
  data: {
    nodes: any[];
    links: any[];
  };
}

export const SunburstChart: React.FC<Props> = ({ data }) => {
  const chartData = useMemo(() => {
    // Transform flat nodes into hierarchical structure for sunburst
    // Root -> Labels -> Nodes
    const root: any = { name: 'Atlas', children: [] };
    const labelMap = new Map();

    data.nodes.forEach(node => {
      const rawLabel = node.neo4jLabel || 'Entity';
      const sentenceLabel = toSentenceCase(rawLabel);
      const color = getEntityColor(rawLabel);
      
      if (!labelMap.has(rawLabel)) {
        const branch = { 
          name: sentenceLabel, 
          children: [], 
          itemStyle: { color: color } 
        };
        labelMap.set(rawLabel, branch);
        root.children.push(branch);
      }
      labelMap.get(rawLabel).children.push({
        name: node.name || node.id,
        value: 1,
        itemStyle: { color: color, opacity: 0.6 }
      });
    });

    return [root];
  }, [data]);

  const option = {
    backgroundColor: 'transparent',
    series: {
      type: 'sunburst',
      data: chartData,
      radius: [0, '90%'],
      label: { rotate: 'radial', fontSize: 10, fontWeight: 'bold' },
      itemStyle: { borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
      emphasis: { focus: 'ancestor' },
      levels: [
        {},
        { r0: '15%', r: '35%', label: { position: 'inner' }, itemStyle: { opacity: 0.8 } },
        { r0: '35%', r: '70%', label: { position: 'outside', padding: 3, silent: false }, itemStyle: { opacity: 0.6 } },
        { r0: '70%', r: '72%', label: { position: 'outside' } }
      ]
    },
    tooltip: { trigger: 'item' }
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};
