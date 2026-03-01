import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Node {
  id: string;
  name: string;
  category: string;
  engagementScore: number;
  followerCount: number;
  likeCount: number;
  isAdmin?: boolean;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link {
  source: string | Node;
  target: string | Node;
}

const categoryColors: Record<string, string> = {
  'Technology': '#6366f1',
  'Fashion & Clothing': '#ec4899',
  'Food & Beverages': '#f97316',
  'Health & Fitness': '#10b981',
  'Beauty & Skincare': '#f43f5e',
  'Education': '#3b82f6',
  'Art & Design': '#8b5cf6',
  'Music': '#06b6d4',
  'Sports': '#84cc16',
  'Books & Literature': '#a78bfa',
  'Home & Kitchen': '#fb923c',
  'Photography': '#e879f9',
  'Travel': '#34d399',
  'Gaming': '#60a5fa',
  'Finance': '#facc15',
  'Handmade & Crafts': '#f87171',
  'Jewelry & Accessories': '#c084fc',
  'Electronics': '#38bdf8',
  'Other': '#9ca3af'
};

const NetworkGraph = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [stats, setStats] = useState({ nodes: 0, connections: 0 });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'brands'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setBrands(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!brands.length || !svgRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || 800;
    const height = 500;

    // Build nodes from brands
    const nodes: Node[] = brands.map(brand => ({
      id: brand.id,
      name: brand.brandName || 'Unnamed',
      category: brand.category || 'Other',
      engagementScore: brand.engagementScore || 0,
      followerCount: brand.followerCount || 0,
      likeCount: brand.likeCount || 0,
    }));

    // Build links from followers arrays
    const links: Link[] = [];
    brands.forEach(brand => {
      if (brand.followers && Array.isArray(brand.followers)) {
        brand.followers.forEach((followerId: string) => {
          const followerBrand = brands.find(b => b.ownerId === followerId || b.userId === followerId);
          if (followerBrand && followerBrand.id !== brand.id) {
            links.push({ source: followerBrand.id, target: brand.id });
          }
        });
      }
    });

    setStats({ nodes: nodes.length, connections: links.length });

    // SVG setup
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background', 'transparent');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });
    svg.call(zoom);

    const g = svg.append('g');

    // Gradient defs
    const defs = svg.append('defs');
    nodes.forEach(node => {
      const gradient = defs.append('radialGradient')
        .attr('id', `grad-${node.id}`)
        .attr('cx', '30%')
        .attr('cy', '30%');
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', d3.color(categoryColors[node.category] || '#9ca3af')?.brighter(0.8)?.toString() || '#fff');
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', categoryColors[node.category] || '#9ca3af');
    });

    // Arrow marker
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#e5e7eb');

    // Force simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links)
        .id(d => d.id)
        .distance(120)
        .strength(0.3)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<Node>().radius(d => getNodeRadius(d) + 10));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#e5e7eb')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)
      .attr('marker-end', 'url(#arrow)');

    // Node groups
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node circles
    node.append('circle')
      .attr('r', d => getNodeRadius(d))
      .attr('fill', d => `url(#grad-${d.id})`)
      .attr('stroke', d => categoryColors[d.category] || '#9ca3af')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('r', getNodeRadius(d) * 1.3)
          .attr('stroke-width', 3);
        setSelectedNode(d);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr('r', getNodeRadius(d))
          .attr('stroke-width', 2);
      });

    // Score badge on large nodes
    node.filter(d => getNodeRadius(d) > 20)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', d => Math.min(getNodeRadius(d) * 0.5, 12))
      .attr('font-weight', '700')
      .attr('pointer-events', 'none')
      .text(d => d.engagementScore > 0 ? `⚡${d.engagementScore}` : '');

    // Node labels below
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => getNodeRadius(d) + 14)
      .attr('fill', '#374151')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none')
      .text(d => d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name);

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Initial zoom to fit
    setTimeout(() => {
      svg.transition().duration(800).call(
        zoom.transform,
        d3.zoomIdentity.translate(width / 4, height / 4).scale(0.9)
      );
    }, 500);

    return () => simulation.stop();
  }, [brands]);

  const getNodeRadius = (node: Node): number => {
    const base = 12;
    const scoreBonus = Math.min(node.engagementScore * 0.5, 25);
    return base + scoreBonus;
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
      <div style={{
        width: '40px', height: '40px',
        border: '4px solid #6366f1',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  );

  if (brands.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
      <p style={{ fontSize: '16px' }}>No brands to visualize yet 🌐</p>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Stats bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
          border: '1px solid #a78bfa',
          borderRadius: '12px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#5b21b6'
        }}>
          🔵 {stats.nodes} Brands
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)',
          border: '1px solid #f9a8d4',
          borderRadius: '12px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#9d174d'
        }}>
          🔗 {stats.connections} Connections
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
          border: '1px solid #6ee7b7',
          borderRadius: '12px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: '600',
          color: '#065f46'
        }}>
          🖱️ Drag nodes • Scroll to zoom
        </div>
      </div>

      {/* Graph container */}
      <div style={{
        width: '100%',
        height: '500px',
        background: 'linear-gradient(135deg, rgba(238,242,255,0.5), rgba(253,242,248,0.5))',
        borderRadius: '20px',
        border: '1.5px solid #e0e7ff',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />

        {/* Selected node info panel */}
        {selectedNode && (
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #e5e7eb',
            borderRadius: '16px',
            padding: '14px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            minWidth: '180px',
            animation: 'fadeInUp 0.3s ease-out'
          }}>
            <p style={{ fontWeight: '700', fontSize: '14px', color: '#1f2937', marginBottom: '6px' }}>
              {selectedNode.name}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                📂 {selectedNode.category}
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                ❤️ {selectedNode.likeCount} likes
              </span>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                👥 {selectedNode.followerCount} followers
              </span>
              <span style={{ fontSize: '12px', fontWeight: '700',
                background: 'linear-gradient(to right, #ec4899, #a855f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                ⚡ Score: {selectedNode.engagementScore}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{
                position: 'absolute', top: '8px', right: '10px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '16px', color: '#9ca3af'
              }}
            >×</button>
          </div>
        )}
      </div>

      {/* Category Legend */}
      <div style={{
        marginTop: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {Object.entries(categoryColors)
          .filter(([cat]) => brands.some(b => b.category === cat))
          .map(([cat, color]) => (
            <div key={cat} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              padding: '3px 10px',
              fontSize: '11px',
              color: '#374151',
              fontWeight: '500'
            }}>
              <div style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                backgroundColor: color,
                flexShrink: 0
              }} />
              {cat}
            </div>
          ))}
      </div>
    </div>
  );
};

export default NetworkGraph;