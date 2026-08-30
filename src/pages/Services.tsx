import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { mockServices, ServiceItem } from '../mock/data';
import { Search, ChevronRight, Eye, FileText, LayoutList, CheckCircle2, ArrowRight } from 'lucide-react';

export const Services: React.FC = () => {
  const { setNlQuery, setWorkflowStep } = useDemo();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'personal', label: 'Certificates' },
    { id: 'address', label: 'Address & Identity' },
    { id: 'food', label: 'Food & Civil Supplies' },
    { id: 'rural', label: 'Rural Services' },
    { id: 'benefits', label: 'Benefits & Schemes' }
  ];

  const filteredServices = mockServices.filter(svc => {
    const matchesSearch = svc.name.toLowerCase().includes(search.toLowerCase()) || 
                          svc.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || svc.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartRequest = (svc: ServiceItem) => {
    setNlQuery(`Manual Selection: ${svc.name}`);
    setWorkflowStep('DEPT_PREVIEW');
    navigate('/workflow');
  };

  return (
    <div className="space-y-6 py-2">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Government Services Registry</h1>
        <p className="text-xs text-slate-550 font-semibold mt-1">
          Explore and launch coordinated services. GovMesh aggregates departmental processes into single consent-driven workflows.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search for service, department, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-gov-secondary bg-white shadow-gov-sm transition"
          />
        </div>

        {/* Categories toggler */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedService(null);
              }}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition border ${
                activeCategory === cat.id
                  ? 'bg-gov-primary text-white border-gov-primary shadow-gov-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Service cards catalog */}
        <div className="lg:col-span-2 space-y-4">
          {filteredServices.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs shadow-gov-sm">
              No services found matching search query filters.
            </div>
          ) : (
            filteredServices.map(svc => {
              const isSelected = selectedService?.id === svc.id;
              return (
                <div
                  key={svc.id}
                  className={`bg-white border rounded-xl p-5 shadow-gov-sm hover:shadow-gov-md transition flex flex-col md:flex-row md:items-start justify-between gap-4 cursor-pointer ${
                    isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedService(svc)}
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                        {svc.name}
                      </h3>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          svc.availability === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                          svc.availability === 'High Load' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-650'
                        }`}
                      >
                        {svc.availability}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                      {svc.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-450 font-bold">
                      <span>Departments:</span>
                      {svc.departments.map((dept, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {dept.replace(" Department", "")}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex sm:flex-row md:flex-col items-stretch gap-2 shrink-0 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(svc);
                      }}
                      className="px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1 bg-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartRequest(svc);
                      }}
                      className="px-3.5 py-2 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-gov-sm transition"
                    >
                      <span>Start Request</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Service Detailed Preview Panel */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-450">
            Service Details Overview
          </h3>

          {selectedService ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-gov-sm space-y-4">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wide">
                  {selectedService.name}
                </h4>
                <p className="text-[10px] text-slate-450 mt-0.5 leading-normal">
                  Details for coordinated service workflow ID: <code className="font-mono bg-slate-50 px-1 rounded text-gov-primary">{selectedService.id.toUpperCase()}_WF</code>
                </p>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Purpose */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">
                    Purpose of sharing
                  </span>
                  <p className="text-slate-600 leading-relaxed font-semibold">
                    {selectedService.purpose}
                  </p>
                </div>

                {/* Estimate */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">
                    Estimated Duration
                  </span>
                  <span className="font-bold text-slate-850">
                    {selectedService.estimatedTime}
                  </span>
                </div>

                {/* Req Docs */}
                <div className="space-y-1">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">
                    Required Supporting Docs
                  </span>
                  <ul className="list-disc list-inside space-y-1 font-semibold text-slate-600 pl-1">
                    {selectedService.requiredDocs.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>

                {/* Coordination workflow roadmap */}
                <div className="space-y-2 border-t border-slate-100 pt-3.5">
                  <span className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">
                    Coordination Pipeline
                  </span>
                  <div className="space-y-2.5">
                    {selectedService.departments.map((dept, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] font-bold text-slate-700">
                        <span className="w-4 h-4 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0 text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <span>{dept}</span>
                          <span className="block text-[9px] text-slate-450 font-normal mt-0.5">
                            {idx === 0 ? 'Verification and master records update' :
                             idx === 1 ? 'Subsidy database update & quota calculations' :
                             'Local panchayat administration database synchronization'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <button
                onClick={() => handleStartRequest(selectedService)}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-gov-primary hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-gov-sm transition border"
              >
                <span>Initiate Service Workflow</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs shadow-gov-sm">
              Click "Details" on any service to inspect sharing policies, mandatory documents, and routing roadmap.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
