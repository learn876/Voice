import React from "react";

export function ServiceBars() {
  const services = [
    { name: "PPF (Paint Protection)", value: 65, width: "65%" },
    { name: "Ceramic Coating", value: 20, width: "20%" },
    { name: "Interior Deep Clean", value: 45, width: "45%" },
    { name: "Exterior Wash", value: 10, width: "10%" },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
      <h3 className="text-sm font-bold text-slate-800 pb-2">
        Service Booking Statistics
      </h3>

      <div className="space-y-3.5 my-auto">
        {services.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-600">
              <span>{item.name}</span>
              <span className="font-semibold text-slate-800">{item.value}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#10b981] transition-all duration-500"
                style={{ width: item.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-[10px] font-medium text-slate-400 pt-3 border-t border-slate-100">
        <span>0</span>
        <span>10</span>
        <span>20</span>
        <span>30</span>
        <span>40</span>
        <span>50</span>
        <span>60</span>
      </div>
    </div>
  );
}
