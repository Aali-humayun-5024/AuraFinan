// AuraFinance OS — Cash Flow Waterfall & Direct Engine View
import CashFlowVisual from '../components/cashflow/CashFlowVisual';

export default function CashFlowEngineView() {
  return (
    <div className="w-full flex-1 flex flex-col min-h-0 overflow-y-auto">
      <CashFlowVisual />
    </div>
  );
}
