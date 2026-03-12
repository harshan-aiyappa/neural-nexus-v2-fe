import { useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import * as THREE from 'three';

interface Node {
    id: string;
    label: string;
    val?: number;
}

interface Link {
    source: string;
    target: string;
    type: string;
    isSymmetric?: boolean;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

export const NexusGraph = ({ data, layoutMode = 'network' }: { data: GraphData, layoutMode?: 'network' | 'tree' | 'radial' }) => {
    const fgRef = useRef<any>(null);

    const dagModeMap: Record<string, any> = {
        'network': null,
        'tree': 'td',
        'radial': 'radialout'
    };

    return (
        <div className="w-full h-full overflow-hidden">
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                dagMode={dagModeMap[layoutMode]}
                dagLevelDistance={100}
                nodeLabel="id"
                nodeAutoColorBy="label"
                // Important for responsiveness
                width={window.innerWidth - 280} // Approx sidebar width, but better to use a ResizeObserver or let it auto-size if possible
                height={window.innerHeight}
                // Global standard: Conditional arrows
                linkDirectionalArrowLength={(link: any) => link.isSymmetric ? 0 : 3.5}
                linkDirectionalArrowRelPos={1}
                linkCurvature={0.1}
                linkWidth={0.5}
                linkColor={() => 'rgba(81, 142, 109, 0.5)'} // jungle-teal with alpha
                backgroundColor="rgba(0,0,0,0)"
                nodeThreeObject={(node: any) => {
                    const sprite = new THREE.Group();

                    // Outer Glow
                    const geometry = new THREE.SphereGeometry(3, 32, 32);
                    const material = new THREE.MeshPhongMaterial({
                        color: node.color || '#518E6D',
                        transparent: true,
                        opacity: 0.8,
                        emissive: node.color || '#518E6D',
                        emissiveIntensity: 0.5
                    });
                    const sphere = new THREE.Mesh(geometry, material);
                    sprite.add(sphere);

                    return sprite;
                }}
            />
        </div>
    );
};
