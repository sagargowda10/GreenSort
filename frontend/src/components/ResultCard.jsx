import React from 'react';
import { CheckCircle, AlertTriangle, Trash2, Recycle, Coins, Scale } from 'lucide-react';

const ResultCard = ({ result }) => {
  // Choose color based on category
  let colorClass = "bg-gray-100 border-gray-200";
  let Icon = CheckCircle;
  
  if (result.category === 'Recyclable') {
    colorClass = "bg-green-50 border-green-200 text-recycle-green";
    Icon = Recycle;
  } else if (result.category === 'Compost') {
    colorClass = "bg-amber-50 border-amber-200 text-amber-600";
    Icon = Recycle; 
  } else if (result.category === 'Trash') {
    colorClass = "bg-red-50 border-red-200 text-red-500";
    Icon = Trash2;
  }

  return (
    <div className="mt-8 animate-fade-in">
      <div className={`p-6 rounded-xl border-2 ${colorClass}`}>
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Icon className="w-8 h-8" />
          <div>
            <h3 className="text-2xl font-bold font-heading capitalize">{result.label}</h3>
            <span className="font-medium opacity-80">{result.category}</span>
          </div>
        </div>
        
        {/* --- 🟢 NEW: ESTIMATION SECTION --- */}
        <div className="flex gap-3 mb-4">
           {/* Price Box */}
           <div className="bg-white p-3 rounded-lg shadow-sm flex-1 border border-gray-100">
              <div className="flex items-center gap-2 mb-1 opacity-70">
                 <Coins className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase">Est. Value</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{result.estimatedValue || '₹0'}</p>
           </div>

           {/* Weight Box */}
           <div className="bg-white p-3 rounded-lg shadow-sm flex-1 border border-gray-100">
              <div className="flex items-center gap-2 mb-1 opacity-70">
                 <Scale className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase">Weight</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{result.estimatedWeight || 'Unknown'}</p>
           </div>
        </div>

        {/* Action Box */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <h4 className="font-bold text-charcoal mb-1">Action Needed:</h4>
          <p className="text-lg text-recycle-green font-semibold">{result.disposalAction}</p>
        </div>

        {/* Footer */}
        <div className="text-sm text-gray-600">
          <p><strong>Tip:</strong> {result.handlingTips}</p>
          <p className="mt-2 text-xs opacity-50">Confidence: {(result.confidence * 100).toFixed(0)}%</p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;