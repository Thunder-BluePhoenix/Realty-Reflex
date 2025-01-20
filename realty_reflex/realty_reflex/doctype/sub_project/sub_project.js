

// Handle status change in child table rows
frappe.ui.form.on('Task Revisions', {
    status: function(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.status === 'Approved') {
            frappe.model.set_value(cdt, cdn, 'approved_by', frappe.session.user_fullname);
        }
    }
});




// In task_custom.js
frappe.ui.form.on('Sub Project', {
    refresh: function(frm) {
        // Remove add/delete buttons from the grid
        frm.set_df_property('custom_revisions', 'cannot_add_rows', true);
        frm.set_df_property('custom_revisions', 'cannot_delete_rows', true);
        frm.add_custom_button(
            __("Unit Creation Tool"),
            function () {
              var sub_project = frm.doc.name;
              frappe.set_route("List", "Unit Creation Tool", {"sub_project": sub_project});
            },
            __("View")
          );
        frm.add_custom_button(
            __("Project"),
            function () {
              var project = frm.doc.project;
              frappe.set_route("Form", "Project", project);
            },
            __("View")
          );
          frm.add_custom_button(
            __("Unit"),
            function () {
              var sub_project = frm.doc.name;
              frappe.set_route("List", "Unit", {"sub_project": sub_project});
            },
            __("View")
          );
        frm.add_custom_button(
        __("WBS"),
        function () {
            let d = new frappe.ui.Dialog({
                title: 'WBS',
                fields: [
                    {
                        label: 'Template',
                        fieldname: 'template',
                        fieldtype: 'Link',
                        options: 'WBS Template'
                    },
                    
                ],
                size: 'large', // small, large, extra-large 
                primary_action_label: 'Create',
                primary_action(values) {
                    frappe.call({
                        method: 'realty_reflex.realty_reflex.doctype.sub_project.sub_project.create_group_task',
                        args: {
                          values: values,
                          project:frm.doc.project
                        },
                        freeze: true,
                        freeze_message: __('Creating Template Tasks................'),
                        callback: function (r) {
                            if(r.message){
                            d.hide()
                            let k = new frappe.ui.Dialog({
                                title: 'WBS',
                                fields: [
                                    {
                                        label: 'Phase',
                                        fieldname: 'phase',
                                        fieldtype: 'Link',
                                        options: 'Phase',
                                        onchange: function () {
                                            const selectedPhase = k.get_value('phase');

                                            // Apply filter to the subproject table if a phase is selected
                                            if (selectedPhase) {
                                                k.fields_dict.subproject.grid.get_field('sub_project').get_query = function () {
                                                    return {
                                                        filters: {
                                                            custom_phase: selectedPhase,
                                                            project: frm.doc.project // Assuming 'project' exists in the context
                                                        }
                                                    };
                                                };
                                        
                                            }
                                        }
                                    },
                                    {
                                        label: __('Sub Project'),
                                        fieldname: 'subprojects',
                                        fieldtype: 'Table',
                                        reqd: 1,
                                        fields: [
                                            {
                                                label: 'Subproject',
                                                fieldname: 'sub_project',
                                                fieldtype: 'Link',
                                                options: 'Sub Project',
                                                in_list_view: 1,
                                                get_query: function (doc) {
                                                    const Project = frm.doc.project;
                                                    return {
                                                        filters: {
                                                            project: Project
                                                        }
                                                    };
                                                }

                                            },
                                        ],
                                    },
                                    {
                                        label: __('Templates'),
                                        fieldname: 'templates',
                                        fieldtype: 'Table',
                                        reqd: 1,
                                        fields: [
                                            {
                                                label: 'WBS Template',
                                                fieldname: 'template',
                                                fieldtype: 'Link',
                                                options: 'WBS Template',
                                                in_list_view: 1,
                                                get_query: function (doc) {
                                                    return {
                                                        filters: {
                                                            disable: 0
                                                        }
                                                    };
                                                }

                                            },
                                            {
                                                label: 'Parent Task',
                                                fieldname: 'parent',
                                                fieldtype: 'Link',
                                                options: 'Task',
                                                in_list_view: 1,
                                                get_query: function (doc) {
                                                    const Project = frm.doc.project;
                                                    return {
                                                        filters: {
                                                            project: Project
                                                        }
                                                    };
                                                }

                                            },
                                        ],
                                    },
                                
                
                                ],
        
                                size: 'large', // small, large, extra-large 
                                primary_action_label: 'Create',
                                primary_action(values) {
                                    frappe.call({
                                        method: 'realty_reflex.realty_reflex.doctype.sub_project.sub_project.create_tasks',
                                        args: {
                                          values: values,
                                          project:frm.doc.project
                                        },
                                        freeze: true,
                                        freeze_message: __('Creating Template Tasks................'),
                                        callback: function (r) {
                                            if(r.message){
                                                k.hide()
                                                frappe.msgprint("Task Created Sucessfully")
                                            }
                                        }
                                    })
                                }

                            })
                            k.show();
                            }

                        }
                    })
                }
            });
            
            d.show();
        },
        __("Create")
        );
    },
    
});

// Additional handling for child table
frappe.ui.form.on('Task Revisions', {
    form_render: function(frm) {
        // Hide add/delete buttons at row level
        frm.fields_dict['custom_revisions'].grid.wrapper.find('.grid-add-row').hide();
        frm.fields_dict['custom_revisions'].grid.wrapper.find('.grid-remove-rows').hide();
    }
});



frappe.ui.form.on('Sub Project', {
    refresh: function (frm) {
        if (frm.doc.__islocal) {
            return;
        }

        setTimeout(function () {
            frm.add_custom_button('Create Unit Creation Tool', function () {
                frappe.call({
                    method: "realty_reflex.realty_reflex.doctype.sub_project.sub_project.prepare_unit_creation_tool",
                    args: {
                        sub_project_name: frm.doc.name
                    },
                    callback: function (response) {
                        if (response.message) {
                            // Route to the new document
                            frappe.model.with_doctype('Unit Creation Tool', function () {
                                const new_doc = frappe.model.sync(response.message)[0];
                                frappe.set_route('Form', 'Unit Creation Tool', new_doc.name);
                            });
                        }
                    }
                });
            });
        }, 500);
    }
});



 




frappe.ui.form.on('Sub Project', {
    refresh: function(frm) {
        // Create the custom HTML container
        const customHtml = `
        <div class="unit-management">
            <div class="units-table-container">
                <div class="button-container tw-mb-4">
                    <div class="flex-spacer"></div>
                    <div class="right-buttons">
                        <button class="upload-csv-btn">Upload CSV</button>
                        <button class="download-sample-csv-btn">Download Sample CSV</button>
                        <input type="file" accept=".csv" class="hidden-file-input" style="display: none;">
                    </div>
                </div>

                <div class="unit-actions">
                    <div class="action-buttons">
                        <button class="btn btn-sm release-btn">Release</button>
                        <button class="btn btn-sm hold-btn">Hold</button>
                    </div>
                    <div class="status-indicators">
                        <div class="status-item">
                            <span class="status-dot sold"></span>
                            <span class="status-text">Sold</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot hold"></span>
                            <span class="status-text">Hold</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot available"></span>
                            <span class="status-text">Available</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot blocked-without-money"></span>
                            <span class="status-text">Blocked Without Money</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot blocked-with-money"></span>
                            <span class="status-text">Blocked With Money</span>
                        </div>
                    </div>
                </div>

                <div class="table-scroll-container">
                    <table class="units-table">
                        <thead>
                            <tr>
                                <th class="checkbox-col"><input type="checkbox" class="select-all-checkbox"> Fl.no</th>
                                <th>Unit</th>
                                <th>Sale Area</th>
                                <th>Carpet Area</th>
                                <th>Terrace Area</th>
                                <th>Built-up Area</th>
                                <th>Common Area</th>
                                <th>Unit Status</th>
                                <th>Hold/Release</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
        `;

        // Update the styles
        const styles = `
        <style>
            /* Table container styles */
            .table-scroll-container {
                overflow-x: auto;
                max-height: 600px;
                overflow-y: auto;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                margin-bottom: 16px;
            }



            /* Button container styles */
            .button-container {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 16px;
                position: sticky;
                top: 0;
                background-color: white;
                z-index: 10;
            }

            .right-buttons {
                display: flex;
                gap: 8px;
            }

            /* Upload CSV button */
            .upload-csv-btn {
                background-color: #1E90FF;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            /* Download Sample CSV button */
            .download-sample-csv-btn {
                background-color: #22c55e;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            /* Release/Hold buttons */
            .release-btn {
                background-color: #22c55e;
                color: white;
                border: none;
                padding: 6px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            .hold-btn {
                background-color: #dc2626;
                color: white;
                border: none;
                padding: 6px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            /* Hover states */
            .upload-csv-btn:hover { background-color: #155E95; }
            .download-sample-csv-btn:hover { background-color: #16a34a; }
            .release-btn:hover { background-color: #16a34a; }
            .hold-btn:hover { background-color: #b91c1c; }

            /* Status dots */
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 2px;
                display: inline-block;
            }

            .status-dot.sold { background-color: #fcd34d; }
            .status-dot.hold { background-color: #dc2626; }
            .status-dot.available { background-color: #166534; }
            .status-dot.blocked-without-money { background-color: #a21caf; }
            .status-dot.blocked-with-money { background-color: #1e40af; }

            /* Unit management styles */
            .unit-management {
                font-size: 13px;
            }

            .unit-actions {
                display: flex;
                justify-content: space-between;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                margin-bottom: 12px;
                position: sticky;
                top: 0;
                background-color: white;
                z-index: 10;
            }

            .action-buttons {
                display: flex;
                gap: 8px;
            }

            .status-indicators {
                display: flex;
                gap: 16px;
            }

            .status-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
            }

            /* Table styles */
            .units-table {
                width: 100%;
                border-collapse: collapse;  /* Changed from separate to collapse */
            }



            /* Remove all internal borders */
            .units-table th,
            .units-table td {
                padding: 10px;
                border: none;  /* Remove internal borders */
                font-size: 13px;
                min-width: 120px;
                white-space: nowrap;
            }



            .units-table th {
                position: sticky;
                top: 0;
                background-color: #f9fafb;
                z-index: 5;
                font-weight: 600;
                border-bottom: 1px solid #e5e7eb;  /* Only bottom border for headers */
            }
            
            .frappe-control[data-fieldtype="HTML"] {
                position: relative;
                z-index: 1;
            }



        tr.status-sold td { 
            background-color: #fcd34d !important; 
            color: white !important;
            // border: none !important;
            border-bottom: solid 1px white;
            border-top: solid 1px white;
        }
        tr.status-hold td { 
            background-color: #dc2626 !important; 
            color: white !important;
            // border: none !important;
            border-bottom: solid 1px white;
            border-top: solid 1px white;
        }
        tr.status-available td { 
            background-color: #16a34a !important; 
            color: white !important;
            // border: none !important;
            border-bottom: solid 1px white;
            border-top: solid 1px white;
        }
        tr.status-blocked-without-money td { 
            background-color: #a21caf !important; 
            color: white !important;
            // border: none !important;
            border-bottom: solid 1px white;
            border-top: solid 1px white;
        }
        tr.status-blocked-with-money td { 
            background-color: #1e40af !important; 
            color: white !important;
            // border: none !important;
            border-bottom: solid 1px white;
            border-top: solid 1px white;
        }

        /* Ensure menu options are visible */
        .frappe-control .dropdown-menu {
            background-color: white !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            z-index: 1000 !important;
        }

        .frappe-control .dropdown-menu > li > a {
            color: #1f2937 !important;
            background-color: transparent !important;
        }

        .frappe-control .dropdown-menu > li > a:hover {
            background-color: #f3f4f6 !important;
        }

        /* Fix checkbox alignment */
        .checkbox-col {
            min-width: 80px;
            border: none !important;
        }

        /* Add subtle hover effect for rows */
        .units-table tbody tr:hover td {
            filter: brightness(95%);
        }




        </style>
        `;

        // Set the custom HTML to the field
        frm.set_df_property('custom_release_hold_html', 'options', styles + customHtml);

        // Initialize the component after the HTML is rendered
        setTimeout(() => {
            initializeUnitManagement(frm);
        }, 100);
    }
});

function initializeUnitManagement(frm) {
    const container = frm.fields_dict.custom_release_hold_html.$wrapper[0];
    
    // Get elements
    const releaseBtn = container.querySelector('.release-btn');
    const holdBtn = container.querySelector('.hold-btn');
    const uploadCsvBtn = container.querySelector('.upload-csv-btn');
    const downloadSampleCsvBtn = container.querySelector('.download-sample-csv-btn');
    const fileInput = container.querySelector('.hidden-file-input');
    const selectAllCheckbox = container.querySelector('.select-all-checkbox');
    const tbody = container.querySelector('.units-table tbody');

    let selectedUnits = new Set();
    let unitsData = [];

    // Get status-based CSS class
    function getStatusClass(unit) {
        if (unit.custom_holdrelease === 'Hold') {
            return 'status-hold';
        }
        
        switch(unit.status) {
            case 'Sold':
                return 'status-sold';
            case 'Available':
                return 'status-available';
            case 'Block Without Money':
                return 'status-blocked-without-money';
            case 'Blocked With Money':
                return 'status-blocked-with-money';
            default:
                return '';
        }
    }

    // Render table rows
    function renderUnitsTable() {
        tbody.innerHTML = '';
        
        const sortedUnits = [...unitsData].sort((a, b) => {
            const getFloorNumber = (floor) => {
                if (!floor) return Infinity;
                if (floor.toLowerCase() === 'ground floor') return 0;
                const match = floor.match(/(\d+)/);
                return match ? parseInt(match[1]) : Infinity;
            };
            return getFloorNumber(a.floor) - getFloorNumber(b.floor);
        });

        sortedUnits.forEach(unit => {
            const tr = document.createElement('tr');
            tr.className = getStatusClass(unit);  // Apply status class to row
            
            // Format numbers for better display
            const formatNumber = (num) => num ? Number(num).toLocaleString('en-IN', {
                maximumFractionDigits: 2
            }) : '';

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="unit-checkbox" data-unit="${unit.name}"
                           ${selectedUnits.has(unit.name) ? 'checked' : ''}>
                    ${frappe.utils.escape_html(unit.unit_name || '')}
                </td>
                <td>${frappe.utils.escape_html(unit.unit_type || '')}</td>
                <td>${formatNumber(unit.saleable_area || '0')}</td>
                <td>${formatNumber(unit.carpet_area || '0')}</td>
                <td>${formatNumber(unit.terrace_area || '0')}</td>
                <td>${formatNumber(unit.built_up_area || '0')}</td>
                <td>${formatNumber(unit.common_area || '0')}</td>
                <td>${frappe.utils.escape_html(unit.status || '')}</td>
                <td>${frappe.utils.escape_html(unit.custom_holdrelease || '')}</td>
                <td><i class="fa fa-pencil edit-icon"></i></td>
            `;

            bindRowEventListeners(tr, unit);
            tbody.appendChild(tr);
        });
    }

    function loadUnitsData() {
        // console.log("Current Form Doc:", frm.doc); // Log entire form document
        // console.log("Project:", frm.doc.project);
        // console.log("Sub Project:", frm.doc.custom_subproject_name);

        frappe.call({
            
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Unit',
                filters: {
                    project_name: frm.doc.project,
                    sub_project: frm.doc.name
                },
                fields: ['*'],
                limit: 1000
                
            },
            
            callback: function(response) {
                if (response.message) {
                    unitsData = response.message;
                    // console.log(unitsData, "unitsData");
                    renderUnitsTable();
                }
            }
        });
    }

    function handleBulkAction(action) {
        if (selectedUnits.size === 0) {
            frappe.throw(__('Please select units first'));
            return;
        }

        frappe.call({
            method: `realty_reflex.overrides.task_stock_custom.${action}_units`,
            args: {
                unit_ids: JSON.stringify(Array.from(selectedUnits))
            },
            callback: function(response) {
                if (response.message === "done") {
                    frappe.show_alert({
                        message: __(`Units ${action}ed successfully`),
                        indicator: 'green'
                    });
                    loadUnitsData();
                    selectedUnits.clear();
                }
            }
        });
    }

    function bindRowEventListeners(tr, unit) {
        const editIcon = tr.querySelector('.edit-icon');
        const checkbox = tr.querySelector('.unit-checkbox');

        editIcon.addEventListener('click', () => {
            frappe.set_route('Form', 'Unit', unit.name);
        });

        checkbox.addEventListener('click', (e) => {
            if (e.target.checked) {
                selectedUnits.add(unit.name);
            } else {
                selectedUnits.delete(unit.name);
            }
            updateSelectAllCheckbox();
        });
    }

    // Event listeners
    releaseBtn.addEventListener('click', () => handleBulkAction('release'));
    holdBtn.addEventListener('click', () => handleBulkAction('hold'));
    uploadCsvBtn.addEventListener('click', () => fileInput.click());
    downloadSampleCsvBtn.addEventListener('click', downloadSampleCsv);
    fileInput.addEventListener('change', handleFileUpload);

    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = tbody.querySelectorAll('.unit-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
            const unitId = checkbox.dataset.unit;
            if (e.target.checked) {
                selectedUnits.add(unitId);
            } else {
                selectedUnits.delete(unitId);
            }
        });
    });

    function updateSelectAllCheckbox() {
        const checkboxes = tbody.querySelectorAll('.unit-checkbox');
        selectAllCheckbox.checked = 
            checkboxes.length > 0 && 
            Array.from(checkboxes).every(checkbox => checkbox.checked);
    }

// CSV related functions
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result.split(',')[1];
            frappe.call({
                method: 'realty_reflex.overrides.task_stock_custom.create_units_from_csv',
                args: {
                    filedata: base64Data
                },
                callback: function(response) {
                    if (response.message) {
                        frappe.show_alert({
                            message: __('CSV uploaded successfully'),
                            indicator: 'green'
                        });
                        loadUnitsData();
                    }
                }
            });
        };
        reader.readAsDataURL(file);
    }
}

function downloadSampleCsv() {
    const csvContent = `data:text/csv;charset=utf-8,project_id,tower_id,floor,unit_unique_id,unit_type,hold_release,land_area,saleable_area,common_area,dimensions,garden_area,terrace_area,carpet_area,landplot_area,built_up_area,rera_area,remarks,
PROJ-0001,T-A,Ground,101,1BHK,Release,500,400,100,10x20,50,30,150,200,250,300,First unit remarks,
PROJ-0001,T-A,Ground,102,2BHK,Hold,600,500,100,12x25,60,40,200,250,300,350,Second unit remarks`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_units.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initial load
loadUnitsData();
}



