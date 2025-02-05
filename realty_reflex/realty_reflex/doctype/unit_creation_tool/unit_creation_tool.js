// Copyright (c) 2025, Thunder and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Unit Creation Tool", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on("Unit Creation Tool", {
    refresh: function (frm) {
        // Add custom buttons
        frm.add_custom_button(
            __("Project"),
            function () {
                var project_name = frm.doc.project_name;
                frappe.set_route("Form", "Project", project_name);
            },
            __("View")
        );

        frm.add_custom_button(
            __("Sub-Project"),
            function () {
                var sub_project = frm.doc.sub_project;
                frappe.set_route("Form", "Sub Project", sub_project);
            },
            __("View")
        );
        frm.add_custom_button(
            __("Units"),
            function () {
                var unit_creation_tool = frm.doc.name;
                frappe.set_route("List", "Unit");
                let checkFilters = setInterval(() => {
                    let list_view = cur_list;
        
                    if (list_view && list_view.filter_area) {
                        clearInterval(checkFilters);
                        setTimeout(() => {
                            let existing_filters = list_view.filter_area.get();
                            let isFilterApplied = existing_filters.some(f => f[1] === "unit_creation_tool" && f[3] === unit_creation_tool);
        
                            if (!isFilterApplied) {
                            
                                list_view.filter_area.add([[ "Unit", "unit_creation_tool", "=", unit_creation_tool ]]);
                                list_view.refresh();
                            }
                        }, 500); 
                    }
                }, 200); 
            },
            __("View")
        );
    },
});