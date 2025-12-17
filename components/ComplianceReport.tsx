import React, { useMemo, useState, useRef, useEffect } from 'react';
import { AnalysisReport, ComplianceFinding, ComplianceStatus } from '../types';
import { AlertTriangle, CheckCircle2, XCircle, Info, FileText, ChevronRight, Download, List, Eye, EyeOff, Maximize2, Search, Filter, Layers, X, Loader2, Check } from 'lucide-react';
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
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'ALL'>('ALL');
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('SEVERITY');
  
  // Layer Management State
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [showBaseLayer, setShowBaseLayer] = useState(true);
  const layerMenuRef = useRef<HTMLDivElement>(null);

  // Drawing Search State
  const [drawingSearch, setDrawingSearch] = useState('');
  const [isDrawingSearchExpanded, setIsDrawingSearchExpanded] = useState(false);
  const drawingSearchInputRef = useRef<HTMLInputElement>(null);

  // Export State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    orientation: 'portrait' as 'portrait' | 'landscape',
    includeSummary: true,
    includeCharts: true,
    includeBoundingBoxes: false,
  });
  const [exportCategories, setExportCategories] = useState<string[]>([]);
  const [exportStatuses, setExportStatuses] = useState<ComplianceStatus[]>([
    ComplianceStatus.FAIL,
    ComplianceStatus.WARNING,
    ComplianceStatus.NEEDS_CLARIFICATION,
    ComplianceStatus.PASS
  ]);

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

  // Get all unique categories for the layer manager & export
  const allCategories = useMemo(() => {
    return Array.from(new Set(report.findings.map(f => f.category || 'General'))).sort();
  }, [report.findings]);

  // Initialize export categories when data loads
  useEffect(() => {
    if (allCategories.length > 0 && exportCategories.length === 0) {
        setExportCategories(allCategories);
    }
  }, [allCategories]);

  // Close layer menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerMenuRef.current && !layerMenuRef.current.contains(event.target as Node)) {
        setShowLayerMenu(false);
      }
    };

    if (showLayerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLayerMenu]);

  // Focus drawing search input when expanded
  useEffect(() => {
    if (isDrawingSearchExpanded && drawingSearchInputRef.current) {
        drawingSearchInputRef.current.focus();
    }
  }, [isDrawingSearchExpanded]);

  const toggleLayer = (category: string) => {
    setHiddenLayers(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const toggleExportCategory = (category: string) => {
    setExportCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  const toggleExportStatus = (status: ComplianceStatus) => {
    setExportStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsDownloading(false);
      setIsExportModalOpen(false);
      alert(`PDF Report (${exportConfig.orientation}) generated successfully!\nIncludes:\n- ${exportConfig.includeSummary ? 'Summary' : ''}\n- ${exportConfig.includeCharts ? 'Charts' : ''}\n- ${exportConfig.includeBoundingBoxes ? 'Bounding Box Data' : ''}\n\nFilters:\n- Categories: ${exportCategories.length}/${allCategories.length}\n- Statuses: ${exportStatuses.length} selected`);
    }, 1500);
  };

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

  // Findings specifically for the drawing visualization (includes drawing specific search + hidden layers)
  const visibleDrawingFindings = useMemo(() => {
    return processedFindings.filter(f => {
      if (!f.boundingBox) return false;
      if (hiddenLayers.has(f.category || 'General')) return false;
      
      if (drawingSearch.trim()) {
        const term = drawingSearch.toLowerCase();
        return f.description.toLowerCase().includes(term) || 
               f.reference.toLowerCase().includes(term) || 
               (f.category && f.category.toLowerCase().includes(term));
      }
      return true;
    });
  }, [processedFindings, hiddenLayers, drawingSearch]);

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
    <div className="space-y-6 animate-fadeIn pb-20 relative">
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
           <button 
             onClick={() => setIsExportModalOpen(true)}
             className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
           >
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible relative">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-slate-500" /> Drawing Visualization
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    {/* Drawing Search */}
                    <div className={`relative transition-all duration-300 ease-in-out ${isDrawingSearchExpanded ? 'w-48' : 'w-8'}`}>
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-8 pointer-events-none z-10">
                            <Search className={`w-4 h-4 ${isDrawingSearchExpanded ? 'text-blue-500' : 'text-slate-400'}`} />
                        </div>
                        {isDrawingSearchExpanded ? (
                            <input 
                                ref={drawingSearchInputRef}
                                type="text"
                                value={drawingSearch}
                                onChange={(e) => setDrawingSearch(e.target.value)}
                                placeholder="Search drawing..."
                                className="w-full pl-9 pr-7 py-1.5 text-xs bg-white border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none shadow-sm"
                                onBlur={() => !drawingSearch && setIsDrawingSearchExpanded(false)}
                            />
                        ) : (
                            <button 
                                onClick={() => setIsDrawingSearchExpanded(true)}
                                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
                                title="Search within drawing"
                            >
                            </button>
                        )}
                        {isDrawingSearchExpanded && drawingSearch && (
                            <button 
                                onClick={() => { setDrawingSearch(''); drawingSearchInputRef.current?.focus(); }}
                                className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 cursor-pointer z-20"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>

                    {/* Layer Toggle */}
                    <div className="relative" ref={layerMenuRef}>
                      <button
                        onClick={() => setShowLayerMenu(!showLayerMenu)}
                        className={`p-1.5 rounded-md transition-colors ${showLayerMenu ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'}`}
                        title="Manage Layers"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      {showLayerMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-30 p-2 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between px-2 py-1 mb-1">
                                <div className="text-xs font-semibold text-slate-500">Drawing Layers</div>
                                {(hiddenLayers.size > 0 || !showBaseLayer) && (
                                    <button 
                                        onClick={() => { setHiddenLayers(new Set()); setShowBaseLayer(true); }}
                                        className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            
                            {/* Base Layer Toggle */}
                            <button 
                                onClick={() => setShowBaseLayer(!showBaseLayer)}
                                className="flex items-center w-full px-2 py-1.5 rounded-lg hover:bg-slate-50 text-sm text-slate-700 transition-colors"
                            >
                                {showBaseLayer ? <Eye className="w-4 h-4 mr-2 text-blue-500"/> : <EyeOff className="w-4 h-4 mr-2 text-slate-400"/>}
                                <span>Base Drawing</span>
                            </button>
                            
                            <div className="h-px bg-slate-100 my-1"></div>
                            
                            {/* Category Layers */}
                             <div className="max-h-48 overflow-y-auto pr-1">
                                {allCategories.map(cat => {
                                    const isHidden = hiddenLayers.has(cat);
                                    const count = report.findings.filter(f => (f.category || 'General') === cat).length;
                                    
                                    return (
                                         <button 
                                            key={cat}
                                            onClick={() => toggleLayer(cat)}
                                            className="flex items-center justify-between w-full px-2 py-1.5 rounded-lg hover:bg-slate-50 text-sm text-slate-700 transition-colors"
                                        >
                                            <div className="flex items-center overflow-hidden">
                                                {isHidden ? <EyeOff className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0"/> : <Eye className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0"/>}
                                                <span className={`truncate text-left ${isHidden ? 'text-slate-400' : ''}`}>{cat}</span>
                                            </div>
                                            <span className="text-xs text-slate-400 bg-slate-100 px-1.5 rounded-full ml-2 flex-shrink-0">{count}</span>
                                        </button>
                                    );
                                })}
                             </div>
                        </div>
                      )}
                    </div>

                    <button className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
               
               <div className="relative bg-slate-900 min-h-[400px] flex items-center justify-center overflow-hidden group rounded-b-xl">
                  {report.imageBase64 ? (
                    <div className="relative w-full">
                       <img 
                          src={`data:image/jpeg;base64,${report.imageBase64}`} 
                          alt="Analyzed Drawing"
                          className={`w-full h-auto object-contain block transition-opacity duration-300 ${showBaseLayer ? 'opacity-90' : 'opacity-10'}`} 
                       />
                       
                       {/* SVG Overlay */}
                       <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {visibleDrawingFindings.map((finding) => {
                            if (!finding.boundingBox) return null;
                            const [ymin, xmin, ymax, xmax] = finding.boundingBox;
                            const width = (xmax - xmin) * 100;
                            const height = (ymax - ymin) * 100;
                            const x = xmin * 100;
                            const y = ymin * 100;

                            const isActive = activeFindingId === finding.id;
                            const isHovered = hoveredFindingId === finding.id;
                            const color = finding.status === ComplianceStatus.PASS ? '#22c55e' : finding.status === ComplianceStatus.FAIL ? '#ef4444' : '#f59e0b';

                            return (
                              <g 
                                key={finding.id} 
                                className="pointer-events-auto cursor-pointer" 
                                onClick={() => handleFindingClick(finding.id)}
                                onMouseEnter={() => setHoveredFindingId(finding.id)}
                                onMouseLeave={() => setHoveredFindingId(null)}
                              >
                                <rect
                                  x={`${x}%`}
                                  y={`${y}%`}
                                  width={`${width}%`}
                                  height={`${height}%`}
                                  fill={isActive || isHovered ? color : 'transparent'}
                                  fillOpacity={isActive || isHovered ? 0.2 : 0}
                                  stroke={color}
                                  strokeWidth={isActive || isHovered ? 2 : 0.5}
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

                       {/* Tooltip Overlay */}
                       {visibleDrawingFindings.map((finding) => {
                          const isActive = activeFindingId === finding.id;
                          const isHovered = hoveredFindingId === finding.id;

                          if ((!isActive && !isHovered) || !finding.boundingBox) return null;
                          
                          const [ymin, xmin] = finding.boundingBox;
                          const topVal = ymin * 100;
                          const leftVal = xmin * 100;
                          const isNearTop = topVal < 15; // If it's in the top 15%, show tooltip below

                          return (
                            <div
                              key={`tooltip-${finding.id}`}
                              className="absolute z-20 bg-white rounded-lg shadow-xl border border-slate-200 p-3 w-64 animate-in fade-in zoom-in-95 duration-200 pointer-events-none"
                              style={{
                                top: `${topVal}%`,
                                left: `${leftVal}%`,
                                transform: isNearTop ? 'translateY(10px)' : 'translateY(-100%) translateY(-10px)'
                              }}
                            >
                              <div className="flex items-start gap-2">
                                 <div className="mt-0.5"><StatusIcon status={finding.status} /></div>
                                 <div>
                                    <p className="text-xs font-bold text-slate-900 mb-1 line-clamp-2">{finding.description}</p>
                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                      ${finding.status === ComplianceStatus.FAIL ? 'bg-red-100 text-red-700' :
                                        finding.status === ComplianceStatus.WARNING ? 'bg-amber-100 text-amber-700' :
                                        'bg-green-100 text-green-700'}`}>
                                      {finding.status}
                                    </span>
                                 </div>
                              </div>
                              <div
                                className={`absolute left-4 w-3 h-3 bg-white border-slate-200 transform rotate-45
                                ${isNearTop ? '-top-1.5 border-t border-l' : '-bottom-1.5 border-b border-r'}`}
                              ></div>
                            </div>
                          );
                       })}
                    </div>
                  ) : (
                    <div className="text-slate-400 text-sm">Image data not available</div>
                  )}
               </div>
               <div className="p-3 bg-slate-50 text-xs text-slate-500 border-t border-slate-100 flex justify-between rounded-b-xl">
                  <span>Click boxes to view details</span>
                  <span>{visibleDrawingFindings.length} zones visible</span>
               </div>
            </div>
          </div>
        </div>

      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-900">Export Report</h3>
              <button onClick={() => setIsExportModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Orientation */}
              <section>
                <label className="text-sm font-bold text-slate-800 block mb-3">Page Orientation</label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                     className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${exportConfig.orientation === 'portrait' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                     onClick={() => setExportConfig({...exportConfig, orientation: 'portrait'})}
                   >
                     <div className="w-10 h-14 border-2 border-current rounded-sm bg-white shadow-sm flex items-center justify-center">
                        <div className="w-6 h-1 border-t-2 border-current opacity-30"></div>
                     </div>
                     <span className="text-sm font-medium">Portrait</span>
                   </button>
                   <button 
                     className={`p-4 border rounded-xl flex flex-col items-center gap-3 transition-all ${exportConfig.orientation === 'landscape' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                     onClick={() => setExportConfig({...exportConfig, orientation: 'landscape'})}
                   >
                     <div className="w-14 h-10 border-2 border-current rounded-sm bg-white shadow-sm flex items-center justify-center">
                        <div className="w-8 h-1 border-t-2 border-current opacity-30"></div>
                     </div>
                     <span className="text-sm font-medium">Landscape</span>
                   </button>
                </div>
              </section>

              {/* Report Content Options */}
              <section>
                <label className="text-sm font-bold text-slate-800 block mb-3">Report Content</label>
                <div className="space-y-3 bg-white">
                   <button 
                    onClick={() => setExportConfig(c => ({...c, includeSummary: !c.includeSummary}))}
                    className="flex items-center w-full p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                   >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${exportConfig.includeSummary ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                          {exportConfig.includeSummary && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700">Executive Summary</span>
                   </button>

                   <button 
                    onClick={() => setExportConfig(c => ({...c, includeCharts: !c.includeCharts}))}
                    className="flex items-center w-full p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                   >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${exportConfig.includeCharts ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                          {exportConfig.includeCharts && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700">Visualizations & Charts</span>
                   </button>

                   <button 
                    onClick={() => setExportConfig(c => ({...c, includeBoundingBoxes: !c.includeBoundingBoxes}))}
                    className="flex items-center w-full p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                   >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${exportConfig.includeBoundingBoxes ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                          {exportConfig.includeBoundingBoxes && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm font-medium text-slate-700">Include Bounding Box Coordinates</span>
                   </button>
                </div>
              </section>

              {/* Status Filter */}
              <section>
                 <label className="text-sm font-bold text-slate-800 block mb-3">Filter by Status</label>
                 <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: ComplianceStatus.FAIL, label: 'Fail', color: 'text-red-700 bg-red-50 border-red-200' },
                      { id: ComplianceStatus.WARNING, label: 'Warning', color: 'text-amber-700 bg-amber-50 border-amber-200' },
                      { id: ComplianceStatus.NEEDS_CLARIFICATION, label: 'Info', color: 'text-blue-700 bg-blue-50 border-blue-200' },
                      { id: ComplianceStatus.PASS, label: 'Pass', color: 'text-green-700 bg-green-50 border-green-200' },
                    ].map(status => (
                        <button
                          key={status.id}
                          onClick={() => toggleExportStatus(status.id)}
                          className={`flex items-center p-2 rounded-lg border transition-all ${
                             exportStatuses.includes(status.id) 
                             ? `${status.color} ring-1 ring-current border-transparent` 
                             : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 flex-shrink-0 bg-white ${exportStatuses.includes(status.id) ? 'border-current' : 'border-slate-300'}`}>
                                {exportStatuses.includes(status.id) && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">{status.label}</span>
                        </button>
                    ))}
                 </div>
              </section>

              {/* Category Filter */}
              <section>
                  <div className="flex items-center justify-between mb-2 mt-4 px-1">
                    <span className="text-sm font-bold text-slate-800">Filter by Category</span>
                    <button 
                        onClick={() => setExportCategories(exportCategories.length === allCategories.length ? [] : allCategories)}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        {exportCategories.length === allCategories.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {allCategories.map(cat => (
                        <button 
                        key={cat}
                        onClick={() => toggleExportCategory(cat)}
                        className="flex items-center w-full p-2 rounded-md hover:bg-white hover:shadow-sm transition-all text-left"
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 flex-shrink-0 transition-colors ${exportCategories.includes(cat) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                {exportCategories.includes(cat) && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-sm text-slate-600 truncate">{cat}</span>
                        </button>
                    ))}
                  </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
               <button 
                 className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-200 rounded-lg transition-colors" 
                 onClick={() => setIsExportModalOpen(false)}
                 disabled={isDownloading}
                >
                 Cancel
               </button>
               <button 
                 className="px-6 py-2 bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-wait" 
                 onClick={handleDownload}
                 disabled={isDownloading}
               >
                  {isDownloading ? <Loader2 className="animate-spin w-4 h-4"/> : <Download className="w-4 h-4"/>}
                  {isDownloading ? 'Generating...' : 'Download PDF'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceReport;