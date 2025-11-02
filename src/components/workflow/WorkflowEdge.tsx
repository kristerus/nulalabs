import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
} from "@xyflow/react";

/**
 * Custom edge component for parallel relationships
 * Shows dashed lines for parallel analyses
 */
export function ParallelEdge(props: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={props.markerEnd}
        style={{
          stroke: "#6b7280",
          strokeWidth: 2,
          strokeDasharray: "5,5",
        }}
      />
      {props.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 10,
              pointerEvents: "all",
            }}
            className="bg-background px-2 py-1 rounded border text-xs text-muted-foreground"
          >
            {props.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
