

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
            __("Unit"),
            function () {
              var tower_code = frm.doc.tower_code;
              frappe.set_route("List", "Unit", {"sub_project": tower_code});
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

