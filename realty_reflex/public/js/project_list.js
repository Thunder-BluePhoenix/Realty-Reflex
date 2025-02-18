frappe.listview_settings['Project'] = {
    add_fields: ["name", "project_name"],

    button: {
        show(doc) {
            // Show the button for all projects
            return !!doc.name; // Ensures the button only appears if a project exists
        },
        get_label() {
            // Provide a label for the button
            return __('Actions');
        },
        get_description(doc) {
            // Provide a description for the button
            return __('Perform actions for Project {0}', [doc.name]);
        },
        action(doc) {
            // Define multiple buttons programmatically using a custom dialog
            const dialog = new frappe.ui.Dialog({
                title: __('Actions for {0}', [doc.name]),
                fields: [
                    {
                        fieldname: 'actions',
                        fieldtype: 'HTML',
                        options: `
                            <div>
                                <button class="btn btn-primary btn-view-sub-project" style="margin-right: 10px;">
                                    ${__('View Sub-Projects')}
                                </button>
                                <button class="btn btn-primary btn-view-wbs">
                                    ${__('View WBS')}
                                </button>
                            </div>
                        `
                    }
                ]
            });

            dialog.show();

            // Add event listeners for the buttons
            dialog.$wrapper.find('.btn-view-sub-project').on('click', () => {
                dialog.hide();
                frappe.set_route('List', 'Sub Project', {
                    project: doc.name
                });
            });

            dialog.$wrapper.find('.btn-view-wbs').on('click', () => {
                dialog.hide();
                frappe.set_route("Tree", "Task", {"project": frm.doc.project});
                frappe.project_selector.current_project = frm.doc.project;
            });
        }
    }
};
