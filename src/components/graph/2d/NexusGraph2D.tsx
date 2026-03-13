import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';

interface Props {
  data: {
    nodes: any[];
    links: any[];
  };
  onNodeClick?: (node: any) => void;
  onLinkClick?: (link: any) => void;
  layoutMode?: 'network' | 'tree' | 'radial';
}

export const NexusGraph2D: React.FC<Props> = ({ data, onNodeClick, onLinkClick, layoutMode = 'network' }) => {
  const echartsRef = useRef<any>(null);

  const option = useMemo(() => {
    // 1. Define Static Brand Colors (Explicit HEX for Canvas Rendering)
    const colors = {
      primary: '#10B981',    // Emerald
      secondary: '#107B41',  // Jungle Teal
      person: '#F59E0B',     // Amber
      project: '#3B82F6',    // Blue
      location: '#8B5CF6',   // Violet
      medical: '#EF4444',    // Red
      herb: '#059669',       // Dark Green
      compound: '#0D9488',   // Teal
      link: 'rgba(100, 116, 139, 0.3)', // slate-500 with opacity
      text: '#475569'        // slate-600
    };

    // 2. Map Categories for Legend
    const uniqueLabels = Array.from(new Set(data.nodes.map(n => String(n.label || n.neo4jLabel || 'Other').toUpperCase())));
    const categories = uniqueLabels.map(name => ({ name }));

    // 3. Map Nodes
    const nodes = data.nodes.map((node) => {
      const nodeLabel = String(node.label || node.neo4jLabel || '').toUpperCase();
      let color = colors.primary;
      
      if (nodeLabel.includes('COMPANY') || nodeLabel.includes('BUSINESS')) color = colors.primary;
      else if (nodeLabel.includes('PERSON') || nodeLabel.includes('RESEARCHER')) color = colors.person;
      else if (nodeLabel.includes('PROJECT') || nodeLabel.includes('TECHNOLOGY')) color = colors.project;
      else if (nodeLabel.includes('LOCATION') || nodeLabel.includes('EVENT')) color = colors.location;
      else if (nodeLabel.includes('DISEASE') || nodeLabel.includes('MEDICAL')) color = colors.medical;
      else if (nodeLabel.includes('PLANT') || nodeLabel.includes('HERB')) color = colors.herb;
      else if (nodeLabel.includes('COMPOUND') || nodeLabel.includes('CHEMICAL')) color = colors.compound;

      const categoryIndex = uniqueLabels.indexOf(nodeLabel);

      return {
        ...node,
        neo4jLabel: node.label, // Preserve original string label
        id: String(node.id),
        name: node.name || node.id,
        category: categoryIndex >= 0 ? categoryIndex : 0,
        symbolSize: layoutMode === 'network' ? 45 : 30,
        itemStyle: {
          color: color,
          borderColor: '#ffffff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.2)'
        },
        label: {
          show: data.nodes.length < 80,
          position: 'right',
          formatter: '{b}',
          color: '#1a1a1a', // Dark text for light background
          fontSize: 11,
          fontWeight: 'black',
          textBorderColor: '#ffffff',
          textBorderWidth: 3,
          distance: 10
        }
      };
    });

    // 4. Map Links
    const links = data.links.map(link => ({
      ...link,
      source: String(typeof link.source === 'object' ? link.source.id : link.source),
      target: String(typeof link.target === 'object' ? link.target.id : link.target),
      lineStyle: {
        color: colors.link,
        curveness: layoutMode === 'radial' ? 0.3 : 0.1,
        width: 1.5
      },
      emphasis: {
        lineStyle: {
          color: colors.primary,
          width: 3,
          opacity: 1
        }
      }
    }));

    return {
      backgroundColor: 'transparent',
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      legend: {
        show: true,
        bottom: 20,
        left: 'center',
        orient: 'horizontal',
        textStyle: { color: colors.text, fontSize: 10, fontWeight: 'bold' },
        itemWidth: 10,
        itemHeight: 10,
        icon: 'circle',
        data: categories.map(c => c.name)
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: colors.primary,
        borderWidth: 1,
        padding: 0,
        extraCssText: 'box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden;',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const n = params.data;
            return `
              <div style="padding: 12px; min-width: 160px; color: #1a1a1a;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: ${params.color};"></div>
                  <b style="font-size: 13px;">${n.name}</b>
                </div>
                <div style="color: ${colors.secondary}; font-size: 9px; font-weight: 900; opacity: 0.8;">${String(n.label || 'ENTITY').toUpperCase()}</div>
              </div>
            `;
          }
          return `<div style="padding: 8px; color: #444; font-size: 11px;">Network Connection</div>`;
        }
      },
      series: [
        {
          type: 'graph',
          layout: layoutMode === 'radial' ? 'circular' : 'force',
          data: nodes,
          links: links,
          categories: categories,
          roam: true,
          draggable: true,
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: [0, 8],
          force: {
            repulsion: 300,
            gravity: 0.05,
            edgeLength: [80, 200],
            layoutAnimation: true
          },
          circular: { rotateLabel: true },
          emphasis: {
            focus: 'adjacency',
            itemStyle: { scale: 1.2, shadowBlur: 20 },
            lineStyle: { width: 4, opacity: 1, color: colors.primary }
          },
          lineStyle: {
            color: colors.link,
            width: 1.5,
            curveness: layoutMode === 'radial' ? 0.3 : 0.1,
            type: 'solid'
          }
        }
      ]
    };
  }, [data, layoutMode]);

  const onEvents = {
    'click': (params: any) => {
      if (params.dataType === 'node') onNodeClick?.(params.data);
      else if (params.dataType === 'edge') onLinkClick?.(params.data);
    }
  };

  return (
    <ReactECharts
      ref={echartsRef}
      option={option}
      style={{ height: '100%', width: '100%' }}
      onEvents={onEvents}
    />
  );
};
