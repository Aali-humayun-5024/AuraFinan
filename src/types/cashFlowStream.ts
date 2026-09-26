// AuraFinance OS — Live Cash-Flow Particle Stream Types
// Mathematical physics & layout specifications for Sankey-Canvas Hybrid

export interface StreamNode {
  id: string;
  label: string;
  amount: number;
  currency: string;
  type: 'inflow' | 'clearing' | 'needs' | 'wants' | 'savings';
  x: number; // percentage 0-100% of canvas width
  y: number; // percentage 0-100% of canvas height
  color: string;
}

export interface StreamChannel {
  id: string;
  sourceId: string;
  targetId: string;
  amount: number;
  percentageOfParent: number;
  color: string;
}

export interface FlowParticle {
  channelId: string;
  progress: number; // 0.0 to 1.0 along bezier curve
  speed: number;
  size: number;
  color: string;
  alpha: number;
}
