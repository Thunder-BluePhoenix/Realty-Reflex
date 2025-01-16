frappe.provide("frappe.treeview_settings");

frappe.treeview_settings["Task"] = {
    get_tree_nodes: "erpnext.projects.doctype.task.task.get_children",
	on_get_node: function (nodes, deep = false) {
		const project = frappe.project_selector.current_project
		console.log("$$$$$$$$$$$$$$$$$$$$$$$$",nodes)
		const get_balances = frappe.call({
			method: "realty_reflex.api.get_task_value",
			args: {
				project: project
			},
		});
		get_balances.then((r) => {
		for (let task of r.message) {
		const node = cur_tree.nodes && cur_tree.nodes[task.name];
		
		console.log("#########################",node.parent)
		node.parent && node.parent.find(".balance-area").remove();
		$(
			'<span class="balance-area pull-right">' +
				"1000 CR"+
					
				
				"</span>"
		).insertBefore(node.$ul);
		}
	})
	},
    add_tree_node: "erpnext.projects.doctype.task.task.add_node",
    filters: [
        {
            fieldname: "project",
            fieldtype: "Link",
            options: "Project",
            label: __("Project"),
            reqd: 1,
            default: frappe.project_selector.current_project
        },
        {
            fieldname: "task",
            fieldtype: "Link",
            options: "Task",
            label: __("Task"),
            get_query: function () {
                var me = frappe.treeview_settings["Task"];
                var project = me.page.fields_dict.project.get_value();
                var args = [["Task", "is_group", "=", 1]];
                if (project) {
                    args.push(["Task", "project", "=", project]);
                }
                return {
                    filters: args,
                };
            },
        },
    ],
    breadcrumb: "Projects",
    get_tree_root: false,
    root_label: "All Tasks",
    ignore_fields: ["parent_task"],
    onload: function (me) {
        // Add other inner buttons
        me.page.add_inner_button(
            __("Release"),
            function () {
				const project = me.page.fields_dict.project.get_value();


				frappe.call({
					method: "realty_reflex.api.release_version",
					args: {
						project: project,
					},
					callback: function (response) {
						frappe.msgprint(__("Budget is Released."));
						me.make_tree(); // Refresh the tree to reflect changes
					},
				});
				
			}
        );
		
        me.page.add_inner_button(
            __("Lock"),
            function () {
				const project = me.page.fields_dict.project.get_value();

				if (!project) {
					frappe.msgprint(__("Please select a project first"));
					return;
				}
		
				frappe.call({
					method: "realty_reflex.api.lock_project_tasks",
					args: {
						project: project,
					},
					callback: function (response) {
						frappe.msgprint(__("All tasks have been locked"));
						me.make_tree(); // Refresh the tree to reflect changes
					},
				});
				
			}
        );
        me.page.add_inner_button(
            __("Unlock"),
            function () {
				const project = me.page.fields_dict.project.get_value();


				if (!project) {
					frappe.msgprint(__("Please select a project first"));
					return;
				}
		
				frappe.call({
					method: "realty_reflex.api.lock_project_tasks",
					args: {
						project: project,
					},
					callback: function (response) {
						frappe.msgprint(__("All tasks have been locked"));
						me.make_tree(); // Refresh the tree to reflect changes
					},
				});
				
			
			}
        );

        frappe.treeview_settings["Task"].page = {};
        $.extend(frappe.treeview_settings["Task"].page, me.page);
        me.make_tree();
    },
    toolbar: [
        {
            label: __("Add Multiple"),
            condition: function (node) {
                return node.expandable;
            },
            click: function (node) {
                this.data = [];
                const dialog = new frappe.ui.Dialog({
                    title: __("Add Multiple Tasks"),
                    fields: [
                        {
                            fieldname: "multiple_tasks",
                            fieldtype: "Table",
                            in_place_edit: true,
                            data: this.data,
                            get_data: () => {
                                return this.data;
                            },
                            fields: [
                                {
                                    fieldtype: "Data",
                                    fieldname: "subject",
                                    in_list_view: 1,
                                    reqd: 1,
                                    label: __("Subject"),
                                },
                            ],
                        },
                    ],
                    primary_action: function () {
                        dialog.hide();
                        return frappe.call({
                            method: "erpnext.projects.doctype.task.task.add_multiple_tasks",
                            args: {
                                data: dialog.get_values()["multiple_tasks"],
                                parent: node.data.value,
                            },
                            callback: function () {},
                        });
                    },
                    primary_action_label: __("Create"),
                });
                dialog.show();
            },
        },
    ],
    extend_toolbar: true,
};
