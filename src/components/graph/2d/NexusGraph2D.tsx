import React, { useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { getEntityColor, toSentenceCase } from '@/utils/graphColors';

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
    // 1. Map Categories for Legend (Sentence Case)
    const uniqueLabelsRaw = Array.from(new Set(data.nodes.map(n => String(n.label || n.neo4jLabel || 'Entity'))));
    const categories = uniqueLabelsRaw.map(label => {
      const sentenceLabel = toSentenceCase(label);
      return { 
        name: sentenceLabel, 
        itemStyle: { color: getEntityColor(label) } 
      };
    });

    // 2. Map Nodes
    const nodes = data.nodes.map((node) => {
      const rawLabel = String(node.label || node.neo4jLabel || 'Entity');
      const sentenceLabel = toSentenceCase(rawLabel);
      const color = getEntityColor(rawLabel);
      
      const categoryIndex = uniqueLabelsRaw.indexOf(rawLabel);

      const { [ 'label' as any ]: _ignored, ...cleanNode } = node;
      
      return {
        ...cleanNode,
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
          color: '#1a1a1a', 
          fontSize: 11,
          fontWeight: 'black',
          textBorderColor: '#ffffff',
          textBorderWidth: 3,
          distance: 10
        }
      };
    });

    // 3. Map Links
    const links = data.links.map(link => ({
      ...link,
      source: String(typeof link.source === 'object' ? link.source.id : link.source),
      target: String(typeof link.target === 'object' ? link.target.id : link.target),
      lineStyle: {
        color: 'rgba(100, 116, 139, 0.3)',
        curveness: layoutMode === 'radial' ? 0.3 : 0.1,
        width: 1.5
      },
      emphasis: {
        lineStyle: {
          color: '#10B981',
          width: 3,
          opacity: 1
        }
      }
    }));

    return {
      backgroundColor: 'transparent',
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      legend: { show: false },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#10B981',
        borderWidth: 1,
        padding: 0,
        extraCssText: 'box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden;',
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const n = params.data;
            const label = toSentenceCase(String(n.neo4jLabel || 'Entity'));
            return `
              <div style="padding: 12px; min-width: 160px; color: #1a1a1a;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <div style="width: 8px; height: 8px; border-radius: 50%; background: ${params.color};"></div>
                  <b style="font-size: 13px;">${n.name}</b>
                </div>
                <div style="color: #107B41; font-size: 10px; font-weight: 900; opacity: 0.8; letter-spacing: 0.5px;">${label.toUpperCase()}</div>
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
            lineStyle: { width: 4, opacity: 1, color: '#10B981' }
          },
          lineStyle: {
            color: 'rgba(100, 116, 139, 0.3)',
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
    },
    'mouseover': (params: any) => {
      if (params.dataType === 'node') {
        const echartsInstance = echartsRef.current?.getEchartsInstance();
        if (echartsInstance) echartsInstance.getZr().setCursorStyle('pointer');
      }
    },
    'mouseout': (params: any) => {
      const echartsInstance = echartsRef.current?.getEchartsInstance();
      if (echartsInstance) echartsInstance.getZr().setCursorStyle('default');
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
