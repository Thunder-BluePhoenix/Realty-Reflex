frappe.ui.form.on('Task', {
    validate: function(frm) {
        // Get the current field values
        let current_values = {
            remark: frm.doc.custom_remark,
            allocated_amount: frm.doc.custom_allocated_amount,
            rate: frm.doc.custom_rate,
            budget_type: frm.doc.custom_budget_type,
            builtup_area: frm.doc.custom_builtup_area,
            attachment: frm.doc.custom_attach
        };

        // Get the previous values (stored in the __previous_values property)
        let previous_values = frm.__previous_values || {};

        // Check if any of the tracked fields have changed
        let has_changes = false;
        for (let field in current_values) {
            if (current_values[field] !== previous_values[field]) {
                has_changes = true;
                break;
            }
        }
        let allocated_amo = frm.doc.custom_allocated_amount;
        let amo = frm.doc.custom_total_budget_allocated;

        // If there are changes, add a new revision row

        if (has_changes && allocated_amo <= amo) {
            // Create a new row in the custom_revisions table
            let new_row = frm.add_child('custom_revisions');
            
            // Set the values for the new row
            new_row.date_and_time = frappe.datetime.now_datetime();
            new_row.budget_type = frm.doc.custom_budget_type;
            new_row.remark = frm.doc.custom_remark;
            new_row.rate = frm.doc.custom_rate;
            new_row.trans_amount = frm.doc.custom_allocated_amount;
            new_row.built_up_area = frm.doc.custom_builtup_area;
            new_row.entered_by = frappe.session.user_fullname;
            new_row.attachment = frm.doc.custom_attach;
            new_row.status = 'Pending';  // Default status

            let revision_count = (frm.doc.custom_revisions || []).length;
            new_row.revision = `REV-${String(revision_count + 1).padStart(3, '0')}`;

            
            // Store current values as previous values for next comparison
            frm.__previous_values = {...current_values};
            
            // Refresh the child table
            frm.refresh_field('custom_revisions');
        }
    }
});

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
frappe.ui.form.on('Task', {
    refresh: function(frm) {
        // Remove add/delete buttons from the grid
        frm.set_df_property('custom_revisions', 'cannot_add_rows', true);
        frm.set_df_property('custom_revisions', 'cannot_delete_rows', true);
    }
});

// Additional handling for child table
frappe.ui.form.on('Task Revisions', {
    form_render: function(frm) {
        // Hide add/delete buttons at row level
        frm.fields_dict['custom_revisions'].grid.wrapper.find('.grid-add-row').hide();
        frm.fields_dict['custom_revisions'].grid.wrapper.find('.grid-remove-rows').hide();
    }
});

