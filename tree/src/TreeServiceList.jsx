import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Services.css'; 

const ZERO_GUID = '00000000-0000-0000-0000-000000000000';

// --- Icons ---
const ChevronIcon = ({ isOpen }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: 0.6 }}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const FolderIcon = ({ isOpen }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill={isOpen ? "url(#folderGradient)" : "none"} stroke={isOpen ? "#4f46e5" : "#64748b"} strokeWidth="2" style={{ marginRight: '12px', transition: 'all 0.3s ease' }}>
    <defs>
      <linearGradient id="folderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const ServiceIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
    <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v9" />
  </svg>
);

const TreeServiceList = () => {
  const [tree, setTree] = useState([]);
  const [openParents, setOpenParents] = useState({});
  const [openChildren, setOpenChildren] = useState({});
  const [visibleDept, setVisibleDept] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axios.get('/AddTopic'),
      axios.get('/Tree'),
    ])
      .then(([{ data: topics }, { data: services }]) => {
        const activeTopics = topics.filter(t => t.is_active === true);
        const rawServices = services.filter(s => s.is_active === true);

        // --- Group services by service_code and merge providers ---
        const serviceMap = new Map();

        rawServices.forEach(svc => {
            const rawDepts = svc.departments ? svc.departments.split(',') : [];
            
            const parsedProviders = rawDepts.map(d => {
                const [name] = d.trim().split('|');
                return {
                    name: name ? name.trim() : 'Unknown',
                    orgCode: svc.organization_code 
                };
            }).filter(p => p.name);

            if (serviceMap.has(svc.service_code)) {
                const existing = serviceMap.get(svc.service_code);
                existing.consolidatedProviders.push(...parsedProviders);
            } else {
                serviceMap.set(svc.service_code, {
                    ...svc,
                    consolidatedProviders: parsedProviders
                });
            }
        });

        const activeServices = Array.from(serviceMap.values());

        const childrenMap = activeTopics.reduce((acc, topic) => {
          acc[topic.parent_Topic_Id] = acc[topic.parent_Topic_Id] || [];
          acc[topic.parent_Topic_Id].push(topic);
          return acc;
        }, {});

        const parents = childrenMap[ZERO_GUID] || [];

        const treeData = parents.map(parent => {
          const childTopics = childrenMap[parent.topic_code] || [];

          if (childTopics.length > 0) {
            const children = childTopics.map(child => ({
              node: child,
              services: activeServices.filter(s => s.topic_code === child.topic_code),
            }));
            return { node: parent, children, services: [] };
          } else {
            const parentServices = activeServices.filter(s => s.topic_code === parent.topic_code);
            return { node: parent, children: [], services: parentServices };
          }
        });

        setTree(treeData);
      })
      .catch(err => {
        console.error(err);
        setError('Unable to load services.');
      });
  }, []);

  const toggleParent = code =>
    setOpenParents(prev => ({ ...prev, [code]: !prev[code] }));
  const toggleChild = code =>
    setOpenChildren(prev => ({ ...prev, [code]: !prev[code] }));

  // --- Render Single Service Card ---
  const renderServiceItem = (svc, topic) => {
    const isExpanded = visibleDept === svc.service_code;

    return (
      <div
        key={svc.service_code}
        className={`service-card ${isExpanded ? 'expanded' : ''}`}
      >
        <div style={{ padding: '20px' }}>
            
          {/* Main Clickable Header Area */}
          <div 
            onClick={() => setVisibleDept(isExpanded ? null : svc.service_code)}
            className="service-header"
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {/* Icon Box */}
              <div className="service-icon-box">
                <ServiceIcon />
              </div>

              <div>
                <h4 className="service-title">
                  {svc.description_en}
                </h4>
                <div className="service-subtitle">
                  {isExpanded ? 'Hide options' : 'Click to apply'}
                  {!isExpanded && <span style={{ marginLeft: '5px', fontSize: '10px' }}>▼</span>}
                </div>
              </div>
            </div>

            {/* Requirements Pill */}
            {svc.requirementsTOApply_en && (
              <div className="requirements-pill">
                <span style={{ marginRight: '4px' }}>📝</span>
                <span style={{ color: '#0f172a', fontWeight: '800' }}>Requirements: </span>
                {svc.requirementsTOApply_en}
              </div>
            )}
          </div>

          {/* Collapsible Content */}
          {isExpanded && (
            <div className="collapsible-content">
              <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
               Select a provider to start
              </p>
               
              <div className="provider-grid">
                {(svc.consolidatedProviders && svc.consolidatedProviders.length > 0) ? (
                  svc.consolidatedProviders.map((provider, idx) => {
                    return (
                      <button
                        type='button'
                        key={idx}
                        className="provider-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/myApplication/${svc.service_code}/${svc.task_code}/${provider.orgCode}/${svc.meta_data_forms_form_code}`;
                        }}
                      >
                        <span className="provider-icon-wrapper">
                           <BuildingIcon />
                        </span>
                        {provider.name}
                      </button>
                    );
                  })
                ) : (
                  <div className="no-providers">
                    ⚠️ No active service providers available at this time.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tree-service-container">
       
      <div className="section-header">
        <h3 className="section-title">
         Available Services
        </h3>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {tree.map(({ node: parent, children, services }) => {
          const pcode = parent.topic_code;
          const pOpen = !!openParents[pcode];

          return (
            <div key={pcode} className={`folder-container ${pOpen ? 'open' : ''}`}>
               
              {/* Parent Header */}
              <div
                className={`folder-row ${pOpen ? 'open' : ''}`}
                onClick={() => toggleParent(pcode)}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FolderIcon isOpen={pOpen} />
                  <span className="folder-title">
                    {parent.description_en}
                  </span>
                  {pOpen && <span className="badge-open">OPEN</span>}
                </div>
                <ChevronIcon isOpen={pOpen} />
              </div>

              {/* Parent Body */}
              {pOpen && (
                <div className="folder-body">
                   
                  {/* Direct Services */}
                  {services.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      {services.map(svc => renderServiceItem(svc, parent))}
                    </div>
                  )}

                  {/* Child Topics (Subtopics) */}
                  {children.length > 0 ? (
                    children.map(({ node: child, services: childSvcs }) => {
                      const ccode = child.topic_code;
                      const cOpen = !!openChildren[ccode];

                      return (
                        <div key={ccode} style={{ marginBottom: '12px' }}>
                          <div
                            onClick={() => toggleChild(ccode)}
                            className={`child-topic-row ${cOpen ? 'open' : ''}`}
                          >
                            <span style={{ 
                              marginRight: '10px', fontSize: '0.8rem', 
                              transform: cOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
                              transition: 'transform 0.2s',
                              color: '#94a3b8'
                            }}>▶</span>
                            {child.description_en}
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px' }}>
                              {childSvcs.length} Service
                            </span>
                          </div>

                          {cOpen && (
                            <div className="child-content-wrapper">
                              {childSvcs.length > 0 ? (
                                childSvcs.map(svc => renderServiceItem(svc, child))
                              ) : (
                                <div style={{ padding: '16px', fontStyle: 'italic', color: '#94a3b8', fontSize: '0.9rem', background: '#fff', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                                  No service under this topic.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    services.length === 0 && (
                      <div style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', padding: '30px' }}>
                        Service Unavailable.
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TreeServiceList;