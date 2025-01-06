frappe.listview_settings['Project'] = {
    add_fields: ["name", "project_name"],
    
    button: 
        {
            show(doc) {
                return doc.name;  // Show button for all projects
            },
            get_label() {
                return 'View Sub-Project';
            },
            get_description(doc) {
                return __('View Sub-Projects for {0}', [doc.name]);
            },
            action(doc) {
                // Route to Sub Project list view with project filter
                frappe.set_route('List', 'Sub Project', {
                    'project': doc.name
                });
            }
        },
        // {
        //     show(doc) {
        //         return doc.name;  // Show button for all projects
        //     },
        //     get_label() {
        //         return 'View WBS';
        //     },
        //     get_description(doc) {
        //         return __('View WBS for {0}', [doc.name]);
        //     },
        //     action(doc) {
        //         // Route to WBS list view with project filter
        //         frappe.set_route('List', 'WBS', {
        //             'project': doc.name
        //         });
        //     }
        // }
    
};

    // Optional: Add indicator colors based on status
    // get_indicator: function(doc) {
    //     return [__(doc.status), {
    //         'Planning': 'blue',
    //         'Budgeting': 'orange',
    //         'Construction': 'green'
    //     }[doc.status], 'status,=,' + doc.status];
    // },

    // You can also add an action button in the menu for all selected items
//     onload: function(listview) {
//         listview.page.add_action_item(__('View Sub-Projects'), function() {
//             const selected_docs = listview.get_checked_items();
            
//             if (selected_docs.length === 0) {
//                 frappe.msgprint(__('Please select at least one Project'));
//                 return;
//             }
            
//             if (selected_docs.length > 1) {
//                 frappe.msgprint(__('Please select only one Project'));
//                 return;
//             }

//             // Route to Sub Project list with filter
//             frappe.set_route('List', 'Sub Project', {
//                 'project': selected_docs[0].name
//             });
//         });
//     }
// };

