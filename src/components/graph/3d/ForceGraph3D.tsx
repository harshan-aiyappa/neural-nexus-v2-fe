import { useRef, useCallback } from 'react';
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

export const NexusGraph = ({ data }: { data: GraphData }) => {
    const fgRef = useRef<any>();

    const paintNode = useCallback((node: any, ctx: any) => {
        // Custom node painting logic for premium feel if needed
    }, []);

    return (
        <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-jungle-teal/30 shadow-2xl bg-black/20 backdrop-blur-sm">
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                nodeLabel="id"
                nodeAutoColorBy="label"
                // Global standard: Conditional arrows
                // Arrows are only rendered if the relationship is NOT symmetric
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
