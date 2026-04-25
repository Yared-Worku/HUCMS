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
  <svg viewBox="0 0 24 24" width="22" height="22" fill={isOpen ? "url(#folderGradient)" : "none"} stroke={isOpen ? "#4f46e5" : "#64748b"} strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0, transition: 'all 0.3s ease' }}>
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
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', flexShrink: 0 }}>
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
  const [showCampusModal, setShowCampusModal] = useState(false);
const [selectedCampus, setSelectedCampus] = useState('');
const [filteredDepts, setFilteredDepts] = useState([]);
const [selectedDepCode, setSelectedDepCode] = useState('');
   const [userid, setUserid] = useState(null);
   const [roleid, setRoleid] = useState(null);
const [departments, setDepartments] = useState(null);
const [OrgDepCode, setOrgDepCode] = useState([]);

    const Username = window.__DNN_USER__?.username ?? "Guest";
  // const Username = "aman12";

  useEffect(() => {
    fetchuserid();
    fetchOrgDepCode();
  }, []);

  const fetchuserid = async () => {
    try {
      const res = await axios.get(`/GetUserID/${Username}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        const id = res.data[0].userid;
        const roleid = res.data[0].roleid;
        setRoleid(roleid);
        setUserid(id);
         fetchDepartments(id);
      }
    } catch (err) {
      console.error("Failed to fetch userid:", err);
    }
  };
    const fetchDepartments = async (userid) => {
    try {
      // debugger
      const res = await axios.get(`/DepCode/${userid}`);
      setDepartments(res.data);
    } catch (err) {
      setDepartments([]);
    }
  };
const fetchOrgDepCode = async () => {
  try {
    const res = await axios.get('/OrgDepCode'); 
    setOrgDepCode(res.data);
  } catch (err) {
    console.error("Fetch failed:", err);
    setOrgDepCode([]);
  }
};

useEffect(() => {
  if (departments !== null && OrgDepCode.length > 0) {
      
    if (departments.length === 0) {
      setShowCampusModal(true);
    } else {
      setShowCampusModal(false);
    }
    
  }
}, [departments, OrgDepCode]);
const handleCampusChange = (e) => {
  const campus = e.target.value;
  setSelectedCampus(campus);
  
  // Filter the list to show departments belonging to the selected campus
  const depts = OrgDepCode.filter(item => item.name_en === campus);
  setFilteredDepts(depts);
};
const handleDepartmentAssignment = async () => {
  if (!userid || !selectedDepCode) return;

  try {
    const payload = {
      userid: userid,
      depCode: selectedDepCode
    };

    await axios.post('/UserDeptAssignment', payload);
     fetchDepartments(userid);
    // alert("Department assigned successfully!");
    setShowCampusModal(false);
  } catch (err) {
    console.error("Assignment failed:", err);
    alert("Failed to assign department.");
  }
};

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
            /* CHANGE: Added justify-content and align-items to push items apart */
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', flexWrap: 'wrap' }} 
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: '200px', gap: '15px' }}>
              {/* Icon Box */}
              <div className="service-icon-box" style={{ flexShrink: 0 }}>
                <ServiceIcon />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 className="service-title" style={{ margin: 0, wordWrap: 'break-word' }}>
                  {svc.description_en}
                </h4>
                <div className="service-subtitle" style={{ marginTop: '5px' }}>
                  {isExpanded ? 'Hide options' : 'Click to apply'}
                  {!isExpanded && <span style={{ marginLeft: '5px', fontSize: '10px' }}>▼</span>}
                </div>
              </div>
            </div>

            {/* Requirements Pill - MOVED TO RIGHT CORNER */}
            {svc.requirementsTOApply_en && (
              <div className="requirements-pill" style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                wordBreak: 'break-word', 
                padding: '8px 12px', 
                background: '#f8fafc', 
                borderRadius: '6px',
                maxWidth: '300px', // Prevents it from taking too much space on wide screens
                fontSize: '0.85rem' 
              }}>
                <span style={{ marginRight: '6px', flexShrink: 0 }}>📝</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: '#0f172a', fontWeight: '800' }}>Requirements: </span>
                  {svc.requirementsTOApply_en}
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Content */}
          {isExpanded && (
            <div className="collapsible-content" style={{ marginTop: '16px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
               Select a provider to start
              </p>
               
<div className="provider-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
  {!userid ? (
    /* 1. Case: User is not logged in */
    <div className="login-notice" style={{ width: '100%', padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>
      🔒 You have to login to see the available service providers with your campus.
    </div>
  ) : (
    /* 2. Case: User is logged in, show filtered providers */
    <>
      {svc.consolidatedProviders && svc.consolidatedProviders.length > 0 ? (
        svc.consolidatedProviders
          .filter(provider => 
            // Only show provider if its orgCode exists in the user's departments list
            // We use optional chaining ?. in case departments is null
            departments?.some(d => d.orgCode === provider.orgCode)
          )
          .map((provider, idx) => (
            <button
              type='button'
              key={idx}
              className="provider-btn"
              style={{ flex: '1 1 auto', minWidth: '160px', display: 'flex', alignItems: 'center' }}
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/myApplication/${svc.service_code}/${svc.task_code}/${provider.orgCode}/${svc.meta_data_forms_form_code}`;
              }}
            >
              <span className="provider-icon-wrapper">
                <BuildingIcon />
              </span>
              <span style={{ wordWrap: 'break-word', textAlign: 'left' }}>
                {provider.name}
              </span>
            </button>
          ))
      ) : (
        <div className="no-providers" style={{ width: '100%', wordBreak: 'break-word' }}>
          ⚠️ No active service providers available at this time.
        </div>
      )}

      {/* Message if providers exist but none match the user's assigned OrgCode */}
      {svc.consolidatedProviders?.length > 0 && 
       !svc.consolidatedProviders.some(p => departments?.some(d => d.orgCode === p.orgCode)) && (
        <div className="no-match" style={{ width: '100%', fontSize: '0.85rem', color: '#64748b', padding: '8px' }}>
         ⚠️ You have to complete your department assignment information to see the available service providers with your campus.
        </div>
      )}
    </>
  )}
</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tree-service-container" style={{ padding: '10px', maxWidth: '100%', overflowX: 'hidden' }}>
       
      <div className="section-header">
        <h3 className="section-title">
         Available Services
        </h3>
      </div>

      {error && (
        <div className="error-box" style={{ wordBreak: 'break-word' }}>
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
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', gap: '10px', flexWrap: 'nowrap' }} // Keeps chevron on right
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <FolderIcon isOpen={pOpen} />
                  <span className="folder-title" style={{ wordBreak: 'break-word', whiteSpace: 'normal', flex: 1 }}>
                    {parent.description_en}
                  </span>
                  {pOpen && <span className="badge-open" style={{ flexShrink: 0, marginLeft: '8px' }}>OPEN</span>}
                </div>
                <div style={{ flexShrink: 0 }}>
                  <ChevronIcon isOpen={pOpen} />
                </div>
              </div>

              {/* Parent Body */}
              {pOpen && (
                <div className="folder-body" style={{ padding: '10px' }}>
                   
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
                            style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }} // Ensures badge and text stack if needed
                          >
                            <div style={{ display: 'flex', alignItems: 'center', flex: '1 1 200px', minWidth: 0 }}>
                              <span style={{ 
                                marginRight: '10px', fontSize: '0.8rem', 
                                transform: cOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
                                transition: 'transform 0.2s',
                                color: '#94a3b8', flexShrink: 0
                              }}>▶</span>
                              <span style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                {child.description_en}
                              </span>
                            </div>
                            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', flexShrink: 0 }}>
                              {childSvcs.length} Service{childSvcs.length !== 1 && 's'}
                            </span>
                          </div>

                          {cOpen && (
                            <div className="child-content-wrapper" style={{ marginTop: '10px' }}>
                              {childSvcs.length > 0 ? (
                                childSvcs.map(svc => renderServiceItem(svc, child))
                              ) : (
                                <div style={{ padding: '16px', fontStyle: 'italic', color: '#94a3b8', fontSize: '0.9rem', background: '#fff', borderRadius: '8px', border: '1px dashed #e2e8f0', wordBreak: 'break-word' }}>
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
      {/* Campus Selection Modal */}
{showCampusModal && (
  <div className="modern-modal-overlay">
    <div className="modern-modal-content">
      
      {/* Header */}
      <div className="modern-modal-header">
        <div className="header-title-group">
          <div className="header-icon">
            <BuildingIcon />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Department Assignment</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Complete your profile by selecting your campus and department.
            </p>
          </div>
        </div>
        <button onClick={() => setShowCampusModal(false)} className="modern-close-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="modern-modal-body">
        {/* Step 1: Campus Selection */}
        <div className="selection-step">
          <div className="step-label">
            <span className="step-number">1</span> 
            Choose your Campus
          </div>
          
          <div className="campus-grid">
            {[...new Set(OrgDepCode.map(item => item.name_en))].map(name => (
              <button
              type='button'
                key={name}
                className={`campus-card ${selectedCampus === name ? 'active' : ''}`}
                onClick={() => {
                  handleCampusChange({ target: { value: name } }); // Keep your existing handler logic
                  setSelectedDepCode(''); // Reset department on new campus
                }}
              >
                <div className="campus-card-content">
                  <span className="campus-icon">🏛️</span>
                  <span className="campus-name">{name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Department Selection (Animates in when Campus is selected) */}
        <div className={`selection-step dept-step ${selectedCampus ? 'visible' : ''}`}>
          <div className="step-label" style={{ marginTop: '24px' }}>
            <span className="step-number">2</span> 
            Select your Department
          </div>
          
          <div className="dept-grid">
            {filteredDepts.map((dept) => (
              <button 
              type='button'
                key={dept.depCode} 
                className={`modern-dept-item ${selectedDepCode === dept.depCode ? 'selected' : ''}`}
                onClick={() => setSelectedDepCode(dept.depCode)}
              >
                <div className="modern-radio">
                  <div className="radio-dot"></div>
                </div>
                <span className="dept-name-text">{dept.depName}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="modern-modal-footer">
        <button  
        type='button'
          className="modern-confirm-btn" 
          disabled={!selectedDepCode}
          onClick={handleDepartmentAssignment}
        >
          <span>Confirm Assignment</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TreeServiceList;