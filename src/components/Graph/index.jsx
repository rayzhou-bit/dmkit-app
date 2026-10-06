import React from 'react';

import { useGraphHooks } from './hooks';
import { NODE_RADIUS } from '../../utils/graphLayout';

import '../../constants/colors.scss';
import './index.scss';

const ARROW_MARKER_ID = 'card-graph-arrowhead';

const GraphIcon = () => (
  <svg viewBox='0 0 24 24' aria-hidden='true'>
    <line x1='6' y1='18' x2='12' y2='6' />
    <line x1='12' y1='6' x2='18' y2='18' />
    <circle cx='6' cy='18' r='3' />
    <circle cx='12' cy='6' r='3' />
    <circle cx='18' cy='18' r='3' />
  </svg>
);

// Tab colours. Deliberately not the card palette - a ring says "this tab",
// a dot says "this card", and reusing one set of hues for both would read as
// a relationship that isn't there.
const RING_HUES = ['#5BC5FF', '#F2A65A', '#8FBF6F', '#B18FD9', '#E2778F', '#6FB7B7'];

const GraphNode = ({ node, onNodeClick }) => {
  const activate = () => onNodeClick(node.id);
  return (
    <g
      className='card-graph-node'
      data-card-id={node.id}
      role='button'
      tabIndex={0}
      aria-label={node.title || 'Untitled card'}
      onClick={activate}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') activate(); }}
    >
      {/* Hit area over the dot and its label. Without it a click landing
          between the two (the <g>'s own bounding-box centre, which is what a
          pointer naturally targets) falls through to whatever is underneath.
          fill="transparent", not "none", so it still hit-tests. */}
      <rect
        className='card-graph-node-hit'
        x={node.labelAnchor === 'end' ? node.labelX - 130 : node.labelX - 6}
        y={node.labelY - 9}
        width={136}
        height={18}
        transform={`rotate(${node.labelRotation} ${node.labelX} ${node.labelY})`}
        fill='transparent'
      />
      {node.isShared && (
        <circle className='card-graph-node-ring' cx={node.x} cy={node.y} r={NODE_RADIUS + 3} />
      )}
      <circle className={`card-graph-node-fill ${node.color}`} cx={node.x} cy={node.y} r={NODE_RADIUS} />
      <text
        x={node.labelX}
        y={node.labelY}
        textAnchor={node.labelAnchor}
        dominantBaseline='middle'
        transform={`rotate(${node.labelRotation} ${node.labelX} ${node.labelY})`}
      >
        {node.title}
      </text>
    </g>
  );
};

// Rendered by Library, not here: the button belongs in the same rail as the
// library button so it tracks the panel as it slides, instead of sitting on
// top of the panel's contents.
export const GraphButton = () => {
  const { showButton, toggleGraph } = useGraphHooks();
  return (
    <button
      className='graph-btn'
      style={{ display: showButton ? 'block' : 'none' }}
      onClick={toggleGraph}
      aria-label='Card graph'
    >
      <GraphIcon />
      <span className='tooltip'>Card graph</span>
    </button>
  );
};

const Graph = () => {
  const { isOpen, toggleGraph, nodes, rings, edges, width, height, centre, onNodeClick } = useGraphHooks();

  const nodesById = React.useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);
  const hasNodes = nodes.length > 0;
  const hasEdges = edges.length > 0;

  return (
    <>
      {isOpen && (
        <>
        {/* Without this the ToolMenu shows through the panel's 24px gutter,
            sliced down its middle. Dimming it reads as a lens over the app
            and gives click-away-to-close, same as the mobile create sheet. */}
        <div className='card-graph-backdrop' onClick={toggleGraph} />
        <div className='card-graph-panel'>
          <button className='card-graph-close' onClick={toggleGraph} aria-label='Close card graph'>&#215;</button>
          {!hasNodes ? (
            <div className='card-graph-empty'>
              <p>No cards yet.</p>
              <p className='hint'>Add some cards to see how they connect.</p>
            </div>
          ) : (
            <>
              {!hasEdges && (
                <p className='card-graph-caption'>No references between cards yet.</p>
              )}
              <div className='card-graph-svg-wrap'>
                <svg
                  className='card-graph-svg'
                  viewBox={`0 0 ${Math.max(width, 1)} ${Math.max(height, 1)}`}
                  preserveAspectRatio='xMidYMid meet'
                  role='img'
                  aria-label='Card reference graph'
                >
                  <defs>
                    <marker
                      id={ARROW_MARKER_ID}
                      viewBox='0 0 10 10'
                      refX='8'
                      refY='5'
                      markerWidth='6'
                      markerHeight='6'
                      orient='auto-start-reverse'
                    >
                      <path className='card-graph-arrowhead' d='M 0 0 L 10 5 L 0 10 z' />
                    </marker>
                  </defs>

                  {rings.map((ring, i) => (
                    <g key={ring.id} className='card-graph-ring' style={{ color: RING_HUES[i % RING_HUES.length] }}>
                      <circle className='card-graph-ring-track' cx={centre} cy={centre} r={ring.radius} />
                      {ring.arcs.map((d, j) => (
                        <path key={j} className='card-graph-ring-arc' d={d} />
                      ))}
                    </g>
                  ))}

                  {edges.map((edge, i) => {
                    const source = nodesById[edge.source];
                    const target = nodesById[edge.target];
                    if (!source || !target) return null;
                    // Quadratic through the centre: every chord bows inward,
                    // so edges stay in the empty middle and never reach the
                    // labels outside the ring.
                    return (
                      <path
                        key={`${edge.source}->${edge.target}-${i}`}
                        className='card-graph-edge'
                        d={`M${source.x} ${source.y} Q${centre} ${centre} ${target.x} ${target.y}`}
                        markerEnd={`url(#${ARROW_MARKER_ID})`}
                      />
                    );
                  })}

                  {nodes.map(node => (
                    <GraphNode key={node.id} node={node} onNodeClick={onNodeClick} />
                  ))}
                </svg>
              </div>
              <ul className='card-graph-legend'>
                {rings.map((ring, i) => (
                  <li key={ring.id}>
                    <span className='swatch' style={{ backgroundColor: RING_HUES[i % RING_HUES.length] }} />
                    {ring.title || 'Untitled'}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        </>
      )}
    </>
  );
};

export default Graph;
