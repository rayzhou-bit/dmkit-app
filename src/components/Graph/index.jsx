import React from 'react';

import { useGraphHooks } from './hooks';
import { NODE_RADIUS, LABEL_WIDTH } from '../../utils/graphLayout';

import '../../constants/colors.scss';
import './index.scss';

const ARROW_MARKER_ID = 'card-graph-arrowhead';

// Trims both ends of a source->target line to the node circles' own
// boundary (rather than drawing center-to-center) so the arrowhead marker
// always lands in open space, whichever of edge/node ends up on top.
const trimToNodes = (source, target, radius) => {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  return {
    x1: source.x + ux * radius,
    y1: source.y + uy * radius,
    x2: target.x - ux * radius,
    y2: target.y - uy * radius,
  };
};

const GraphIcon = () => (
  <svg viewBox='0 0 24 24' aria-hidden='true'>
    <line x1='6' y1='18' x2='12' y2='6' />
    <line x1='12' y1='6' x2='18' y2='18' />
    <circle cx='6' cy='18' r='3' />
    <circle cx='12' cy='6' r='3' />
    <circle cx='18' cy='18' r='3' />
  </svg>
);

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
      {/* Invisible hit area spanning the dot + its label (LABEL_WIDTH is
          graphLayout's own "node + title" cell width) - without this, a
          click landing in the gap between the small dot and its text (the
          <g>'s own bounding-box center, which is what a pointer naturally
          targets) falls through to the group rect underneath instead of
          registering on this node. fill="transparent" (not "none") so it
          still hit-tests under the SVG default pointer-events value. */}
      <rect
        className='card-graph-node-hit'
        x={node.x - NODE_RADIUS - 2}
        y={node.y - NODE_RADIUS * 1.5}
        width={LABEL_WIDTH - NODE_RADIUS - 2}
        height={NODE_RADIUS * 3}
        fill='transparent'
      />
      {node.isShared && (
        <circle className='card-graph-node-ring' cx={node.x} cy={node.y} r={NODE_RADIUS + 3} />
      )}
      <circle className={`card-graph-node-fill ${node.color}`} cx={node.x} cy={node.y} r={NODE_RADIUS} />
      <text x={node.x + NODE_RADIUS + 4} y={node.y + 4}>{node.title}</text>
    </g>
  );
};

const Graph = () => {
  const { showButton, isOpen, toggleGraph, nodes, groups, edges, width, height, onNodeClick } = useGraphHooks();

  const nodesById = React.useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);
  const hasNodes = nodes.length > 0;
  const hasEdges = edges.length > 0;

  return (
    <>
      <button
        className='graph-btn'
        style={{ display: showButton ? 'block' : 'none' }}
        onClick={toggleGraph}
        aria-label='Card graph'
      >
        <GraphIcon />
        <span className='tooltip'>Card graph</span>
      </button>

      {isOpen && (
        <div className='card-graph-panel'>
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

                  {groups.map(group => (
                    <g key={group.id} className='card-graph-group'>
                      <rect x={group.x} y={group.y} width={group.width} height={group.height} rx={10} />
                      <text x={group.x + 18} y={group.y + 24}>{group.title}</text>
                    </g>
                  ))}

                  {edges.map((edge, i) => {
                    const source = nodesById[edge.source];
                    const target = nodesById[edge.target];
                    if (!source || !target) return null;
                    const { x1, y1, x2, y2 } = trimToNodes(source, target, NODE_RADIUS);
                    return (
                      <line
                        key={`${edge.source}->${edge.target}-${i}`}
                        className='card-graph-edge'
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        markerEnd={`url(#${ARROW_MARKER_ID})`}
                      />
                    );
                  })}

                  {nodes.map(node => (
                    <GraphNode key={node.id} node={node} onNodeClick={onNodeClick} />
                  ))}
                </svg>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Graph;
