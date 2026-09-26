// AuraFinance OS — Largest-Triangle-Three-Buckets (LTTB) Downsampling Algorithm
// Downsamples time-series chart data points from 1,000+ points down to target points (e.g., 12 - 30)
// Preserves critical local minima/maxima and visual trend fidelity while eliminating SVG DOM bloat.

export interface Point {
  x: number;
  y: number;
  [key: string]: any;
}

/**
 * Downsamples an array of points using the Largest-Triangle-Three-Buckets (LTTB) algorithm.
 *
 * @param data Array of data items containing x and y coordinates (or objects with custom keys)
 * @param threshold Target count of visual points to produce
 * @param xKey Key for x-axis value (default: 'x')
 * @param yKey Key for y-axis value (default: 'y')
 */
export function downsampleLTTB<T extends Record<string, any>>(
  data: T[],
  threshold: number,
  xKey: keyof T = 'x',
  yKey: keyof T = 'y'
): T[] {
  if (!data || data.length === 0) return [];
  if (threshold >= data.length || threshold <= 2) {
    return data;
  }

  const sampled: T[] = [];
  const dataLength = data.length;

  // Bucket size. Leave room for start and end data points
  const every = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially point A is the first point
  sampled.push(data[a]);

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (bucket C)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * every) + 1;
    let avgRangeEnd = Math.floor((i + 2) * every) + 1;
    avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (let idx = avgRangeStart; idx < avgRangeEnd; idx++) {
      avgX += Number(data[idx][xKey]) || 0;
      avgY += Number(data[idx][yKey]) || 0;
    }

    if (avgRangeLength > 0) {
      avgX /= avgRangeLength;
      avgY /= avgRangeLength;
    }

    // Get the range for this bucket (bucket B)
    const rangeOffs = Math.floor(i * every) + 1;
    const rangeTo = Math.floor((i + 1) * every) + 1;

    // Point a coordinates
    const pointAx = Number(data[a][xKey]) || 0;
    const pointAy = Number(data[a][yKey]) || 0;

    let maxArea = -1;
    let maxAreaPointIndex = rangeOffs;

    for (let idx = rangeOffs; idx < rangeTo; idx++) {
      if (idx >= dataLength) break;
      const currentX = Number(data[idx][xKey]) || 0;
      const currentY = Number(data[idx][yKey]) || 0;

      // Area of triangle formed by (pointAx, pointAy), (currentX, currentY), and (avgX, avgY)
      const area =
        Math.abs(
          (pointAx - avgX) * (currentY - pointAy) - (pointAx - currentX) * (avgY - pointAy)
        ) * 0.5;

      if (area > maxArea) {
        maxArea = area;
        maxAreaPointIndex = idx;
      }
    }

    sampled.push(data[maxAreaPointIndex]); // Next point is the one that gives the largest area
    a = maxAreaPointIndex; // This point becomes the new point A
  }

  // Always include the last point
  sampled.push(data[dataLength - 1]);

  return sampled;
}
