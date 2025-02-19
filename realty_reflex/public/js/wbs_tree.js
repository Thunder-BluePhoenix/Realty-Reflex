// frappe.provide("frappe.treeview_settings");

// frappe.treeview_settings["Task"] = {
//     get_tree_nodes: "erpnext.projects.doctype.task.task.get_children",
// 	on_get_node: function (nodes, deep = false) {
// 		const project = frappe.project_selector.current_project
//         if (!$('.task-headers').length) {
//             const headerHTML = `
//                 <div class="task-headers" style="display: flex; justify-content: flex-end; margin-bottom: 10px; padding-right: 15px;">
//                     <div style="width: 100px; text-align: center;">Type</div>
//                     <div style="width: 100px; text-align: center;">Status</div>
                    
//                     <div style="width: 100px; text-align: center;">Allocated</div>
//                     <div style="width: 100px; text-align: center;">Amount</div>
//                     <div style="width: 150px; text-align: center;">Current Amount</div>
                    
//                 </div>
//             `;
//             $('.tree').prepend(headerHTML);
//         }

// 		console.log("$$$$$$$$$$$$$$$$$$$$$$$$",nodes)
// 		const get_balances = frappe.call({
// 			method: "realty_reflex.api.get_task_value",
// 			args: {
// 				project: project
// 			},
// 		});
// 		get_balances.then((r) => {
// 		for (let task of r.message) {
// 		const node = cur_tree.nodes && cur_tree.nodes[task.name];
		
// 		console.log("#########################",node.parent)
// 		node.parent && node.parent.find(".balance-area").remove();
// 		const displayHTML = `
//                     <span class="balance-area pull-right" style="display: flex; gap: 10px; margin-right: 15px;">
//                         <div style="width: 100px; text-align: center;">${task.custom_release_budget_type || 'N/A'}</div>
//                         <div style="width: 100px; text-align: center;">${task.custom_substatus || 'N/A'}</div>
                        
//                         <div style="width: 100px; text-align: center;">${task.custom_release_allocated_amount || '0'}</div>
//                         <div style="width: 100px; text-align: center;">${task.custom_release_amount || '0'}</div>
//                         <div style="width: 100px; text-align: center;">${task.custom_total_budget_allocated || '0'}</div>
                        
//                     </span>
//                 `;
                
//                 $(displayHTML).insertBefore(node.$ul);

// 		}
// 	})
// 	},
//     add_tree_node: "erpnext.projects.doctype.task.task.add_node",
//     filters: [
//         {
//             fieldname: "project",
//             fieldtype: "Link",
//             options: "Project",
//             label: __("Project"),
//             reqd: 1,
//             default: frappe.project_selector.current_project,
//             on_change: function() {
//                 // Refresh tree when project changes
//                 cur_tree.args.project = this.value;
//                 cur_tree.make_tree();
//             }

//         },
//         {
//             fieldname: "task",
//             fieldtype: "Link",
//             options: "Task",
//             label: __("Task"),
//             get_query: function () {
//                 var me = frappe.treeview_settings["Task"];
//                 var project = me.page.fields_dict.project.get_value();
//                 var args = [["Task", "is_group", "=", 1]];
//                 if (project) {
//                     args.push(["Task", "project", "=", project]);
//                 }
//                 return {
//                     filters: args,
//                 };
//             },
//         },
//     ],
//     breadcrumb: "Projects",
//     get_tree_root: false,
//     root_label: "All Tasks",
//     ignore_fields: ["parent_task"],
//     onload: function (me) {
//         // Add other inner buttons
//         me.page.add_inner_button(
//             __("Budget Release"),
//             function () {
// 				const project = me.page.fields_dict.project.get_value();
//                 frappe.new_doc('Budget Release', {
//                     'project': project
//                   });

				
// 			}
//         ).addClass('btn-primary');
//         frappe.treeview_settings["Task"].page = {};
//         $.extend(frappe.treeview_settings["Task"].page, me.page);
//         me.make_tree();

		
//         // me.page.add_inner_button(
//         //     __("Lock"),
//         //     function () {
// 		// 		const project = me.page.fields_dict.project.get_value();

// 		// 		if (!project) {
// 		// 			frappe.msgprint(__("Please select a project first"));
// 		// 			return;
// 		// 		}
		
// 		// 		frappe.call({
// 		// 			method: "realty_reflex.api.lock_project_tasks",
// 		// 			args: {
// 		// 				project: project,
// 		// 			},
// 		// 			callback: function (response) {
// 		// 				frappe.msgprint(__("All tasks have been locked"));
// 		// 				me.make_tree(); // Refresh the tree to reflect changes
// 		// 			},
// 		// 		});
				
// 		// 	}
//         // );
//         // me.page.add_inner_button(
//         //     __("Unlock"),
//         //     function () {
// 		// 		const project = me.page.fields_dict.project.get_value();


// 		// 		if (!project) {
// 		// 			frappe.msgprint(__("Please select a project first"));
// 		// 			return;
// 		// 		}
		
// 		// 		frappe.call({
// 		// 			method: "realty_reflex.api.lock_project_tasks",
// 		// 			args: {
// 		// 				project: project,
// 		// 			},
// 		// 			callback: function (response) {
// 		// 				frappe.msgprint(__("All tasks have been locked"));
// 		// 				me.make_tree(); // Refresh the tree to reflect changes
// 		// 			},
// 		// 		});
				
			
// 		// 	}
//         // );

//         frappe.treeview_settings["Task"].page = {};
//         $.extend(frappe.treeview_settings["Task"].page, me.page);
//         me.make_tree();
//     },
//     toolbar: [
//         {
//             label: __("Add Multiple"),
//             condition: function (node) {
//                 return node.expandable;
//             },
//             click: function (node) {
//                 this.data = [];
//                 const dialog = new frappe.ui.Dialog({
//                     title: __("Add Multiple Tasks"),
//                     fields: [
//                         {
//                             fieldname: "multiple_tasks",
//                             fieldtype: "Table",
//                             in_place_edit: true,
//                             data: this.data,
//                             get_data: () => {
//                                 return this.data;
//                             },
//                             fields: [
//                                 {
//                                     fieldtype: "Data",
//                                     fieldname: "subject",
//                                     in_list_view: 1,
//                                     reqd: 1,
//                                     label: __("Subject"),
//                                 },
//                             ],
//                         },
//                     ],
//                     primary_action: function () {
//                         dialog.hide();
//                         return frappe.call({
//                             method: "erpnext.projects.doctype.task.task.add_multiple_tasks",
//                             args: {
//                                 data: dialog.get_values()["multiple_tasks"],
//                                 parent: node.data.value,
//                             },
//                             callback: function () {},
//                         });
//                     },
//                     primary_action_label: __("Create"),
//                 });
//                 dialog.show();
//             },
//         },
//     ],
//     extend_toolbar: true,
// };




frappe.provide("frappe.treeview_settings");

frappe.treeview_settings["Task"] = {
    get_tree_nodes: "erpnext.projects.doctype.task.task.get_children",
    get_tree_root: false,
    root_label: "All Tasks",
    ignore_fields: ["parent_task"],
    expand_all: true,
    on_get_node: function (nodes, deep = false) {
        const project = frappe.project_selector.current_project;
        
        $('.task-headers').remove();
        
        if (!nodes[0]?.parent_task) {
            const headerHTML = `
                <div class="task-headers" style="
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #d1d8dd;
                    background-color: #f7fafc;
                    padding-top: 8px;
                    padding-bottom: 8px;
                    position: sticky;
                    top: 60px;
                    z-index: 0;
                    padding-right: 20px;
                    pointer-events: none;
                    margin-left: 300px;
                ">
                    <div style="width: 125px; text-align: left; font-weight: 700;">Type</div>
                    <div style="width: 135px; text-align: center; font-weight: 700;">Status</div>
                    <div style="width: 120px; text-align: center; font-weight: 700;">Allocated</div>
                    <div style="width: 120px; text-align: center; font-weight: 700;">Amount</div>
                    <div style="width: 120px; text-align: right; font-weight: 700;">Current Amount</div>
                </div>
            `;
            $('.tree').prepend(headerHTML);
        }

        const get_balances = frappe.call({
            method: "realty_reflex.api.get_task_value",
            args: {
                project: project
            },
        });
        
        get_balances.then((r) => {
            for (let task of r.message) {
                const node = cur_tree.nodes && cur_tree.nodes[task.name];
                if (!node) continue;
                
                node.$tree_link.find(".balance-area").remove();
                
                const amount = parseFloat(task.custom_release_amount || 0);
                const currentAmount = parseFloat(task.custom_total_budget_allocated || 0);
                const hasDifference = amount !== currentAmount;
                const currentAmountColor = hasDifference ? 'red' : 'green';

                // Calculate the nesting level
                const nestingLevel = node.$tree_link.parents('li').length;
                const baseIndent = 20; // Base indentation
                const levelIndent = nestingLevel * 20; // Additional indent per level
                const maxTaskWidth = 250 - levelIndent; // Adjust max width based on nesting

                // Style the tree link container
                node.$tree_link.css({
                    'display': 'flex',
                    'align-items': 'center',
                    'position': 'relative',
                    'height': '30px',
                    'cursor': 'pointer',
                    'padding-right': '620px' // Space for the right-side columns
                });

                // Style the task label container
                const $taskLabel = node.$tree_link.find('.tree-label');
                $taskLabel.css({
                    'max-width': `${maxTaskWidth}px`,
                    'white-space': 'nowrap',
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis',
                    'display': 'block'
                });

                // Add tooltip for long text
                $taskLabel.attr('title', $taskLabel.text());
                
                const displayHTML = `
                    <div class="balance-area" style="
                        display: flex;
                        position: absolute;
                        right: 20px;
                        top: 50%;
                        transform: translateY(-50%);
                        gap: 0;
                        cursor: pointer;
                        background-color: white;
                    ">
                        <div style="width: 120px; text-align: left; padding-right: 20px; font-weight: 600;">${task.custom_release_budget_type || 'N/A'}</div>
                        <div style="width: 160px; text-align: center; padding-right: 20px; font-weight: 600;">${task.custom_substatus || 'N/A'}</div>
                        <div style="width: 100px; text-align: center; padding-right: 28px; font-weight: 600;">${task.custom_release_allocated_amount || '0'}</div>
                        <div style="width: 130px; text-align: center; padding-right: 15px; font-weight: 600;">${task.custom_release_amount || '0'}</div>
                        <div style="width: 100px; text-align: right; background-color: ${currentAmountColor}; color: white; padding: 2px 8px; border-radius: 3px; font-weight: 600;">${task.custom_total_budget_allocated || '0'}</div>
                    </div>
                `;
                
                node.$tree_link.append(displayHTML);

                // Click handler
                node.$tree_link.on('click', function(e) {
                    if (!$(e.target).hasClass('octicon')) {
                        if (cur_tree.toolbar) {
                            cur_tree.selected_node = node;
                            cur_tree.toolbar.show();
                        }
                        $(this).css('background-color', '#f8f8f8');
                        setTimeout(() => {
                            $(this).css('background-color', '');
                        }, 200);
                    }
                });
            }
        });
    },


    
    // Rest of the code remains unchanged...
    add_tree_node: "erpnext.projects.doctype.task.task.add_node",
    filters: [
        {
            fieldname: "project",
            fieldtype: "Link",
            options: "Project",
            label: __("Project"),
            reqd: 1,
            default: frappe.project_selector.current_project || "",
            on_change: function() {
                cur_tree.args.project = this.value;
                cur_tree.make_tree();
            }
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
    onload: function (me) {
        me.page.add_inner_button(
            __("Budget Release"),
            function () {
                const project = me.page.fields_dict.project.get_value();
                frappe.new_doc('Budget Release', {
                    'project': project
                });
            }
        ).addClass('btn-primary');
        
        frappe.treeview_settings["Task"].page = {};
        $.extend(frappe.treeview_settings["Task"].page, me.page);
        
        if (frappe.project_selector.current_project) {
            me.page.fields_dict.project.set_value(frappe.project_selector.current_project);
        }
        
        me.make_tree();
        setTimeout(() => {
            me.tree.expand_all();
        }, 1000);
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

