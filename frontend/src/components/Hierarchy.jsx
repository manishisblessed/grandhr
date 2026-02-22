import React, { useState, useEffect, useRef } from 'react';
import Layout from './Layout';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
// Hierarchy uses localStorage for data persistence

const Hierarchy = () => {
  const [hierarchy, setHierarchy] = useState({
    root: {
      id: 'root',
      name: 'Chandan Kumar',
      designation: 'MD & Co-Founder',
      email: 'chandan@abheepay.com',
      department: 'Top-Level Management',
      children: []
    }
  });
  const [employees, setEmployees] = useState(new Map());
  const [companyName, setCompanyName] = useState('Abheepay');
  const [companyLogo, setCompanyLogo] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    designation: '',
    department: '',
    email: '',
    parentId: 'root',
    reportsTo: 'root',
    subordinateLayout: 'horizontal' // 'horizontal' or 'vertical' - how this employee's subordinates will be displayed
  });
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'
  const [isLoading, setIsLoading] = useState(true);
  const [hierarchies, setHierarchies] = useState([]); // List of all hierarchies
  const [currentHierarchyId, setCurrentHierarchyId] = useState(null); // Current hierarchy ID
  const [showHierarchyModal, setShowHierarchyModal] = useState(false); // Modal for managing hierarchies
  const [newHierarchyName, setNewHierarchyName] = useState(''); // For creating new hierarchy
  const [editingHierarchyId, setEditingHierarchyId] = useState(null); // For renaming hierarchy
  const [editingHierarchyName, setEditingHierarchyName] = useState(''); // For renaming hierarchy
  const hierarchyTreeRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.jspdf = { jsPDF };
      window.html2canvas = html2canvas;
    }
    loadHierarchyData();
  }, []);

  // Close hierarchy modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHierarchyModal && !event.target.closest('.hierarchy-modal-container')) {
        setShowHierarchyModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHierarchyModal]);

  const loadHierarchyData = async () => {
    setIsLoading(true);
    let hierarchiesLoaded = false;
    try {
      // Load from localStorage (MongoDB backend integration can be added later)
      hierarchiesLoaded = loadHierarchyFromStorage();

      // If no hierarchies exist, create a default one
      if (!hierarchiesLoaded) {
        const defaultHierarchy = {
          id: `hierarchy-${Date.now()}`,
          name: 'My Hierarchy',
          hierarchy: {
            root: {
              id: 'root',
              name: 'Chandan Kumar',
              designation: 'MD & Co-Founder',
              email: 'chandan@abheepay.com',
              department: 'Top-Level Management',
              children: []
            }
          },
          employees: [],
          companyName: 'Abheepay',
          companyLogo: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        ensureRootData(defaultHierarchy.hierarchy);
        setHierarchies([defaultHierarchy]);
        setCurrentHierarchyId(defaultHierarchy.id);
        setHierarchy(defaultHierarchy.hierarchy);
        setEmployees(new Map());
        setCompanyName(defaultHierarchy.companyName);
        saveAllHierarchies([defaultHierarchy], defaultHierarchy.id);
      }
    } catch (error) {
      console.error('Error loading hierarchy:', error);
      // Fallback to localStorage on error
      const hierarchiesLoaded = loadHierarchyFromStorage();
      
      // If still no hierarchies, create default
      if (!hierarchiesLoaded) {
        const defaultHierarchy = {
          id: `hierarchy-${Date.now()}`,
          name: 'My Hierarchy',
          hierarchy: {
            root: {
              id: 'root',
              name: 'Chandan Kumar',
              designation: 'MD & Co-Founder',
              email: 'chandan@abheepay.com',
              department: 'Top-Level Management',
              children: []
            }
          },
          employees: [],
          companyName: 'Abheepay',
          companyLogo: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setHierarchies([defaultHierarchy]);
        setCurrentHierarchyId(defaultHierarchy.id);
        setHierarchy(defaultHierarchy.hierarchy);
        setEmployees(new Map());
        setCompanyName(defaultHierarchy.companyName);
        saveAllHierarchies([defaultHierarchy], defaultHierarchy.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Track if we've already checked for duplicates to avoid infinite loops
  const duplicateCheckRef = useRef(false);

  useEffect(() => {
    // Only render if not loading and DOM is ready
    if (!isLoading && hierarchyTreeRef.current) {
      const timer = setTimeout(() => {
        try {
          // Check for duplicates only once after initial load
          if (!duplicateCheckRef.current && hierarchy.root && hierarchy.root.children.length > 0) {
            duplicateCheckRef.current = true;
            // Silently check and remove duplicates without alert
            const hasDuplicates = removeDuplicateEmployeesSilent();
            if (hasDuplicates) {
              // If duplicates were removed, state will update and trigger re-render
              return;
            }
          }
          renderHierarchy();
        } catch (error) {
          console.error('Error rendering hierarchy:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hierarchy, companyName, companyLogo, employees, isLoading]);

  // Ensure root always has required fields
  const ensureRootData = (hierarchyData) => {
    if (hierarchyData && hierarchyData.root) {
      if (!hierarchyData.root.name || hierarchyData.root.name.trim() === '') {
        hierarchyData.root.name = 'Chandan Kumar';
      }
      if (!hierarchyData.root.designation || hierarchyData.root.designation.trim() === '') {
        hierarchyData.root.designation = 'MD & Co-Founder';
      }
      if (!hierarchyData.root.email || hierarchyData.root.email.trim() === '') {
        hierarchyData.root.email = 'chandan@abheepay.com';
      }
      if (!hierarchyData.root.department || hierarchyData.root.department.trim() === '') {
        hierarchyData.root.department = 'Top-Level Management';
      }
      if (!hierarchyData.root.id) {
        hierarchyData.root.id = 'root';
      }
      if (!hierarchyData.root.children) {
        hierarchyData.root.children = [];
      }
    }
    return hierarchyData;
  };

  // COMPREHENSIVE DUPLICATE REMOVAL - Removes duplicates by ID AND by name
  // This runs at multiple levels: load, save, render
  const removeAllDuplicatesComprehensive = (hierarchyData) => {
    const updatedHierarchy = JSON.parse(JSON.stringify(hierarchyData));
    const seenIds = new Set();
    const seenNames = new Map(); // name -> {node, path}
    const duplicatesToRemove = [];
    
    // First pass: Find all duplicates by ID
    const findDuplicatesById = (node, path = []) => {
      if (node.id !== 'root') {
        if (seenIds.has(node.id)) {
          duplicatesToRemove.push({ type: 'id', id: node.id, path: [...path] });
        } else {
          seenIds.add(node.id);
        }
      }
      for (let i = 0; i < node.children.length; i++) {
        findDuplicatesById(node.children[i], [...path, i]);
      }
    };
    findDuplicatesById(updatedHierarchy.root);
    
    // Second pass: Find duplicates by name (case-insensitive)
    const findDuplicatesByName = (node, path = []) => {
      if (node.id !== 'root' && node.name && node.name.trim()) {
        const nameKey = node.name.toLowerCase().trim();
        if (seenNames.has(nameKey)) {
          const existing = seenNames.get(nameKey);
          // If this is a direct child of root (path.length === 0) and existing is deeper, remove this
          // If existing is direct child of root and this is deeper, mark existing for removal
          if (path.length === 0 && existing.path.length > 0) {
            // This is top-level, existing is deeper - remove this
            duplicatesToRemove.push({ type: 'name', name: nameKey, path: [...path] });
          } else if (path.length > 0 && existing.path.length === 0) {
            // This is deeper, existing is top-level - remove existing
            duplicatesToRemove.push({ type: 'name', name: nameKey, path: existing.path });
            seenNames.set(nameKey, { node, path: [...path] });
          } else if (path.length > 0 && existing.path.length > 0) {
            // Both are deeper - keep the first one found, remove this
            duplicatesToRemove.push({ type: 'name', name: nameKey, path: [...path] });
          } else {
            // Both are top-level - keep first, remove this
            duplicatesToRemove.push({ type: 'name', name: nameKey, path: [...path] });
          }
        } else {
          seenNames.set(nameKey, { node, path: [...path] });
        }
      }
      for (let i = 0; i < node.children.length; i++) {
        findDuplicatesByName(node.children[i], [...path, i]);
      }
    };
    findDuplicatesByName(updatedHierarchy.root);
    
    // Remove duplicates (process in reverse order to maintain path indices)
    duplicatesToRemove.sort((a, b) => b.path.length - a.path.length); // Remove deeper ones first
    
    duplicatesToRemove.forEach(dup => {
      let current = updatedHierarchy.root;
      for (let j = 0; j < dup.path.length - 1; j++) {
        current = current.children[dup.path[j]];
      }
      // Remove by index
      const indexToRemove = dup.path[dup.path.length - 1];
      if (current.children && current.children[indexToRemove]) {
        current.children = current.children.filter((_, idx) => idx !== indexToRemove);
      }
    });
    
    return updatedHierarchy;
  };

  const loadHierarchyFromStorage = () => {
    // First, check for old format and migrate if needed
    const oldStored = localStorage.getItem('companyHierarchy');
    const storedHierarchies = localStorage.getItem('companyHierarchies');
    
    // If we have old format data but no new format, migrate it
    if (oldStored && !storedHierarchies) {
      try {
        const data = JSON.parse(oldStored);
        let loadedHierarchy = data.hierarchy;
      let loadedEmployees = new Map(data.employees || []);
      
        // Check if there's actual data (not just default empty hierarchy)
        const hasData = loadedHierarchy && loadedHierarchy.root && 
                       (loadedHierarchy.root.children.length > 0 || loadedEmployees.size > 0);
        
        if (hasData) {
      // Ensure all employees have subordinateLayout property
      const ensureSubordinateLayout = (node) => {
        if (node.id !== 'root' && !node.subordinateLayout) {
          node.subordinateLayout = 'horizontal';
        }
        const emp = loadedEmployees.get(node.id);
        if (emp && !emp.subordinateLayout) {
          emp.subordinateLayout = 'horizontal';
          loadedEmployees.set(node.id, emp);
        }
            if (node.children) {
        node.children.forEach(child => ensureSubordinateLayout(child));
            }
      };
      ensureSubordinateLayout(loadedHierarchy.root);
      ensureRootData(loadedHierarchy);
      
      // LEVEL 2: Remove ALL duplicates on migration
      loadedHierarchy = removeAllDuplicatesComprehensive(loadedHierarchy);
      
      // Rebuild employees map after cleanup
      const cleanedEmployees = new Map();
      const rebuildEmployeesMap = (node, parentId = 'root') => {
        if (node.id !== 'root') {
          cleanedEmployees.set(node.id, {
            id: node.id,
            name: node.name,
            designation: node.designation,
            email: node.email || '',
            department: node.department || '',
            reportsTo: parentId,
            subordinateLayout: node.subordinateLayout || 'horizontal'
          });
        }
        node.children.forEach(child => rebuildEmployeesMap(child, node.id));
      };
      rebuildEmployeesMap(loadedHierarchy.root);
      loadedEmployees = cleanedEmployees;
      
          // Migrate to new format with a meaningful name
          const migratedHierarchy = {
            id: `hierarchy-${Date.now()}`,
            name: 'My Hierarchy',
            hierarchy: loadedHierarchy,
            employees: Array.from(loadedEmployees.entries()),
            companyName: localStorage.getItem('hierarchyCompanyName') || 'Abheepay',
            companyLogo: localStorage.getItem('hierarchyCompanyLogo') || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          setHierarchies([migratedHierarchy]);
          setCurrentHierarchyId(migratedHierarchy.id);
      setHierarchy(loadedHierarchy);
      setEmployees(loadedEmployees);
          setCompanyName(migratedHierarchy.companyName);
          setCompanyLogo(migratedHierarchy.companyLogo);
          saveAllHierarchies([migratedHierarchy], migratedHierarchy.id);
          console.log('Migrated old hierarchy data to new format');
          return true; // Successfully migrated
        }
      } catch (error) {
        console.error('Error migrating old hierarchy data:', error);
      }
    }
    
    // Load all hierarchies from new format
    if (storedHierarchies) {
      try {
        const hierarchiesList = JSON.parse(storedHierarchies);
        
        // Filter out empty hierarchies (only keep ones with actual data)
        const validHierarchies = hierarchiesList.filter(h => {
          if (!h.hierarchy || !h.hierarchy.root) return false;
          const hasChildren = h.hierarchy.root.children && h.hierarchy.root.children.length > 0;
          const hasEmployees = h.employees && h.employees.length > 0;
          return hasChildren || hasEmployees || h.hierarchy.root.name !== 'Chandan Kumar';
        });
        
        if (validHierarchies.length > 0) {
          setHierarchies(validHierarchies);
          
          // Load current hierarchy ID or use first one
          const storedCurrentId = localStorage.getItem('currentHierarchyId');
          const currentId = storedCurrentId && validHierarchies.find(h => h.id === storedCurrentId) 
            ? storedCurrentId 
            : (validHierarchies.length > 0 ? validHierarchies[0].id : null);
          setCurrentHierarchyId(currentId);
          
          // Load the current hierarchy data
          if (currentId) {
            const currentHierarchyData = validHierarchies.find(h => h.id === currentId);
            if (currentHierarchyData) {
              let loadedHierarchy = currentHierarchyData.hierarchy || hierarchy;
              let loadedEmployees = new Map(currentHierarchyData.employees || []);
              
              // LEVEL 1: Ensure root data
              ensureRootData(loadedHierarchy);
              
              // LEVEL 2: Remove ALL duplicates on load (by ID and by name)
              loadedHierarchy = removeAllDuplicatesComprehensive(loadedHierarchy);
              
              // LEVEL 3: Ensure all employees have subordinateLayout property
              const ensureSubordinateLayout = (node) => {
                if (node.id !== 'root' && !node.subordinateLayout) {
                  node.subordinateLayout = 'horizontal';
                }
                const emp = loadedEmployees.get(node.id);
                if (emp && !emp.subordinateLayout) {
                  emp.subordinateLayout = 'horizontal';
                  loadedEmployees.set(node.id, emp);
                }
                if (node.children) {
                  node.children.forEach(child => ensureSubordinateLayout(child));
                }
              };
              ensureSubordinateLayout(loadedHierarchy.root);
              
              // LEVEL 4: Rebuild employees map after cleanup
              const cleanedEmployees = new Map();
              const rebuildEmployeesMap = (node, parentId = 'root') => {
                if (node.id !== 'root') {
                  cleanedEmployees.set(node.id, {
                    id: node.id,
                    name: node.name,
                    designation: node.designation,
                    email: node.email || '',
                    department: node.department || '',
                    reportsTo: parentId,
                    subordinateLayout: node.subordinateLayout || 'horizontal'
                  });
                }
                node.children.forEach(child => rebuildEmployeesMap(child, node.id));
              };
              rebuildEmployeesMap(loadedHierarchy.root);
              loadedEmployees = cleanedEmployees;
              
              setHierarchy(loadedHierarchy);
              setEmployees(loadedEmployees);
              setCompanyName(currentHierarchyData.companyName || 'Abheepay');
              setCompanyLogo(currentHierarchyData.companyLogo || null);
              
              // Update storage if we filtered out empty hierarchies
              if (validHierarchies.length !== hierarchiesList.length) {
                saveAllHierarchies(validHierarchies, currentId);
              }
              
              return true; // Successfully loaded
            }
          }
        }
      } catch (error) {
        console.error('Error loading hierarchies:', error);
      }
    }
    
    return false; // No data found
  };

  const saveAllHierarchies = (hierarchiesToSave = null, currentId = null) => {
    const hierarchiesList = hierarchiesToSave || hierarchies;
    const currentHierarchyIdToSave = currentId || currentHierarchyId;
    
    localStorage.setItem('companyHierarchies', JSON.stringify(hierarchiesList));
    if (currentHierarchyIdToSave) {
      localStorage.setItem('currentHierarchyId', currentHierarchyIdToSave);
    }
  };

  const saveHierarchyToStorage = async (hierarchyToSave = null, employeesToSave = null) => {
    let hierarchyData = hierarchyToSave || hierarchy;
    let employeesData = employeesToSave || employees;
    
    // LEVEL 1: Ensure root always has name before saving
    if (hierarchyData && hierarchyData.root) {
      ensureRootData(hierarchyData);
    }
    
    // LEVEL 2: Remove ALL duplicates before saving (by ID and by name)
    hierarchyData = removeAllDuplicatesComprehensive(hierarchyData);
    
    // LEVEL 3: Rebuild employees map after duplicate removal
    const cleanedEmployees = new Map();
    const rebuildEmployeesMap = (node, parentId = 'root') => {
      if (node.id !== 'root') {
        cleanedEmployees.set(node.id, {
          id: node.id,
          name: node.name,
          designation: node.designation,
          email: node.email || '',
          department: node.department || '',
          reportsTo: parentId,
          subordinateLayout: node.subordinateLayout || 'horizontal'
        });
      }
      node.children.forEach(child => rebuildEmployeesMap(child, node.id));
    };
    rebuildEmployeesMap(hierarchyData.root);
    employeesData = cleanedEmployees;
    
    if (!currentHierarchyId) {
      console.error('No current hierarchy ID');
      return;
    }
    
    // Update the current hierarchy in the list
    const updatedHierarchies = hierarchies.map(h => {
      if (h.id === currentHierarchyId) {
        return {
          ...h,
          hierarchy: hierarchyData,
          employees: Array.from(employeesData.entries()),
          companyName: companyName,
          companyLogo: companyLogo,
          updatedAt: new Date().toISOString()
        };
      }
      return h;
    });
    
    setHierarchies(updatedHierarchies);
    saveAllHierarchies(updatedHierarchies, currentHierarchyId);
    
    // Legacy: Also save to old format for backward compatibility
    localStorage.setItem('companyHierarchy', JSON.stringify({
      hierarchy: hierarchyData,
      employees: Array.from(employeesData.entries())
    }));

    // Data saved to localStorage (MongoDB backend integration can be added later)
    setSyncStatus('saved');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCompanyNameChange = (value) => {
    setCompanyName(value);
    localStorage.setItem('hierarchyCompanyName', value);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setCompanyLogo(null);
      setSelectedFileName(null);
      localStorage.removeItem('hierarchyCompanyLogo');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      setSelectedFileName(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      setSelectedFileName(null);
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const logoData = event.target.result;
      setCompanyLogo(logoData);
      localStorage.setItem('hierarchyCompanyLogo', logoData);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setCompanyLogo(null);
    setSelectedFileName(null);
    localStorage.removeItem('hierarchyCompanyLogo');
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const employeeId = formData.id || 'emp_' + Date.now();
    
    // Debug: log the formData to see what subordinateLayout value we're getting
    console.log('Saving employee with formData:', {
      id: employeeId,
      name: formData.name,
      subordinateLayout: formData.subordinateLayout,
      formDataFull: formData
    });
    
    const employee = {
      id: employeeId,
      name: formData.name.trim(),
      designation: formData.designation.trim(),
      department: formData.department.trim(),
      email: formData.email.trim(),
      reportsTo: formData.reportsTo || 'root',
      subordinateLayout: formData.subordinateLayout || 'horizontal'
    };
    
    console.log('Employee object being saved:', {
      id: employee.id,
      name: employee.name,
      subordinateLayout: employee.subordinateLayout
    });

    // The subordinateLayout in the employee object controls how THIS employee's subordinates will be displayed
    // So we just need to ensure it's saved with the employee - no need to update parent

    if (editingEmployeeId) {
      const existing = employees.get(editingEmployeeId);
      if (existing) {
        // Update the employee in the employees map
        const updatedEmployees = new Map(employees);
        updatedEmployees.set(editingEmployeeId, employee);
        setEmployees(updatedEmployees);
        
        // Update the hierarchy node directly
        const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
        const nodeToUpdate = findNodeById(updatedHierarchy.root, editingEmployeeId);
        if (nodeToUpdate) {
          nodeToUpdate.name = employee.name;
          nodeToUpdate.designation = employee.designation;
          nodeToUpdate.department = employee.department || '';
          nodeToUpdate.email = employee.email || '';
          nodeToUpdate.subordinateLayout = employee.subordinateLayout || 'horizontal';
        }
        
        // If reportsTo changed, move the employee
        if (existing.reportsTo !== employee.reportsTo) {
          removeEmployeeFromHierarchy(editingEmployeeId);
          addEmployeeToHierarchy(employee, employee.reportsTo || 'root');
        } else {
          // Ensure the hierarchy node is updated with the latest subordinateLayout
          if (nodeToUpdate) {
            // IMPORTANT: Preserve children array when updating (it should be preserved by JSON.parse, but let's be explicit)
            const existingChildren = nodeToUpdate.children || [];
            
            nodeToUpdate.subordinateLayout = employee.subordinateLayout || 'horizontal';
            // Also update other fields to ensure consistency
            nodeToUpdate.name = employee.name;
            nodeToUpdate.designation = employee.designation;
            nodeToUpdate.department = employee.department || '';
            nodeToUpdate.email = employee.email || '';
            // Ensure children array is preserved
            if (!nodeToUpdate.children || nodeToUpdate.children.length !== existingChildren.length) {
              nodeToUpdate.children = existingChildren;
            }
            
            // Debug: verify what we're saving
            console.log('Updated hierarchy node:', {
              id: nodeToUpdate.id,
              name: nodeToUpdate.name,
              subordinateLayout: nodeToUpdate.subordinateLayout,
              employeeSubordinateLayout: employee.subordinateLayout,
              childrenCount: nodeToUpdate.children.length,
              children: nodeToUpdate.children.map(c => ({ id: c.id, name: c.name }))
            });
          }
          setHierarchy(updatedHierarchy);
          setEmployees(updatedEmployees);
          saveHierarchyToStorage(updatedHierarchy, updatedEmployees);
          
          // Debug: verify what's in the employees map after update
          const savedEmployee = updatedEmployees.get(editingEmployeeId);
          console.log('Employee in map after save:', {
            id: savedEmployee?.id,
            name: savedEmployee?.name,
            subordinateLayout: savedEmployee?.subordinateLayout
          });
        }
      }
      setEditingEmployeeId(null);
    } else {
      addEmployeeToHierarchy(employee, employee.reportsTo || 'root');
    }

    resetForm();
  };

  const findNodeById = (node, id) => {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
    return null;
  };

  // Find all occurrences of an employee ID in the hierarchy
  const findAllOccurrences = (node, targetId, path = []) => {
    const occurrences = [];
    if (node.id === targetId) {
      occurrences.push({ node, path: [...path] });
    }
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      occurrences.push(...findAllOccurrences(child, targetId, [...path, i]));
    }
    return occurrences;
  };

  // Find all occurrences by name (case-insensitive)
  const findAllOccurrencesByName = (node, targetName, path = []) => {
    const occurrences = [];
    if (node.id !== 'root' && node.name && targetName && 
        node.name.toLowerCase().trim() === targetName.toLowerCase().trim()) {
      occurrences.push({ node, path: [...path] });
    }
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      occurrences.push(...findAllOccurrencesByName(child, targetName, [...path, i]));
    }
    return occurrences;
  };

  // Check and remove duplicates by name (for cases like Ameen Khan with different IDs)
  const checkAndRemoveDuplicatesByName = () => {
    const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
    const employeeNames = new Map(); // name -> array of occurrences
    
    // Collect all employees by name
    const traverse = (node, path = []) => {
      if (node.id !== 'root' && node.name && node.name.trim()) {
        const nameKey = node.name.toLowerCase().trim();
        if (!employeeNames.has(nameKey)) {
          employeeNames.set(nameKey, []);
        }
        employeeNames.get(nameKey).push({ node, path: [...path] });
      }
      for (let i = 0; i < node.children.length; i++) {
        traverse(node.children[i], [...path, i]);
      }
    };
    traverse(updatedHierarchy.root);
    
    let removedAny = false;
    
    // For each name that appears multiple times, keep only the deeper occurrence
    employeeNames.forEach((occurrences, nameKey) => {
      if (occurrences.length > 1) {
        // Find the occurrence that's NOT a direct child of root (deeper in hierarchy)
        let keepIndex = 0;
        for (let i = 0; i < occurrences.length; i++) {
          const { path } = occurrences[i];
          // If this occurrence is NOT a direct child of root (path.length > 0), prefer it
          if (path.length > 0) {
            keepIndex = i;
            break;
          }
        }
        
        // Remove all occurrences except the one we're keeping
        for (let i = 0; i < occurrences.length; i++) {
          if (i === keepIndex) continue; // Skip the one we're keeping
          
          const { path } = occurrences[i];
          let current = updatedHierarchy.root;
          for (let j = 0; j < path.length - 1; j++) {
            current = current.children[path[j]];
          }
          // Remove the duplicate from its parent's children
          const originalLength = current.children.length;
          current.children = current.children.filter((child, idx) => idx !== path[path.length - 1]);
          if (current.children.length < originalLength) {
            removedAny = true;
          }
        }
      }
    });
    
    if (removedAny) {
      setHierarchy(updatedHierarchy);
      // Rebuild employees map
      const updatedEmployees = new Map();
      const rebuildMap = (node, parentId = 'root') => {
        if (node.id !== 'root') {
          updatedEmployees.set(node.id, {
            id: node.id,
            name: node.name,
            designation: node.designation,
            email: node.email || '',
            department: node.department || '',
            reportsTo: parentId,
            subordinateLayout: node.subordinateLayout || 'horizontal'
          });
        }
        node.children.forEach(child => rebuildMap(child, node.id));
      };
      rebuildMap(updatedHierarchy.root);
      setEmployees(updatedEmployees);
      saveHierarchyToStorage(updatedHierarchy, updatedEmployees);
      return true;
    }
    return false;
  };

  // Remove duplicate employees - keeps the deeper occurrence (not top-level), removes others
  const removeDuplicateEmployees = () => {
    const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
    const employeeIds = new Set();
    const duplicates = [];
    
    // Find all employee IDs and track duplicates
    const traverse = (node) => {
      if (node.id !== 'root') {
        if (employeeIds.has(node.id)) {
          duplicates.push(node.id);
        } else {
          employeeIds.add(node.id);
        }
      }
      node.children.forEach(child => traverse(child));
    };
    traverse(updatedHierarchy.root);
    
    // Remove duplicate occurrences - keep the one that's NOT a direct child of root (deeper in hierarchy)
    duplicates.forEach(duplicateId => {
      const occurrences = findAllOccurrences(updatedHierarchy.root, duplicateId);
      
      // Find which occurrence to keep (prefer deeper, not direct child of root)
      let keepIndex = 0;
      for (let i = 0; i < occurrences.length; i++) {
        const { path } = occurrences[i];
        // If this occurrence is NOT a direct child of root (path.length > 1), prefer it
        if (path.length > 1) {
          keepIndex = i;
          break;
        }
      }
      
      // Remove all occurrences except the one we're keeping
      for (let i = 0; i < occurrences.length; i++) {
        if (i === keepIndex) continue; // Skip the one we're keeping
        
        const { path } = occurrences[i];
        let current = updatedHierarchy.root;
        for (let j = 0; j < path.length - 1; j++) {
          current = current.children[path[j]];
        }
        // Remove the duplicate from its parent's children
        current.children = current.children.filter(child => child.id !== duplicateId);
      }
    });
    
    if (duplicates.length > 0) {
      setHierarchy(updatedHierarchy);
      // Also update employees map to remove duplicates
      const updatedEmployees = new Map();
      const rebuildMap = (node, parentId = 'root') => {
        if (node.id !== 'root') {
          updatedEmployees.set(node.id, {
            id: node.id,
            name: node.name,
            designation: node.designation,
            email: node.email || '',
            department: node.department || '',
            reportsTo: parentId,
            subordinateLayout: node.subordinateLayout || 'horizontal'
          });
        }
        node.children.forEach(child => rebuildMap(child, node.id));
      };
      rebuildMap(updatedHierarchy.root);
      setEmployees(updatedEmployees);
      saveHierarchyToStorage(updatedHierarchy, updatedEmployees);
      alert(`Removed ${duplicates.length} duplicate employee(s) from the hierarchy. Kept the deeper occurrences.`);
      return true;
    } else {
      alert('No duplicate employees found in the hierarchy.');
      return false;
    }
  };

  // Find employee by name (case-insensitive, for duplicate detection)
  const findEmployeeByName = (node, name) => {
    if (node.id !== 'root' && node.name && name && 
        node.name.toLowerCase().trim() === name.toLowerCase().trim()) {
      return node;
    }
    for (const child of node.children) {
      const found = findEmployeeByName(child, name);
      if (found) return found;
    }
    return null;
  };

  const addEmployeeToHierarchy = (employee, parentId) => {
    // Check if employee already exists in hierarchy by ID
    const existingNodeById = findNodeById(hierarchy.root, employee.id);
    if (existingNodeById) {
      alert(`Employee "${employee.name}" already exists in the hierarchy (same ID). Please edit the existing employee instead.`);
      return;
    }

    // Also check by name to prevent duplicates with different IDs
    const existingNodeByName = findEmployeeByName(hierarchy.root, employee.name);
    if (existingNodeByName) {
      alert(`Employee "${employee.name}" already exists in the hierarchy. Please edit the existing employee instead of adding a duplicate.`);
      return;
    }

    const employeeNode = {
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      department: employee.department || '',
      email: employee.email || '',
      subordinateLayout: employee.subordinateLayout || 'horizontal',
      children: []
    };

    const updatedEmployees = new Map(employees);
    updatedEmployees.set(employee.id, employee);
    setEmployees(updatedEmployees);

    const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
    if (parentId === 'root' || !parentId) {
      updatedHierarchy.root.children.push(employeeNode);
    } else {
      const parent = findNodeById(updatedHierarchy.root, parentId);
      if (parent) {
        // Check if employee already exists as a child of this parent (by ID or name)
        const alreadyChildById = parent.children.some(child => child.id === employee.id);
        const alreadyChildByName = parent.children.some(child => 
          child.name && employee.name && 
          child.name.toLowerCase().trim() === employee.name.toLowerCase().trim()
        );
        if (alreadyChildById || alreadyChildByName) {
          alert(`Employee "${employee.name}" already exists under this manager.`);
          return;
        }
        parent.children.push(employeeNode);
      } else {
        updatedHierarchy.root.children.push(employeeNode);
      }
    }

    setHierarchy(updatedHierarchy);
    setEmployees(updatedEmployees);
    saveHierarchyToStorage(updatedHierarchy, updatedEmployees);
  };

  const removeEmployeeFromHierarchy = (employeeId) => {
    const updatedEmployees = new Map(employees);
    updatedEmployees.delete(employeeId);
    setEmployees(updatedEmployees);

    const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
    function removeFromNode(node) {
      node.children = node.children.filter(child => {
        if (child.id === employeeId) {
          if (node.id === 'root') {
            updatedHierarchy.root.children.push(...child.children);
          } else {
            node.children.push(...child.children);
          }
          return false;
        }
        removeFromNode(child);
        return true;
      });
    }
    removeFromNode(updatedHierarchy.root);
    setHierarchy(updatedHierarchy);
    saveHierarchyToStorage();
  };

  const editEmployee = (id) => {
    const employee = employees.get(id);
    if (!employee) return;
    setEditingEmployeeId(id);
    
    // Find the parent of this employee
    const findParent = (node, targetId) => {
      for (const child of node.children) {
        if (child.id === targetId) return node.id;
        const found = findParent(child, targetId);
        if (found) return found;
      }
      return null;
    };
    const parentId = findParent(hierarchy.root, id) || 'root';
    
    const formDataToSet = {
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      department: employee.department || '',
      email: employee.email || '',
      parentId: parentId,
      reportsTo: employee.reportsTo || 'root',
      subordinateLayout: employee.subordinateLayout || 'horizontal'
    };
    
    // Debug: log what we're loading into the form
    console.log('Loading employee for edit:', {
      employeeId: id,
      employeeFromMap: employee,
      employeeSubordinateLayout: employee.subordinateLayout,
      formDataSubordinateLayout: formDataToSet.subordinateLayout
    });
    
    setFormData(formDataToSet);
  };

  const deleteEmployee = (id) => {
    if (confirm('Are you sure you want to delete this employee? Their subordinates will be moved up.')) {
      removeEmployeeFromHierarchy(id);
    }
  };

  const resetForm = () => {
    setEditingEmployeeId(null);
    setFormData({
      id: '',
      name: '',
      designation: '',
      department: '',
      email: '',
      parentId: 'root',
      reportsTo: 'root',
      subordinateLayout: 'horizontal'
    });
  };

  const renderHierarchy = () => {
    const container = hierarchyTreeRef.current;
    if (!container) return;

    container.innerHTML = '';
    
    // Create a wrapper div for scaling
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'hierarchy-content-wrapper';
    wrapperDiv.style.width = '100%';
    wrapperDiv.style.maxWidth = '100%';
    wrapperDiv.style.display = 'block';
    wrapperDiv.style.margin = '0 auto';
    wrapperDiv.style.textAlign = 'center';
    wrapperDiv.style.boxSizing = 'border-box';
    wrapperDiv.style.paddingTop = '20px';
    wrapperDiv.style.paddingBottom = '20px';
    container.appendChild(wrapperDiv);

    // Add hierarchy header with title and logo - properly aligned
    if (companyName || companyLogo) {
      const headerDiv = document.createElement('div');
      headerDiv.className = 'text-center mb-8 pb-4 border-b-2 border-gray-300';
      headerDiv.style.width = '100%';
      headerDiv.style.display = 'block';
      
      const headerContentDiv = document.createElement('div');
      headerContentDiv.style.display = 'flex';
      headerContentDiv.style.alignItems = 'center';
      headerContentDiv.style.justifyContent = 'center';
      headerContentDiv.style.gap = '16px';
      headerContentDiv.style.marginBottom = '8px';
      headerContentDiv.style.flexWrap = 'nowrap';
      
      if (companyLogo) {
        const logoImg = document.createElement('img');
        logoImg.src = companyLogo;
        logoImg.alt = 'Hierarchy Logo';
        logoImg.style.height = '48px';
        logoImg.style.width = 'auto';
        logoImg.style.objectFit = 'contain';
        logoImg.style.flexShrink = '0';
        headerContentDiv.appendChild(logoImg);
      }
      
      if (companyName) {
        const titleH2 = document.createElement('h2');
        titleH2.textContent = companyName;
        titleH2.style.fontSize = '1.5rem';
        titleH2.style.fontWeight = 'bold';
        titleH2.style.color = '#1f2937';
        titleH2.style.margin = '0';
        titleH2.style.padding = '0';
        titleH2.style.lineHeight = '1.2';
        headerContentDiv.appendChild(titleH2);
      }
      
      headerDiv.appendChild(headerContentDiv);
      wrapperDiv.appendChild(headerDiv);
    }

    // Always show the root employee (Chandan Kumar) in the root card design
    const rootEmployee = hierarchy.root || {};
    
    // Get root data with fallbacks - don't mutate the original object
    const rootName = (rootEmployee.name && rootEmployee.name.trim()) ? rootEmployee.name : 'Chandan Kumar';
    const rootDesignation = (rootEmployee.designation && rootEmployee.designation.trim()) ? rootEmployee.designation : 'MD & Co-Founder';
    const rootEmail = (rootEmployee.email && rootEmployee.email.trim()) ? rootEmployee.email : 'chandan@abheepay.com';
    const rootDepartment = (rootEmployee.department && rootEmployee.department.trim()) ? rootEmployee.department : 'Top-Level Management';
    
    const rootDiv = document.createElement('div');
    rootDiv.className = 'text-center mb-8';
    rootDiv.style.width = '100%';
    rootDiv.style.display = 'block';
    rootDiv.style.marginTop = '20px';
    rootDiv.style.marginBottom = '32px';
    rootDiv.setAttribute('data-root-employee', 'true'); // Marker for export verification
    
    const rootCard = document.createElement('div');
    rootCard.style.display = 'inline-block';
    rootCard.style.background = 'linear-gradient(to right, #3b82f6, #4f46e5)';
    rootCard.style.color = 'white';
    rootCard.style.padding = '16px 24px';
    rootCard.style.borderRadius = '8px';
    rootCard.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    
    const nameDiv = document.createElement('div');
    nameDiv.textContent = rootName;
    nameDiv.style.fontWeight = 'bold';
    nameDiv.style.fontSize = '1.125rem';
    nameDiv.style.color = 'white';
    nameDiv.style.marginBottom = '4px';
    rootCard.appendChild(nameDiv);
    
    const designationDiv = document.createElement('div');
    designationDiv.textContent = rootDesignation;
    designationDiv.style.fontSize = '0.875rem';
    designationDiv.style.opacity = '0.9';
    designationDiv.style.color = 'white';
    designationDiv.style.marginBottom = '4px';
    rootCard.appendChild(designationDiv);
    
    if (rootDepartment) {
      const deptDiv = document.createElement('div');
      deptDiv.textContent = rootDepartment;
      deptDiv.style.fontSize = '0.75rem';
      deptDiv.style.opacity = '0.75';
      deptDiv.style.color = 'white';
      deptDiv.style.marginTop = '4px';
      rootCard.appendChild(deptDiv);
    }
    
    if (rootEmail) {
      const emailDiv = document.createElement('div');
      emailDiv.textContent = rootEmail;
      emailDiv.style.fontSize = '0.75rem';
      emailDiv.style.opacity = '0.75';
      emailDiv.style.color = 'white';
      emailDiv.style.marginTop = '4px';
      rootCard.appendChild(emailDiv);
    }
    
    rootDiv.appendChild(rootCard);
    wrapperDiv.appendChild(rootDiv);
    
    // Update the hierarchy root if it's missing data (but don't trigger re-render during render)
    if (!rootEmployee.name || !rootEmployee.name.trim() || 
        !rootEmployee.designation || !rootEmployee.designation.trim() ||
        !rootEmployee.email || !rootEmployee.email.trim() ||
        !rootEmployee.department || !rootEmployee.department.trim()) {
      // Update root data asynchronously to avoid state update during render
      setTimeout(() => {
        const updatedHierarchy = JSON.parse(JSON.stringify(hierarchy));
        ensureRootData(updatedHierarchy);
        setHierarchy(updatedHierarchy);
      }, 0);
    }

    // Check if there are any employees (children of root)
    if (hierarchy.root.children.length === 0) {
      return;
    }

    // Check if we need to show anything below the root
    const hasTopLevelEmployees = hierarchy.root.children.length > 0;

    if (hasTopLevelEmployees) {
      // Add vertical connector from root to children
      const connectorDiv = document.createElement('div');
      connectorDiv.className = 'flex justify-center mb-4';
      connectorDiv.innerHTML = '<div class="w-0.5 h-6 bg-gray-400"></div>';
      wrapperDiv.appendChild(connectorDiv);

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'mt-6 w-full';
      childrenContainer.style.width = '100%';
      childrenContainer.style.display = 'block';
      
      // Show all top-level employees (children of root)
      renderNodeChildren(hierarchy.root, childrenContainer, 0);
      
      wrapperDiv.appendChild(childrenContainer);
    }

    // Auto-scale the hierarchy to fit within the container width
    setTimeout(() => {
      const containerWidth = container.offsetWidth;
      const contentWidth = wrapperDiv.scrollWidth;
      
      if (contentWidth > containerWidth && containerWidth > 0) {
        const scale = Math.min(1, (containerWidth - 40) / contentWidth); // Leave 20px padding on each side
        // Apply scale transform, centered at top
        wrapperDiv.style.transform = `scale(${scale})`;
        wrapperDiv.style.transformOrigin = 'top center';
        wrapperDiv.style.width = `${100 / scale}%`;
        wrapperDiv.style.marginLeft = 'auto';
        wrapperDiv.style.marginRight = 'auto';
      } else {
        // Reset if no scaling needed
        wrapperDiv.style.transform = '';
        wrapperDiv.style.transformOrigin = '';
        wrapperDiv.style.width = '100%';
        wrapperDiv.style.marginLeft = 'auto';
        wrapperDiv.style.marginRight = 'auto';
      }
    }, 100);
  };

  const renderNodeChildren = (node, container, level) => {
    // Show all children, but filter out root if it somehow appears in its own children
    const childrenToRender = node.children.filter(child => {
      // Never show root as its own child
      if (child.id === 'root') return false;
      // If rendering root's children, also filter out any child with the same email as root
      if (node.id === 'root' && hierarchy.root.email && child.email === hierarchy.root.email) {
        return false;
      }
      return true;
    });
    
    if (childrenToRender.length === 0) return;

    // First level (under root) is always horizontal
    // For deeper levels, check the parent's subordinateLayout preference
    let useHorizontalLayout = true;
    if (level > 0) {
      // Get the parent's layout preference
      const parentEmployee = employees.get(node.id);
      const layoutPreference = parentEmployee?.subordinateLayout || node.subordinateLayout || 'horizontal';
      useHorizontalLayout = layoutPreference === 'horizontal';
    }

    const childrenDiv = document.createElement('div');
    if (useHorizontalLayout) {
      // Adjust gap based on number of children - smaller gap for more children
      const gapSize = childrenToRender.length > 5 ? 'gap-1' : childrenToRender.length > 3 ? 'gap-2' : 'gap-3';
      childrenDiv.className = `flex flex-row flex-nowrap justify-center items-start ${gapSize} mb-4 sm:mb-6 relative w-full pb-2`;
      childrenDiv.style.display = 'flex';
      childrenDiv.style.flexDirection = 'row';
      childrenDiv.style.flexWrap = 'nowrap';
      childrenDiv.style.alignItems = 'flex-start';
    } else {
      // Vertical layout - ensure items stack vertically
      childrenDiv.className = 'flex flex-col items-center gap-6 mb-6 relative w-full';
      childrenDiv.style.display = 'flex';
      childrenDiv.style.flexDirection = 'column';
      childrenDiv.style.width = '100%';
    }

    childrenToRender.forEach((child, index) => {
      const employeeRow = document.createElement('div');
      // For vertical layout, don't use flex-1, use full width
      if (useHorizontalLayout) {
        employeeRow.className = 'flex flex-col items-center relative flex-1 min-w-0';
        employeeRow.style.flex = '1 1 0%';
        employeeRow.style.minWidth = '0';
        employeeRow.style.maxWidth = '100%';
        employeeRow.style.display = 'flex';
        employeeRow.style.flexDirection = 'column';
        employeeRow.style.alignItems = 'center';
      } else {
        employeeRow.className = 'flex flex-col items-center relative w-full';
        employeeRow.style.width = '100%';
      }

      // Vertical connector from parent to this employee
      const topConnector = document.createElement('div');
      topConnector.className = 'w-0.5 h-6 bg-gray-400 mb-2 relative z-10';
      topConnector.style.marginTop = '0';
      employeeRow.appendChild(topConnector);

      // Employee card
      const cardWrapper = document.createElement('div');
      cardWrapper.className = 'flex flex-col items-center relative w-full';
      cardWrapper.style.display = 'flex';
      cardWrapper.style.flexDirection = 'column';
      cardWrapper.style.alignItems = 'center';
      cardWrapper.style.width = '100%';
      
      const card = document.createElement('div');
      // Highlight all employees
      const isManager = true;
      // Apply different styling based on role - use fixed width for perfect alignment
      const cardClass = isManager 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg p-2 shadow-lg w-[200px] relative group hover:border-blue-500 hover:shadow-xl transition-all'
        : 'bg-white border-2 border-gray-200 rounded-lg p-2 shadow-sm w-[200px] relative group hover:border-gray-400 transition-colors';
      card.className = cardClass;
      card.style.width = '200px';
      card.style.minWidth = '200px';
      card.style.maxWidth = '200px';
      card.style.marginLeft = 'auto';
      card.style.marginRight = 'auto';
      const emailDisplay = child.email && child.email.trim() ? `<div class="text-xs ${isManager ? 'text-gray-600' : 'text-gray-500'} mb-1 break-words px-1" title="${child.email}">${child.email}</div>` : '';
      const nameClass = isManager ? 'font-bold text-blue-900 mb-1 text-sm leading-tight' : 'font-bold text-gray-800 mb-1 text-sm leading-tight';
      const designationClass = isManager ? 'text-xs text-blue-700 mb-1 leading-tight' : 'text-xs text-gray-600 mb-1 leading-tight';
      card.innerHTML = `
        <div class="text-center">
          <div class="${nameClass}">${child.name}</div>
          <div class="${designationClass}">${child.designation}</div>
          ${child.department ? `<div class="text-xs ${isManager ? 'text-indigo-600' : 'text-primary-600'} mb-1 font-medium leading-tight">${child.department}</div>` : ''}
          ${emailDisplay}
          <div class="flex gap-1 justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onclick="window.editEmployeeReact('${child.id}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
            <button onclick="window.deleteEmployeeReact('${child.id}')" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
          </div>
        </div>
      `;
      cardWrapper.appendChild(card);

      
      // If this employee has subordinates, display them based on their layout preference
      if (child.children.length > 0) {
        // Get layout preference for this employee's subordinates
        const employeeData = employees.get(child.id);
        // Check both employees Map and hierarchy node for subordinateLayout
        // Priority: employees Map first (most up-to-date), then hierarchy node, then default to horizontal
        // Explicitly check for 'horizontal' or 'vertical' strings, not just truthy values
        let childLayoutPreference = 'horizontal'; // Default
        if (employeeData?.subordinateLayout === 'horizontal' || employeeData?.subordinateLayout === 'vertical') {
          childLayoutPreference = employeeData.subordinateLayout;
        } else if (child.subordinateLayout === 'horizontal' || child.subordinateLayout === 'vertical') {
          childLayoutPreference = child.subordinateLayout;
        }
        const useHorizontalForSubs = childLayoutPreference === 'horizontal';
        
        
        // Add vertical connector line from employee card down to subordinates
        const verticalConnector = document.createElement('div');
        verticalConnector.className = 'w-0.5 h-6 bg-gray-400 mt-2';
        cardWrapper.appendChild(verticalConnector);

        const subordinatesContainer = document.createElement('div');
        if (useHorizontalForSubs) {
          // Adjust gap based on number of children
          const gapSize = child.children.length > 5 ? 'gap-1' : child.children.length > 3 ? 'gap-2' : 'gap-3';
          subordinatesContainer.className = `flex flex-row flex-nowrap ${gapSize} justify-center items-start mt-2 relative w-full pb-2`;
          subordinatesContainer.style.display = 'flex';
          subordinatesContainer.style.flexDirection = 'row';
          subordinatesContainer.style.flexWrap = 'nowrap';
          subordinatesContainer.style.alignItems = 'flex-start';
        } else {
          // Vertical layout - stack items top to bottom
          subordinatesContainer.className = 'flex flex-col items-center gap-4 mt-2 relative w-full';
          subordinatesContainer.style.display = 'flex';
          subordinatesContainer.style.flexDirection = 'column';
          subordinatesContainer.style.flexWrap = 'nowrap';
          subordinatesContainer.style.width = '100%';
          subordinatesContainer.style.alignItems = 'center';
        }
        
        // Add horizontal connector line above subordinates if more than one and using horizontal layout
        if (child.children.length > 1 && useHorizontalForSubs) {
          const horizontalLine = document.createElement('div');
          horizontalLine.className = 'absolute top-[-12px] left-0 right-0 h-0.5 bg-gray-400';
          horizontalLine.style.zIndex = '1';
          subordinatesContainer.appendChild(horizontalLine);
        }

        child.children.forEach((subordinate, subIndex) => {
          const subWrapper = document.createElement('div');
          // For vertical layout, don't use flex-1, use full width
          if (useHorizontalForSubs) {
            subWrapper.className = 'flex flex-col items-center relative flex-1 min-w-0';
            subWrapper.style.flex = '1 1 0%';
            subWrapper.style.minWidth = '0';
            subWrapper.style.maxWidth = '100%';
            subWrapper.style.display = 'flex';
            subWrapper.style.flexDirection = 'column';
            subWrapper.style.alignItems = 'center';
          } else {
            subWrapper.className = 'flex flex-col items-center relative w-full';
            subWrapper.style.width = '100%';
            subWrapper.style.flex = 'none';
            subWrapper.style.maxWidth = '100%';
          }

          // Vertical connector from manager to subordinate (always show, even for single subordinate)
          const subConnector = document.createElement('div');
          subConnector.className = 'w-0.5 h-6 bg-gray-400 mb-2 relative z-10';
          subWrapper.appendChild(subConnector);

          const subCard = document.createElement('div');
          // Highlight all employees
          const isSubManager = true;
          // Apply styling: managers get blue highlight, regular employees get light gray - use fixed width for perfect alignment
          const subCardClass = isSubManager
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg p-2 sm:p-3 shadow-lg w-[200px] relative group hover:border-blue-500 hover:shadow-xl transition-all'
            : 'bg-gray-50 border-2 border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm w-[200px] relative group hover:border-gray-400 transition-colors';
          subCard.className = subCardClass;
          subCard.style.width = '200px';
          subCard.style.minWidth = '200px';
          subCard.style.maxWidth = '200px';
          subCard.style.marginLeft = 'auto';
          subCard.style.marginRight = 'auto';
          const subEmailDisplay = subordinate.email && subordinate.email.trim() ? `<div class="text-xs ${isSubManager ? 'text-gray-600' : 'text-gray-500'} mb-1 break-words px-1" title="${subordinate.email}">${subordinate.email}</div>` : '';
          const subNameClass = isSubManager ? 'font-bold text-blue-900 mb-1 text-sm leading-tight' : 'font-bold text-gray-700 mb-1 text-sm leading-tight';
          const subDesignationClass = isSubManager ? 'text-xs text-blue-700 mb-1 leading-tight' : 'text-xs text-gray-600 mb-1 leading-tight';
          subCard.innerHTML = `
            <div class="text-center">
              <div class="${subNameClass}">${subordinate.name}</div>
              <div class="${subDesignationClass}">${subordinate.designation}</div>
              ${subordinate.department ? `<div class="text-xs ${isSubManager ? 'text-indigo-600' : 'text-primary-600'} mb-1 font-medium leading-tight">${subordinate.department}</div>` : ''}
              ${subEmailDisplay}
              <div class="flex gap-1 justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="window.editEmployeeReact('${subordinate.id}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                <button onclick="window.deleteEmployeeReact('${subordinate.id}')" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
              </div>
            </div>
          `;
          subWrapper.appendChild(subCard);

          // If subordinate has children, add vertical connector and render them
          if (subordinate.children.length > 0) {
            // Get layout preference for this subordinate's children
            const subEmployeeData = employees.get(subordinate.id);
            const subChildLayoutPreference = subEmployeeData?.subordinateLayout || subordinate.subordinateLayout || 'horizontal';
            const useHorizontalForDeepSubs = subChildLayoutPreference === 'horizontal';
            
            const subVerticalConnector = document.createElement('div');
            subVerticalConnector.className = 'w-0.5 h-6 bg-gray-400 mt-2';
            subWrapper.appendChild(subVerticalConnector);

            const deeperContainer = document.createElement('div');
            if (useHorizontalForDeepSubs) {
              // Adjust gap based on number of children
              const gapSize = subordinate.children.length > 5 ? 'gap-1' : subordinate.children.length > 3 ? 'gap-2' : 'gap-3';
              deeperContainer.className = `flex flex-row flex-nowrap ${gapSize} justify-center items-start mt-2 relative w-full pb-2`;
              deeperContainer.style.display = 'flex';
              deeperContainer.style.flexDirection = 'row';
              deeperContainer.style.flexWrap = 'nowrap';
              deeperContainer.style.alignItems = 'flex-start';
            } else {
              deeperContainer.className = 'flex flex-col items-center gap-3 mt-2 relative w-full';
              deeperContainer.style.display = 'flex';
              deeperContainer.style.flexDirection = 'column';
              deeperContainer.style.flexWrap = 'nowrap';
              deeperContainer.style.width = '100%';
              deeperContainer.style.alignItems = 'center';
            }
            
            // Horizontal line for multiple subordinates (only if using horizontal layout)
            if (subordinate.children.length > 1 && useHorizontalForDeepSubs) {
              const deeperHorizontalLine = document.createElement('div');
              deeperHorizontalLine.className = 'absolute top-[-12px] left-0 right-0 h-0.5 bg-gray-400';
              deeperHorizontalLine.style.zIndex = '1';
              deeperContainer.appendChild(deeperHorizontalLine);
            }

            subordinate.children.forEach((deepSub, deepIndex) => {
              const deepWrapper = document.createElement('div');
              // For vertical layout, don't use flex-1, use full width
              if (useHorizontalForDeepSubs) {
                deepWrapper.className = 'flex flex-col items-center relative flex-1 min-w-0';
                deepWrapper.style.flex = '1 1 0%';
                deepWrapper.style.minWidth = '0';
                deepWrapper.style.maxWidth = '100%';
                deepWrapper.style.display = 'flex';
                deepWrapper.style.flexDirection = 'column';
                deepWrapper.style.alignItems = 'center';
              } else {
                deepWrapper.className = 'flex flex-col items-center relative w-full';
                deepWrapper.style.width = '100%';
                deepWrapper.style.flex = 'none';
                deepWrapper.style.maxWidth = '100%';
              }

              const deepConnector = document.createElement('div');
              deepConnector.className = 'w-0.5 h-6 bg-gray-400 mb-2 relative z-10';
              deepWrapper.appendChild(deepConnector);

              const deepCard = document.createElement('div');
              // Highlight all employees
              const isDeepManager = true;
              // Apply styling: managers get blue highlight, regular employees get light gray - use fixed width for perfect alignment
              const deepCardClass = isDeepManager
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 rounded-lg p-2 sm:p-3 shadow-lg w-[200px] relative group hover:border-blue-500 hover:shadow-xl transition-all'
                : 'bg-gray-50 border-2 border-gray-200 rounded-lg p-2 sm:p-3 shadow-sm w-[200px] relative group hover:border-gray-400 transition-colors';
              deepCard.className = deepCardClass;
              deepCard.style.width = '200px';
              deepCard.style.minWidth = '200px';
              deepCard.style.maxWidth = '200px';
              deepCard.style.marginLeft = 'auto';
              deepCard.style.marginRight = 'auto';
              const deepEmailDisplay = deepSub.email && deepSub.email.trim() ? `<div class="text-xs ${isDeepManager ? 'text-gray-600' : 'text-gray-500'} mb-1 break-words px-1" title="${deepSub.email}">${deepSub.email}</div>` : '';
              const deepNameClass = isDeepManager ? 'font-bold text-blue-900 mb-1 text-sm leading-tight' : 'font-bold text-gray-700 mb-1 text-sm leading-tight';
              const deepDesignationClass = isDeepManager ? 'text-xs text-blue-700 mb-1 leading-tight' : 'text-xs text-gray-600 mb-1 leading-tight';
              deepCard.innerHTML = `
                <div class="text-center">
                  <div class="${deepNameClass}">${deepSub.name}</div>
                  <div class="${deepDesignationClass}">${deepSub.designation}</div>
                  ${deepSub.department ? `<div class="text-xs ${isDeepManager ? 'text-indigo-600' : 'text-primary-600'} mb-1 font-medium leading-tight">${deepSub.department}</div>` : ''}
                  ${deepEmailDisplay}
                  <div class="flex gap-1 justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="window.editEmployeeReact('${deepSub.id}')" class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                    <button onclick="window.deleteEmployeeReact('${deepSub.id}')" class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">Delete</button>
                  </div>
                </div>
              `;
              deepWrapper.appendChild(deepCard);

              // Recursively handle even deeper levels
              if (deepSub.children.length > 0) {
                const evenDeeperContainer = document.createElement('div');
                evenDeeperContainer.className = 'mt-4 w-full';
                // Pass level + 1 to indicate we're going deeper
                renderNodeChildren(deepSub, evenDeeperContainer, level + 1);
                deepWrapper.appendChild(evenDeeperContainer);
              }

              deeperContainer.appendChild(deepWrapper);
            });

            subWrapper.appendChild(deeperContainer);
          }

          subordinatesContainer.appendChild(subWrapper);
        });

        cardWrapper.appendChild(subordinatesContainer);
      }

      employeeRow.appendChild(cardWrapper);
      childrenDiv.appendChild(employeeRow);
    });

    // Add horizontal connector line above children if more than one and using horizontal layout
    // Add it after all children are added so we can position it correctly
    if (childrenToRender.length > 1 && useHorizontalLayout) {
      // Use setTimeout to ensure all children are rendered before calculating positions
      setTimeout(() => {
        if (childrenDiv.children.length > 1) {
          const horizontalLine = document.createElement('div');
          horizontalLine.className = 'absolute h-0.5 bg-gray-400';
          horizontalLine.style.top = '0px';
          horizontalLine.style.zIndex = '0';
          horizontalLine.style.pointerEvents = 'none';
          
          // Get the first and last child elements
          const firstChild = childrenDiv.children[0];
          const lastChild = childrenDiv.children[childrenDiv.children.length - 1];
          
          // Calculate positions relative to childrenDiv
          const firstChildCenter = firstChild.offsetLeft + (firstChild.offsetWidth / 2);
          const lastChildCenter = lastChild.offsetLeft + (lastChild.offsetWidth / 2);
          
          horizontalLine.style.left = `${firstChildCenter}px`;
          horizontalLine.style.width = `${lastChildCenter - firstChildCenter}px`;
          
          // Insert at the beginning of childrenDiv
          childrenDiv.insertBefore(horizontalLine, childrenDiv.firstChild);
        }
      }, 10);
    }

    container.appendChild(childrenDiv);
  };

  // Expose functions to window for onclick handlers in dynamically created HTML
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.editEmployeeReact = (id) => {
        editEmployee(id);
      };
      window.deleteEmployeeReact = (id) => {
        if (confirm('Are you sure you want to delete this employee?')) {
          deleteEmployee(id);
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.editEmployeeReact;
        delete window.deleteEmployeeReact;
      }
    };
  }, [employees, hierarchy]);

  const exportToImage = async () => {
    try {
      const container = hierarchyTreeRef.current;
      if (!container) {
        alert('Hierarchy chart not found');
        return;
      }

      if (typeof html2canvas !== 'undefined') {
        // Find the wrapper div inside the container
        const wrapperDiv = container.querySelector('.hierarchy-content-wrapper');
        if (!wrapperDiv) {
          alert('Hierarchy content not found. Please wait for the chart to load.');
          return;
        }
        
        // Temporarily remove overflow-hidden and adjust container to show full content
        const originalOverflow = container.style.overflow;
        const originalClassName = container.className;
        container.style.overflow = 'visible';
        container.className = container.className.replace('overflow-hidden', '');
        
        // Store original transform if any
        const originalTransform = wrapperDiv.style.transform;
        const originalWidth = wrapperDiv.style.width;
        
        // Temporarily reset transform to ensure full content is visible
        if (wrapperDiv.style.transform) {
          wrapperDiv.style.transform = 'none';
          wrapperDiv.style.width = '100%';
        }
        
        // Ensure wrapper div is positioned at top and fully visible
        wrapperDiv.style.paddingTop = '20px';
        wrapperDiv.style.paddingBottom = '20px';
        
        // Wait for DOM to update and ensure root is visible
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Scroll container to top to ensure root is in view
        container.scrollTop = 0;
        container.scrollLeft = 0;
        
        // Force a reflow to ensure root is rendered
        wrapperDiv.offsetHeight;
        
        // Verify root is visible in the wrapper - use data attribute for reliable selection
        const rootElement = wrapperDiv.querySelector('[data-root-employee="true"]');
        if (!rootElement) {
          console.warn('Root employee element not found, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Ensure root is at the top of the viewport
        if (rootElement) {
          rootElement.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'center' });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Double-check root name is visible
        const rootNameElement = rootElement ? rootElement.querySelector('div[style*="font-weight: bold"]') : null;
        if (rootNameElement && !rootNameElement.textContent.trim()) {
          console.warn('Root name is empty, ensuring it has content...');
          rootNameElement.textContent = hierarchy.root?.name || 'Chandan Kumar';
        }
        
        const canvas = await html2canvas(wrapperDiv, {
          backgroundColor: '#f9fafb',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          height: wrapperDiv.scrollHeight,
          width: wrapperDiv.scrollWidth,
          onclone: (clonedDoc) => {
            // Verify root is in cloned document
            const clonedWrapper = clonedDoc.querySelector('.hierarchy-content-wrapper');
            if (clonedWrapper) {
              const clonedRoot = clonedWrapper.querySelector('[data-root-employee="true"]');
              if (clonedRoot) {
                console.log('Root element found in cloned document for export');
              } else {
                console.warn('Root element NOT found in cloned document');
              }
            }
          }
        });
        
        // Restore padding
        wrapperDiv.style.paddingTop = '';
        wrapperDiv.style.paddingBottom = '';
        
        // Restore original styles
        container.style.overflow = originalOverflow;
        container.className = originalClassName;
        if (originalTransform) {
          wrapperDiv.style.transform = originalTransform;
          wrapperDiv.style.width = originalWidth;
        }
        
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'company-hierarchy.png';
        a.click();
      } else {
        alert('html2canvas library is required for image export.');
      }
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Error exporting image: ' + error.message);
    }
  };

  const exportToPDF = async () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        alert('PDF library not loaded. Please refresh the page.');
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4');
      const container = hierarchyTreeRef.current;
      if (!container) {
        alert('Hierarchy chart not found');
        return;
      }

      if (typeof html2canvas !== 'undefined') {
        // Find the wrapper div inside the container
        const wrapperDiv = container.querySelector('.hierarchy-content-wrapper');
        if (!wrapperDiv) {
          alert('Hierarchy content not found. Please wait for the chart to load.');
          return;
        }
        
        // Temporarily remove overflow-hidden and adjust container to show full content
        const originalOverflow = container.style.overflow;
        const originalClassName = container.className;
        container.style.overflow = 'visible';
        container.className = container.className.replace('overflow-hidden', '');
        
        // Store original transform if any
        const originalTransform = wrapperDiv.style.transform;
        const originalWidth = wrapperDiv.style.width;
        
        // Temporarily reset transform to ensure full content is visible
        if (wrapperDiv.style.transform) {
          wrapperDiv.style.transform = 'none';
          wrapperDiv.style.width = '100%';
        }
        
        // Ensure wrapper div is positioned at top and fully visible
        wrapperDiv.style.paddingTop = '20px';
        wrapperDiv.style.paddingBottom = '20px';
        
        // Wait for DOM to update and ensure root is visible
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Scroll container to top to ensure root is in view
        container.scrollTop = 0;
        container.scrollLeft = 0;
        
        // Force a reflow to ensure root is rendered
        wrapperDiv.offsetHeight;
        
        // Verify root is visible in the wrapper - use data attribute for reliable selection
        const rootElement = wrapperDiv.querySelector('[data-root-employee="true"]');
        if (!rootElement) {
          console.warn('Root employee element not found, waiting longer...');
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Ensure root is at the top of the viewport
        if (rootElement) {
          rootElement.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'center' });
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Double-check root name is visible
        const rootNameElement = rootElement ? rootElement.querySelector('div[style*="font-weight: bold"]') : null;
        if (rootNameElement && !rootNameElement.textContent.trim()) {
          console.warn('Root name is empty, ensuring it has content...');
          rootNameElement.textContent = hierarchy.root?.name || 'Chandan Kumar';
        }
        
        const canvas = await html2canvas(wrapperDiv, {
          backgroundColor: '#f9fafb',
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          height: wrapperDiv.scrollHeight,
          width: wrapperDiv.scrollWidth,
          onclone: (clonedDoc) => {
            // Verify root is in cloned document
            const clonedWrapper = clonedDoc.querySelector('.hierarchy-content-wrapper');
            if (clonedWrapper) {
              const clonedRoot = clonedWrapper.querySelector('[data-root-employee="true"]');
              if (clonedRoot) {
                console.log('Root element found in cloned document for PDF export');
              } else {
                console.warn('Root element NOT found in cloned document for PDF');
              }
            }
          }
        });
        
        // Restore original styles
        wrapperDiv.style.paddingTop = '';
        wrapperDiv.style.paddingBottom = '';
        container.style.overflow = originalOverflow;
        container.className = originalClassName;
        if (originalTransform) {
          wrapperDiv.style.transform = originalTransform;
          wrapperDiv.style.width = originalWidth;
        }
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 280;
        const pageHeight = doc.internal.pageSize.height;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 10, position + 10, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        doc.save('company-hierarchy.pdf');
      } else {
        alert('html2canvas library is required for PDF export.');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  const exportHierarchy = () => {
    const data = {
      hierarchy,
      employees: Array.from(employees.entries()),
      companyName: companyName,
      companyLogo: companyLogo,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company-hierarchy.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importHierarchy = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          
          // Validate the imported data structure
          if (!data.hierarchy || !data.hierarchy.root) {
            throw new Error('Invalid hierarchy format. Missing root node.');
          }

          // Ensure all employees have subordinateLayout property
          const ensureSubordinateLayout = (node) => {
            if (node.id !== 'root' && !node.subordinateLayout) {
              node.subordinateLayout = 'horizontal';
            }
            if (node.children) {
              node.children.forEach(child => ensureSubordinateLayout(child));
            }
          };
          ensureSubordinateLayout(data.hierarchy.root);

          // Convert employees array back to Map
          const employeesMap = new Map();
          if (data.employees && Array.isArray(data.employees)) {
            data.employees.forEach(([id, emp]) => {
              if (!emp.subordinateLayout) {
                emp.subordinateLayout = 'horizontal';
              }
              employeesMap.set(id, emp);
            });
          }

          // Get hierarchy name from user or use default
          const hierarchyName = prompt('Enter a name for this hierarchy:', data.hierarchyName || 'Imported Hierarchy') || 'Imported Hierarchy';
          
          // Create new hierarchy entry
          const importedHierarchy = {
            id: `hierarchy-${Date.now()}`,
            name: hierarchyName,
            hierarchy: data.hierarchy,
            employees: Array.from(employeesMap.entries()),
            companyName: data.companyName || companyName || 'Abheepay',
            companyLogo: data.companyLogo || companyLogo || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          // Add to hierarchies list
          const updatedHierarchies = [...hierarchies, importedHierarchy];
          
          // Update state
          ensureRootData(data.hierarchy);
          setHierarchies(updatedHierarchies);
          setCurrentHierarchyId(importedHierarchy.id);
          setHierarchy(data.hierarchy);
          setEmployees(employeesMap);
          setCompanyName(importedHierarchy.companyName);
          setCompanyLogo(importedHierarchy.companyLogo);

          // Save to storage
          saveAllHierarchies(updatedHierarchies, importedHierarchy.id);
          saveHierarchyToStorage(data.hierarchy, employeesMap);

          // Show success message
          alert('Hierarchy imported successfully!');
          
          // Refresh the hierarchy display
          setTimeout(() => {
            renderHierarchy();
          }, 100);
        } catch (error) {
          console.error('Error importing hierarchy:', error);
          alert('Error importing hierarchy: ' + error.message + '\n\nPlease ensure the JSON file is a valid hierarchy export from this system.');
        }
      };
      reader.onerror = () => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const loadDefaultHierarchy = () => {
    if (confirm('This will replace your current hierarchy with the default structure. Continue?')) {
      const defaultHierarchy = {
        root: {
          id: 'root',
          name: 'Chandan Kumar',
          designation: 'MD & Co-Founder',
          email: 'chandan@abheepay.com',
          department: 'Top-Level Management',
          children: [
            {
              id: 'dir_ops',
              name: 'Ganga Yadav',
              designation: 'Director – Operations',
              email: 'ganga@abheepay.com',
              department: 'Operations',
              children: [
                {
                  id: 'ops_mgr',
                  name: 'Rajinder Kumar',
                  designation: 'Operations Manager',
                  email: '',
                  department: 'Operations',
                  children: [
                    {
                      id: 'asst_mgr_ops',
                      name: 'Saurabh Gautam',
                      designation: 'Asst. Manager – Ops',
                      email: '',
                      department: 'Operations',
                      children: [
                        {
                          id: 'ops_exec1',
                          name: 'Shivani',
                          designation: 'Operations Executive',
                          email: '',
                          department: 'Operations',
                          children: []
                        },
                        {
                          id: 'ops_exec2',
                          name: 'Rakhi Rathore',
                          designation: 'Operations Executive',
                          email: '',
                          department: 'Operations',
                          children: []
                        },
                        {
                          id: 'ops_exec3',
                          name: 'Akansha Srivastava',
                          designation: 'Operations Executive',
                          email: '',
                          department: 'Operations',
                          children: []
                        },
                        {
                          id: 'ops_exec4',
                          name: 'Tanu Kumari',
                          designation: 'Operations Executive',
                          email: '',
                          department: 'Operations',
                          children: [
                            {
                              id: 'sr_exec_ops',
                              name: 'Rakesh Kumar Jha',
                              designation: 'Senior Executive – Operations',
                              email: '',
                              department: 'Operations',
                              children: [
                                {
                                  id: 'rel_exec',
                                  name: 'Raju Kumar',
                                  designation: 'Relationship Executive',
                                  email: '',
                                  department: 'Operations',
                                  children: [
                                    {
                                      id: 'office_boy',
                                      name: 'Vinod Sain',
                                      designation: 'Office Boy',
                                      email: '',
                                      department: 'Operations',
                                      children: []
                                    }
                                  ]
                                }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              id: 'dir_accounts',
              name: 'Akash Kumar',
              designation: 'Director – Accounts',
              email: 'akash@abheepay.com',
              department: 'Accounts',
              children: [
                {
                  id: 'accounts_exec1',
                  name: 'Riya Kumari',
                  designation: 'Accounts Executive',
                  email: '',
                  department: 'Accounts',
                  children: []
                },
                {
                  id: 'accounts_exec2',
                  name: 'Anupam Kumar Singh',
                  designation: 'Accounts Executive',
                  email: '',
                  department: 'Accounts',
                  children: []
                },
                {
                  id: 'accounts_exec3',
                  name: 'Neerajpal Singh',
                  designation: 'Accounts Executive',
                  email: '',
                  department: 'Accounts',
                  children: []
                }
              ]
            },
            {
              id: 'cro',
              name: 'Prahlad Aryans',
              designation: 'Chief Revenue Officer',
              email: '',
              department: 'Sales',
              children: [
                {
                  id: 'business_head_sales',
                  name: 'Amarpal Singh Gill',
                  designation: 'Business Head – Sales',
                  email: '',
                  department: 'Sales',
                  children: [
                    {
                      id: 'asm1',
                      name: 'Kamlesh B. Rathod',
                      designation: 'ASM (Sales)',
                      email: '',
                      department: 'Sales',
                      children: []
                    },
                    {
                      id: 'asm2',
                      name: 'Ameen Khan',
                      designation: 'ASM (Sales)',
                      email: '',
                      department: 'Sales',
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              id: 'it_mgr',
              name: 'Md Abdullah',
              designation: 'IT Manager',
              email: '',
              department: 'IT',
              children: [
                {
                  id: 'asst_mgr_mis',
                  name: 'Ashu Gautam',
                  designation: 'Assistant Manager – MIS',
                  email: '',
                  department: 'IT',
                  children: [
                    {
                      id: 'sr_mis_exec',
                      name: 'Manoj Singh',
                      designation: 'Sr. MIS Executive',
                      email: '',
                      department: 'IT',
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              id: 'sr_mgr_hr',
              name: 'Manish Kumar Shah',
              designation: 'Senior Manager – HR',
              email: '',
              department: 'HR',
              children: []
            }
          ]
        }
      };

      // Rebuild employees map
      const newEmployees = new Map();
      const addToMap = (node, parentId = 'root') => {
        if (node.id !== 'root') {
          newEmployees.set(node.id, {
            id: node.id,
            name: node.name,
            designation: node.designation,
            email: node.email,
            department: node.department || '',
            reportsTo: parentId,
            subordinateLayout: 'horizontal' // Default to horizontal for all employees
          });
        }
        node.children.forEach(child => {
          addToMap(child, node.id);
        });
      };
      addToMap(defaultHierarchy.root);

      setHierarchy(defaultHierarchy);
      setEmployees(newEmployees);
      saveHierarchyToStorage(defaultHierarchy, newEmployees);
    }
  };

  const clearHierarchy = () => {
    if (confirm('Are you sure you want to clear the entire hierarchy? This cannot be undone.')) {
      setHierarchy({
        root: {
          id: 'root',
          name: 'Chandan Kumar',
          designation: 'MD & Co-Founder',
          email: 'chandan@abheepay.com',
          department: 'Top-Level Management',
          children: []
        }
      });
      setEmployees(new Map());
      saveHierarchyToStorage();
    }
  };

  const reportingOptions = Array.from(employees.entries())
    .filter(([id]) => id !== editingEmployeeId)
    .map(([id, emp]) => ({ id, ...emp }));

  // Get all employees in hierarchy for parent selection (with duplicate filtering)
  const getAllEmployees = () => {
    const all = [];
    const seenIds = new Set();
    const traverse = (node) => {
      if (node.id !== 'root') {
        // Only add if we haven't seen this ID before (prevent duplicates)
        if (!seenIds.has(node.id)) {
          seenIds.add(node.id);
          all.push({ id: node.id, name: node.name, designation: node.designation, department: node.department });
        }
      }
      node.children.forEach(child => traverse(child));
    };
    traverse(hierarchy.root);
    return all;
  };

  // Get children of a specific parent
  const getChildrenOfParent = (parentId) => {
    if (parentId === 'root') {
      return hierarchy.root.children.map(child => ({
        id: child.id,
        name: child.name,
        designation: child.designation,
        department: child.department
      }));
    }
    const parent = findNodeById(hierarchy.root, parentId);
    if (parent) {
      return parent.children.map(child => ({
        id: child.id,
        name: child.name,
        designation: child.designation,
        department: child.department
      }));
    }
    return [];
  };

  const handleParentChange = (parentId) => {
    // When parent changes, reset reportsTo to the parent (user can then select a child if needed)
    // Also set default subordinateLayout based on parent level
    setFormData(prev => ({
      ...prev,
      parentId: parentId,
      reportsTo: parentId === 'root' ? 'root' : parentId,
      subordinateLayout: parentId === 'root' ? 'horizontal' : 'horizontal' // Default to horizontal
    }));
  };

  // Hierarchy management functions
  const createNewHierarchy = () => {
    if (!newHierarchyName.trim()) {
      alert('Please enter a name for the hierarchy');
      return;
    }
    
    const newHierarchy = {
      id: `hierarchy-${Date.now()}`,
      name: newHierarchyName.trim(),
      hierarchy: {
        root: {
          id: 'root',
          name: 'Chandan Kumar',
          designation: 'MD & Co-Founder',
          email: 'chandan@abheepay.com',
          department: 'Top-Level Management',
          children: []
        }
      },
      employees: [],
      companyName: 'Abheepay',
      companyLogo: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    ensureRootData(newHierarchy.hierarchy);
    const updatedHierarchies = [...hierarchies, newHierarchy];
    setHierarchies(updatedHierarchies);
    setCurrentHierarchyId(newHierarchy.id);
    setHierarchy(newHierarchy.hierarchy);
    setEmployees(new Map());
    setCompanyName(newHierarchy.companyName);
    setCompanyLogo(null);
    setNewHierarchyName('');
    setShowHierarchyModal(false);
    saveAllHierarchies(updatedHierarchies, newHierarchy.id);
  };

  const switchHierarchy = (hierarchyId) => {
    const selectedHierarchy = hierarchies.find(h => h.id === hierarchyId);
    if (!selectedHierarchy) return;
    
    // Save current hierarchy before switching
    saveHierarchyToStorage();
    
    // Load the selected hierarchy
    const loadedHierarchy = selectedHierarchy.hierarchy;
    const loadedEmployees = new Map(selectedHierarchy.employees || []);
    
    // Ensure all employees have subordinateLayout property
    const ensureSubordinateLayout = (node) => {
      if (node.id !== 'root' && !node.subordinateLayout) {
        node.subordinateLayout = 'horizontal';
      }
      const emp = loadedEmployees.get(node.id);
      if (emp && !emp.subordinateLayout) {
        emp.subordinateLayout = 'horizontal';
        loadedEmployees.set(node.id, emp);
      }
      node.children.forEach(child => ensureSubordinateLayout(child));
    };
    ensureSubordinateLayout(loadedHierarchy.root);
    
    setCurrentHierarchyId(hierarchyId);
    setHierarchy(loadedHierarchy);
    setEmployees(loadedEmployees);
    setCompanyName(selectedHierarchy.companyName || 'Abheepay');
    setCompanyLogo(selectedHierarchy.companyLogo || null);
    saveAllHierarchies(hierarchies, hierarchyId);
  };

  const renameHierarchy = (hierarchyId, newName) => {
    if (!newName.trim()) {
      alert('Please enter a name for the hierarchy');
      return;
    }
    
    const updatedHierarchies = hierarchies.map(h => {
      if (h.id === hierarchyId) {
        return {
          ...h,
          name: newName.trim(),
          updatedAt: new Date().toISOString()
        };
      }
      return h;
    });
    
    setHierarchies(updatedHierarchies);
    setEditingHierarchyId(null);
    setEditingHierarchyName('');
    saveAllHierarchies(updatedHierarchies, currentHierarchyId);
  };

  const deleteHierarchy = (hierarchyId) => {
    if (hierarchies.length <= 1) {
      alert('You must have at least one hierarchy. Create a new one before deleting this one.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this hierarchy? This action cannot be undone.')) {
      return;
    }
    
    const updatedHierarchies = hierarchies.filter(h => h.id !== hierarchyId);
    setHierarchies(updatedHierarchies);
    
    // If deleting current hierarchy, switch to first available
    if (hierarchyId === currentHierarchyId) {
      if (updatedHierarchies.length > 0) {
        switchHierarchy(updatedHierarchies[0].id);
      }
    } else {
      saveAllHierarchies(updatedHierarchies, currentHierarchyId);
    }
  };

  if (isLoading) {
    return (
      <Layout title="Company Hierarchy Manager" description="Visualize and manage your organizational structure" icon="🏛️">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white text-xl">Loading hierarchy data...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Company Hierarchy Manager" description="Visualize and manage your organizational structure" icon="🏛️">
      <div className="w-full px-[1%]">
        {/* Sync Status Indicator */}
        {isAuthenticated && (
          <div className="mb-4 flex items-center justify-end gap-2">
            {syncStatus === 'saving' && (
              <div className="flex items-center gap-2 text-yellow-300 text-sm">
                <span className="animate-spin">⏳</span>
                <span>Saving to cloud...</span>
              </div>
            )}
            {syncStatus === 'saved' && (
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <span>✓</span>
                <span>Saved to cloud</span>
              </div>
            )}
            {syncStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <span>✗</span>
                <span>Sync failed (saved locally)</span>
              </div>
            )}
            {syncStatus === 'idle' && isAuthenticated && (
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <span>☁️</span>
                <span>Auto-sync enabled</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-[2%] w-full">
          {/* Hierarchy Tree View - 85% width */}
          <div className="w-full lg:w-[85%]">
          <div className="card shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="relative hierarchy-modal-container">
                  <button 
                    onClick={() => setShowHierarchyModal(!showHierarchyModal)}
                    className="btn-secondary text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 flex items-center gap-1 sm:gap-2"
                  >
                    <span>📋</span>
                    <span className="hidden sm:inline">MY Hierarchy</span>
                    <span className="sm:hidden">MY</span>
                    <span className="text-xs">({hierarchies.length})</span>
                  </button>
                  
                  {/* Hierarchy Modal with Backdrop */}
                  {showHierarchyModal && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-30 z-40"
                        onClick={() => setShowHierarchyModal(false)}
                      />
                      {/* Modal */}
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <div 
                          className="bg-white border-2 border-gray-300 rounded-lg shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col pointer-events-auto hierarchy-modal-container"
                          onClick={(e) => e.stopPropagation()}
                        >
                      <div className="p-4 sm:p-5 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-lg sm:text-xl text-gray-800">My Hierarchies</h3>
                          <button
                            onClick={() => setShowHierarchyModal(false)}
                            className="text-gray-400 hover:text-gray-600 text-xl font-bold w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                            title="Close"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            value={newHierarchyName}
                            onChange={(e) => setNewHierarchyName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && createNewHierarchy()}
                            placeholder="Enter hierarchy name..."
                            className="form-input flex-1 text-sm border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                          <button
                            onClick={createNewHierarchy}
                            className="btn-primary text-sm px-4 py-2 whitespace-nowrap font-semibold hover:shadow-md transition-shadow"
                          >
                            ➕ Create
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto min-h-0 p-2">
                        {hierarchies.length === 0 ? (
                          <div className="p-8 text-center">
                            <div className="text-gray-400 text-4xl mb-3">📋</div>
                            <p className="text-gray-500 text-sm mb-1">No hierarchies yet</p>
                            <p className="text-gray-400 text-xs">Create your first hierarchy above</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {hierarchies.map((h) => (
                              <div
                                key={h.id}
                                className={`p-3 rounded-lg border transition-all ${
                                  h.id === currentHierarchyId 
                                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                    : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                              >
                              {editingHierarchyId === h.id ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={editingHierarchyName}
                                    onChange={(e) => setEditingHierarchyName(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        renameHierarchy(h.id, editingHierarchyName);
                                      } else if (e.key === 'Escape') {
                                        setEditingHierarchyId(null);
                                        setEditingHierarchyName('');
                                      }
                                    }}
                                    className="form-input flex-1 text-xs sm:text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => renameHierarchy(h.id, editingHierarchyName)}
                                    className="text-green-600 hover:text-green-700 px-2 text-sm sm:text-base"
                                    title="Save"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingHierarchyId(null);
                                      setEditingHierarchyName('');
                                    }}
                                    className="text-red-600 hover:text-red-700 px-2 text-sm sm:text-base"
                                    title="Cancel"
                                  >
                                    ✗
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-start sm:items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <button
                                      onClick={() => {
                                        switchHierarchy(h.id);
                                        setShowHierarchyModal(false);
                                      }}
                                      className={`text-left w-full text-xs sm:text-sm break-words ${
                                        h.id === currentHierarchyId
                                          ? 'font-bold text-blue-700'
                                          : 'text-gray-700 hover:text-blue-600'
                                      }`}
                                    >
                                      {h.id === currentHierarchyId && '✓ '}
                                      {h.name}
                                    </button>
                                    <div className="text-xs text-gray-500 mt-1">
                                      Updated: {new Date(h.updatedAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <button
                                      onClick={() => {
                                        setEditingHierarchyId(h.id);
                                        setEditingHierarchyName(h.name);
                                      }}
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded text-sm transition-colors"
                                      title="Rename"
                                    >
                                      ✏️
                                    </button>
                                    {hierarchies.length > 1 && (
                                      <button
                                        onClick={() => deleteHierarchy(h.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-sm transition-colors"
                                        title="Delete"
                                      >
                                        🗑️
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={importHierarchy} className="btn-secondary text-xs sm:text-sm bg-green-50 hover:bg-green-100 text-green-700 border-green-300 flex-1 sm:flex-none min-w-[120px]">
                  <span className="hidden sm:inline">📥 Import JSON</span>
                  <span className="sm:hidden">📥 Import</span>
                </button>
                <button onClick={exportToImage} className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none min-w-[110px]">
                  <span className="hidden sm:inline">Export Image</span>
                  <span className="sm:hidden">Image</span>
                </button>
                <button onClick={exportToPDF} className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none min-w-[100px]">
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button onClick={exportHierarchy} className="btn-secondary text-xs sm:text-sm flex-1 sm:flex-none min-w-[110px]">
                  <span className="hidden sm:inline">Export JSON</span>
                  <span className="sm:hidden">JSON</span>
                </button>
              </div>
            </div>
            <div 
              ref={hierarchyTreeRef}
              className="bg-gray-50 p-2 sm:p-4 rounded-lg border-2 border-gray-200 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] overflow-hidden"
              style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}
            />
          </div>
          </div>

          {/* Employee Management Panel - 13% width */}
          <div className="w-full lg:w-[13%] space-y-3 sm:space-y-4 order-1 lg:order-2 overflow-visible">
            {/* Company Info */}
            <div className="card shadow-xl p-4">
            <h2 className="section-title text-sm sm:text-base mb-3 pb-2">Company Info</h2>
            <div className="space-y-3">
              <div>
                <label className="form-label text-xs block mb-1 font-semibold text-gray-700">Hierarchy Title:</label>
                <input
                  type="text"
                  className="form-input text-xs py-2 w-full"
                  value={companyName}
                  onChange={(e) => handleCompanyNameChange(e.target.value)}
                  placeholder="Enter hierarchy title"
                />
                <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                  This title appears above the organization chart and in exports.
                </p>
              </div>
              <div>
                <label className="form-label text-xs block mb-1 font-semibold text-gray-700">Hierarchy Logo (Optional):</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-input text-xs py-2 w-full"
                  onChange={handleLogoUpload}
                />
                <div className="mt-1 min-h-[16px]">
                  {selectedFileName ? (
                    <p className="text-xs text-gray-700 leading-tight font-medium">
                      Selected: {selectedFileName}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 leading-tight">
                      No file chosen
                    </p>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                  Supported formats: JPG, PNG, GIF (Max 2MB)
                </p>
                {companyLogo && (
                  <div className="mt-3 p-3 bg-gray-50 border-2 border-gray-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold text-gray-600">Logo Preview:</p>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="text-[10px] text-red-600 hover:text-red-800 font-semibold"
                      >
                        Remove Logo
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={companyLogo}
                        alt="Company Logo Preview"
                        className="h-12 w-auto border-2 border-gray-300 rounded p-1 bg-white object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>
            {/* Add/Edit Employee Form */}
            <div className="card shadow-xl p-4">
            <h2 className="section-title text-sm sm:text-base mb-3 pb-2" id="formTitle">{editingEmployeeId ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
              <div>
                <label className="form-label text-xs">Employee Name: <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-input text-xs py-2" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Full Name" 
                  required 
                />
              </div>
              <div>
                <label className="form-label text-xs">Designation: <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="form-input text-xs py-2" 
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  placeholder="e.g., Director - Operations" 
                  required 
                />
              </div>
              <div>
                <label className="form-label text-xs">Department:</label>
                <input 
                  type="text" 
                  className="form-input text-xs py-2" 
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Engineering, Sales" 
                />
              </div>
              <div>
                <label className="form-label text-xs">Parent (Select First):</label>
                <select 
                  className="form-input text-xs py-2"
                  value={formData.parentId}
                  onChange={(e) => handleParentChange(e.target.value)}
                >
                  <option value="root">MD & Co-Founder (Top Level)</option>
                  {getAllEmployees()
                    .filter(emp => emp.id !== editingEmployeeId)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.designation} ({emp.department || 'N/A'})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                  First, select the parent under which this employee will be added.
                </p>
              </div>
              <div>
                <label className="form-label text-xs">Reports To (Select Manager):</label>
                <select 
                  className="form-input text-xs py-2"
                  value={formData.reportsTo}
                  onChange={(e) => handleInputChange('reportsTo', e.target.value)}
                >
                  {formData.parentId === 'root' ? (
                    <>
                      <option value="root">MD & Co-Founder (Top Level)</option>
                      {hierarchy.root.children
                        .filter(emp => emp.id !== editingEmployeeId)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.designation} ({emp.department || 'N/A'})
                          </option>
                        ))}
                    </>
                  ) : (
                    <>
                      <option value={formData.parentId}>
                        {getAllEmployees().find(e => e.id === formData.parentId)?.name || 'Parent'} (Direct Report)
                      </option>
                      {getChildrenOfParent(formData.parentId)
                        .filter(emp => emp.id !== editingEmployeeId)
                        .map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.designation} ({emp.department || 'N/A'})
                          </option>
                        ))}
                    </>
                  )}
                </select>
                <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                  {formData.parentId === 'root' 
                    ? 'Select the manager this employee will report to. You can select the MD & Co-Founder or any other top-level employee.'
                    : 'Select the manager this employee will report to. You can select the parent or any of its subordinates.'}
                </p>
              </div>
              <div>
                <label className="form-label text-xs">
                  Subordinate Layout: 
                  <span className="text-[10px] text-gray-500 ml-1">(How employees under this person will be displayed)</span>
                </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <label className={`relative flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.subordinateLayout === 'horizontal' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="subordinateLayout"
                        value="horizontal"
                        checked={formData.subordinateLayout === 'horizontal'}
                        onChange={(e) => handleInputChange('subordinateLayout', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-lg mb-1">↔️</div>
                      <div className="text-[10px] font-semibold text-center">Horizontal</div>
                      <div className="text-[9px] text-gray-600 text-center mt-0.5">Side by Side</div>
                    </label>
                    <label className={`relative flex flex-col items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.subordinateLayout === 'vertical' 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="subordinateLayout"
                        value="vertical"
                        checked={formData.subordinateLayout === 'vertical'}
                        onChange={(e) => handleInputChange('subordinateLayout', e.target.value)}
                        className="sr-only"
                      />
                      <div className="text-lg mb-1">↕️</div>
                      <div className="text-[10px] font-semibold text-center">Vertical</div>
                      <div className="text-[9px] text-gray-600 text-center mt-0.5">Top to Bottom</div>
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                    Choose how employees reporting to this person will be arranged. This controls how subordinates under this employee will be displayed (vertically stacked or side by side).
                  </p>
                </div>
              <div>
                <label className="form-label text-xs">Email:</label>
                <input 
                  type="email" 
                  className="form-input text-xs py-2" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@company.com" 
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <button type="submit" className="btn-primary flex-1 text-[10px] py-1 px-2 leading-tight">Save Employee</button>
                <button type="button" onClick={resetForm} className="btn-secondary flex-1 text-[10px] py-1 px-2 leading-tight">Cancel</button>
              </div>
            </form>
            </div>

            {/* Quick Actions */}
            <div className="card shadow-xl">
            <h2 className="section-title text-sm sm:text-base">Quick Actions</h2>
            <div className="space-y-2">
              <button onClick={loadDefaultHierarchy} className="btn-secondary w-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs py-1.5">Load Default Hierarchy</button>
              <button onClick={importHierarchy} className="btn-secondary w-full text-xs py-1.5">Import from JSON</button>
              <button onClick={removeDuplicateEmployees} className="btn-secondary w-full bg-yellow-50 text-yellow-700 hover:bg-yellow-100 text-xs py-1.5">Remove Duplicates</button>
              <button onClick={clearHierarchy} className="btn-secondary w-full bg-red-50 text-red-700 hover:bg-red-100 text-xs py-1.5">Clear All</button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Hierarchy;
