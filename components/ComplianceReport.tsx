import React, { useMemo, useState } from 'react';
import { AnalysisReport, ComplianceFinding, ComplianceStatus } from '../types';
import { AlertTriangle, CheckCircle2, XCircle, Info, FileText, ChevronRight, Download, List, Eye, Maximize2, Search, Filter, ArrowUpDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface ComplianceReportProps {
  report: AnalysisReport;
  onConsult: (context: string) => void;
}

const StatusIcon = ({ status }: { status: ComplianceStatus }) => {
  switch (status) {
    case ComplianceStatus.PASS: return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case ComplianceStatus.FAIL: return <XCircle className="w-5 h-5 text-red-500" />;
    case ComplianceStatus.WARNING: return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    default: return <Info className="w-5 h-5 text-blue-500" />;
  }
};

type SortOption = 'SEVERITY' | 'REFERENCE' | 'CATEGORY';

const ComplianceReport: React.FC<ComplianceReportProps> = ({ report, onConsult }) => {
  const [activeFindingId, setActiveFindingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('SEVERITY');

  const stats = {
    pass: report.findings.filter(f => f.status === ComplianceStatus.PASS).length,
    fail: report.findings.filter(f => f.status === ComplianceStatus.FAIL).length,
    warning: report.findings.filter(f => f.status === ComplianceStatus.WARNING).length,
    info: report.findings.filter(f => f.status === ComplianceStatus.NEEDS_CLARIFICATION).length,
  };

  const data = [
    { name: 'Pass', value: stats.pass, color: '#22c55e' },
    { name: 'Fail', value: stats.fail, color: '#ef4444' },
    { name: 'Warning', value: stats.warning, color: '#f59e0b' },
  ];

  // Process findings: Filter -> Sort -> Group
  const processedFindings = useMemo(() => {
    let result = report.findings;

    // 1. Filter by Status
    if (filterStatus !== 'ALL') {
      result = result.filter(f => f.status === filterStatus);
    }

    // 2. Filter by Search Text
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter(f => 
        f.description.toLowerCase().includes(lowerSearch) || 
        f.reference.toLowerCase().includes(lowerSearch) ||
        f.category.toLowerCase().includes(lowerSearch)
      );
    }

    // 3. Sort
    result = [...result].sort((a, b) => {
      if (sortBy === 'REFERENCE') {
        return a.reference.localeCompare(b.reference);
      } else if (sortBy === 'SEVERITY') {
        const severityOrder = {
          [ComplianceStatus.FAIL]: 0,
          [ComplianceStatus.WARNING]: 1,
          [ComplianceStatus.NEEDS_CLARIFICATION]: 2,
          [ComplianceStatus.PASS]: 3
        };
        return severityOrder[a.status] - severityOrder[b.status];
      }
      return 0;
    });

    return result;
  }, [report.findings, filterStatus, searchText, sortBy]);

  // Group the processed findings
  const groupedFindings = useMemo(() => {
    const groups: Record<string, ComplianceFinding[]> = {};
    processedFindings.forEach(finding => {
      const cat = finding.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(finding);
    });
    return groups;
  }, [processedFindings]);

  const categories = Object.keys(groupedFindings).sort();

  const scrollToSection = (id: string) => {
     const element = document.getElementById(id);
     if (element) {
       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
     }
  };

  const handleFindingClick = (id: string) => {
    setActiveFindingId(id);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* Header Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row gap-6 justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-slate-900">Compliance Report</h2>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-mono">
              {report.fileName}
            </span>
          </div>
          <p className="text-slate-500 max-w-xl">{report.summary}</p>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">{report.overallScore}/100</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide">Score</div>
           </div>
           <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Download className="w-4 h-4" /> Export PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: TOC & Chart (3/12 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Breakdown</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{fontSize: '12px'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
             <div className="flex items-center gap-2 mb-4 text-slate-900">
               <List className="w-5 h-5" />
               <h3 className="font-semibold">Contents</h3>
             </div>
             <nav className="space-y-1">
                {categories.length > 0 ? categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => scrollToSection(`cat-${cat.replace(/\s+/g, '-')}`)}
                    className="flex items-center w-full text-left text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all group"
                  >
                     <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 mr-3 flex-shrink-0"></div>
                     <span className="truncate">{cat}</span>
                     <span className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-white flex-shrink-0">
                       {groupedFindings[cat].length}
                     </span>
                  </button>
                )) : (
                  <p className="text-xs text-slate-400 italic px-3">No matching sections</p>
                )}
             </nav>
          </div>
        </div>

        {/* Middle Column: Findings List (4/12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4">
             {/* Search */}
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter by code or description..." 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
             </div>
             
             {/* Filters & Sort */}
             <div className="flex flex-col gap-3">
               <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                 {[
                   { id: 'ALL', label: 'All' },
                   { id: ComplianceStatus.FAIL, label: 'Fail' },
                   { id: ComplianceStatus.WARNING, label: 'Warning' },
                   { id: ComplianceStatus.PASS, label: 'Pass' },
                 ].map((opt) => (
                   <button
                     key={opt.id}
                     onClick={() => setFilterStatus(opt.id as any)}
                     className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                       ${filterStatus === opt.id 
                         ? 'bg-slate-900 text-white' 
                         : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
               
               <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter className="w-3 h-3" />
                    <span>{processedFindings.length} findings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Sort by:</span>
                    <select 
                      value={sortBy} 
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="text-xs border-none bg-transparent font-medium text-slate-700 focus:ring-0 cursor-pointer"
                    >
                      <option value="SEVERITY">Severity</option>
                      <option value="REFERENCE">Reference</option>
                    </select>
                  </div>
               </div>
             </div>
          </div>

          {categories.length === 0 && (
             <div className="text-center p-10 text-slate-500 bg-white rounded-xl border border-slate-200">
               No findings match your filters.
             </div>
          )}

          {categories.map(cat => (
            <div key={cat} id={`cat-${cat.replace(/\s+/g, '-')}`} className="scroll-mt-6">
               <div className="flex items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-800">{cat}</h3>
                 <div className="ml-4 h-px bg-slate-200 flex-1"></div>
               </div>
               
               <div className="space-y-3">
                 {groupedFindings[cat].map((finding) => (
                    <div 
                      key={finding.id}
                      onClick={() => handleFindingClick(finding.id)}
                      className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all cursor-pointer
                        ${activeFindingId === finding.id 
                          ? 'border-blue-500 ring-2 ring-blue-100 shadow-md translate-x-1' 
                          : 'border-slate-200 hover:border-blue-300 hover:shadow-md'}`}
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <StatusIcon status={finding.status} />
                          <span className={`px-2 py-0.5 rounded-xs font-bold uppercase text-[10px] tracking-wider
                            ${finding.status === ComplianceStatus.FAIL ? 'bg-red-100 text-red-700' : 
                              finding.status === ComplianceStatus.WARNING ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'}`}>
                            {finding.status}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-slate-900 text-sm mb-2">{finding.description}</h4>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                            <FileText className="w-3 h-3 mr-1" /> {finding.reference}
                          </span>
                        </div>

                        {activeFindingId === finding.id && (
                          <div className="animate-fadeIn">
                             <p className="text-slate-600 text-xs mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                                <span className="font-semibold text-slate-700">Fix:</span> {finding.recommendation}
                             </p>
                             <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onConsult(`Regarding the finding "${finding.description}" (Ref: ${finding.reference}): ${finding.recommendation}. Can you explain?`);
                                }}
                                className="text-blue-600 text-xs font-medium hover:text-blue-800 flex items-center"
                              >
                                Consult AI <ChevronRight className="w-3 h-3 ml-1" />
                              </button>
                          </div>
                        )}
                      </div>
                    </div>
                 ))}
               </div>
            </div>
          ))}
        </div>

        {/* Right Column: Drawing Visualization (5/12 cols) */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" /> Drawing Visualization
                  </h3>
                  <button className="p-1 text-slate-400 hover:text-slate-700">
                    <Maximize2 className="w-4 h-4" />
                  </button>
               </div>
               
               <div className="relative bg-slate-900 min-h-[400px] flex items-center justify-center overflow-hidden group">
                  {report.imageBase64 ? (
                    <div className="relative w-full">
                       <img 
                          src={`data:image/jpeg;base64,${report.imageBase64}`} 
                          alt="Analyzed Drawing"
                          className="w-full h-auto object-contain block opacity-90" 
                       />
                       
                       {/* SVG Overlay */}
                       <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {processedFindings.map((finding) => {
                            if (!finding.boundingBox) return null;
                            const [ymin, xmin, ymax, xmax] = finding.boundingBox;
                            const width = (xmax - xmin) * 100;
                            const height = (ymax - ymin) * 100;
                            const x = xmin * 100;
                            const y = ymin * 100;

                            const isActive = activeFindingId === finding.id;
                            const color = finding.status === ComplianceStatus.PASS ? '#22c55e' : finding.status === ComplianceStatus.FAIL ? '#ef4444' : '#f59e0b';

                            return (
                              <g key={finding.id} className="pointer-events-auto cursor-pointer" onClick={() => handleFindingClick(finding.id)}>
                                <rect
                                  x={`${x}%`}
                                  y={`${y}%`}
                                  width={`${width}%`}
                                  height={`${height}%`}
                                  fill={isActive ? color : 'transparent'}
                                  fillOpacity={isActive ? 0.2 : 0}
                                  stroke={color}
                                  strokeWidth={isActive ? 1 : 0.5}
                                  vectorEffect="non-scaling-stroke"
                                  className="transition-all duration-200 hover:stroke-[1px] hover:fill-opacity-10"
                                />
                                {isActive && (
                                   <rect
                                     x={`${x - 1}%`}
                                     y={`${y - 1}%`}
                                     width={`${width + 2}%`}
                                     height={`${height + 2}%`}
                                     fill="none"
                                     stroke={color}
                                     strokeWidth={0.5}
                                     strokeDasharray="2"
                                     className="animate-pulse"
                                   />
                                )}
                              </g>
                            );
                          })}
                       </svg>

                       {/* Hover Info (Optional, simpler to rely on list interaction for now) */}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">Image data not available</div>
                  )}
               </div>
               <div className="p-3 bg-slate-50 text-xs text-slate-500 border-t border-slate-100 flex justify-between">
                  <span>Click boxes to view details</span>
                  <span>{processedFindings.filter(f => f.boundingBox).length} zones visible</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ComplianceReport;