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
    },
});