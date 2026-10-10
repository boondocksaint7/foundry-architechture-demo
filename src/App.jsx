import React, { useState, useEffect } from 'react';
   import { 
     Terminal, 
     Database, 
     Layers, 
     Cpu, 
     Truck, 
     AlertTriangle, 
     CheckCircle2, 
     Search, 
     Filter, 
     Info, 
     Code2, 
     Activity, 
     Zap, 
     Box, 
     ShieldCheck,
     RefreshCw,
     Play
   } from 'lucide-react';

   export default function App() {
     const [activeTab, setActiveTab] = useState('liveApp');
     const [selectedId, setSelectedId] = useState('SHP-8921');
     const [isExecuting, setIsExecuting] = useState(false);
     const [successMsg, setSuccessMsg] = useState(null);

     const mockShipments = [
       { shipmentId: 'SHP-8921', carrier: 'Apex Express', status: 'DELAYED_WEATHER', destination: 'Chicago Hub', risk: 0.88 },
       { shipmentId: 'SHP-4402', carrier: 'Swift Intermodal', status: 'IN_TRANSIT', destination: 'Atlanta Center', risk: 0.12 }
     ];

     const handleAction = (e) => {
       e.preventDefault();
       setIsExecuting(true);
       setSuccessMsg(null);
       setTimeout(() => {
         setIsExecuting(false);
         setSuccessMsg('Action executed successfully via OSDK Ontology Write-Back.');
       }, 1000);
     };

     return (
       <div className="min-h-screen bg-[#070A10] text-slate-100 font-sans flex flex-col">
         <header className="border-b border-slate-800 bg-[#0B0F19] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
           <div className="flex items-center gap-3">
             <div className="h-9 w-9 rounded-xl bg-cyan-500 flex items-center justify-center text-black font-bold">
               <Box className="w-5 h-5" />
             </div>
             <div>
               <h1 className="text-sm font-bold tracking-wider text-white">VRL SHIPMENT NETWORK (OSDK)</h1>
               <p className="text-[11px] text-slate-400">Package: @vrl-shipment-network/sdk v0.2.0</p>
             </div>
           </div>
           <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
             <button onClick={() => setActiveTab('liveApp')} className={`px-3 py-1.5 rounded-lg font-semibold ${activeTab === 'liveApp' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}>Interactive App</button>
             <button onClick={() => setActiveTab('code')} className={`px-3 py-1.5 rounded-lg font-semibold ${activeTab === 'code' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}>OSDK Code</button>
           </div>
         </header>

         {activeTab === 'liveApp' ? (
           <div className="flex-1 grid lg:grid-cols-12 p-6 gap-6">
             <div className="lg:col-span-7 space-y-4">
               <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Ontology Object Set: Shipment</h2>
               {mockShipments.map(s => (
                 <div key={s.shipmentId} onClick={() => setSelectedId(s.shipmentId)} className={`p-4 rounded-xl border cursor-pointer ${selectedId === s.shipmentId ? 'bg-slate-800 border-cyan-400' : 'bg-slate-900 border-slate-800'}`}>
                   <div className="flex justify-between font-mono font-bold">
                     <span>{s.shipmentId}</span>
                     <span className="text-amber-400 text-xs">{s.status}</span>
                   </div>
                   <p className="text-xs text-slate-400 mt-1">{s.carrier} — Dest: {s.destination}</p>
                 </div>
               ))}
             </div>
             <div className="lg:col-span-5 bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
               <h3 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                 <Zap className="w-4 h-4 text-amber-400" /> Action Type: rerouteShipment
               </h3>
               <form onSubmit={handleAction} className="space-y-3 text-xs">
                 <div>
                   <label className="block text-slate-400 mb-1">Target Object ID</label>
                   <input type="text" readOnly value={selectedId} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-cyan-300 font-mono" />
                 </div>
                 <button type="submit" disabled={isExecuting} className="w-full py-2.5 bg-cyan-500 text-black font-semibold rounded hover:bg-cyan-400">
                   {isExecuting ? 'Writing back to Ontology...' : 'Apply Reroute Action'}
                 </button>
               </form>
               {successMsg && <div className="p-3 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded">{successMsg}</div>}
             </div>
           </div>
         ) : (
           <div className="p-8 max-w-4xl mx-auto space-y-4">
             <h2 className="text-sm font-mono text-cyan-400">Generated OSDK TypeScript Code</h2>
             <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
   {`import { client } from "./client";
   import { Shipment, rerouteShipment } from "@vrl-shipment-network/sdk";

   export async function getShipments() {
     return await client(Shipment).fetchPage();
   }

   export async function executeReroute(shipmentObj, newDest) {
     return await client(rerouteShipment)({
       shipment: shipmentObj,
       destination: newDest
     });
   }`}
             </pre>
           </div>
         )}
       </div>
     );
   }
