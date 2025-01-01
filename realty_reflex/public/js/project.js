frappe.ui.form.on('Project', {
    custom_address_name: function(frm) {
        if (frm.doc.custom_address_name) {
            frappe.call({
                method: 'frappe.client.get',
                args: { doctype: 'Address', name: frm.doc.custom_address_name },
                callback: function(response) {
                    if (response.message) {
                        let address = response.message;
                        frm.set_value('custom_address', `
    ${address.address_title || ''} · ${address.address_type || ''}
    ${address.address_line1 || ''}
    ${address.city || ''}, ${address.state || ''}
    PIN Code: ${address.pincode || ''}
    ${address.country || ''}
                        `);
                    }
                }
            });
        } else {
            frm.set_value('custom_address', '');
        }
    }
});


frappe.ui.form.on('Project', {
    custom_contact_name: function(frm) {
        if (frm.doc.custom_contact_name) {
            frappe.call({
                method: 'frappe.client.get',
                args: { doctype: 'Contact', name: frm.doc.custom_contact_name },
                callback: function(response) {
                    if (response.message) {
                        let contact = response.message;
                        let formatted_contact = `
${contact.first_name || ''} ${contact.middle_name || ''} ${contact.last_name || ''}
${contact.phone_nos && contact.phone_nos.length > 0
    ? contact.phone_nos
        .map(p => `${p.phone || ''} ${p.is_primary_phone ? '(Primary Phone)' : ''} ${p.is_primary_mobile ? '(Primary Mobile)' : ''}`)
        .join('\n')
    : 'No phone numbers available'}
${contact.email_ids && contact.email_ids.length > 0
    ? contact.email_ids
        .map(e => `${e.email_id || ''} ${e.is_primary ? '(Primary Email)' : ''}`)
        .join('\n')
    : 'No email IDs available'}
                        `;
                        frm.set_value('custom_contact_details', formatted_contact.trim());
                    }
                }
            });
        } else {
            frm.set_value('custom_contact_details', '');
        }
    }
});

frappe.ui.form.on('Project', {
    refresh: function(frm) {
        // Bind functionality to the custom_new_address button
        frm.fields_dict.custom_new_address.$wrapper.find('button').on('click', function() {
            open_address_dialog(frm, 'custom_new_address', 'custom_address', 'custom_address_name');
        });

       // Bind functionality to the custom_new_contact button
       frm.fields_dict.custom_new_contact.$wrapper.find('button').on('click', function() {
        open_contact_dialog(frm, 'custom_new_contact', 'custom_contact_details', 'custom_contact_name');
        });

        // Bind functionality to the custom_new_site_contact button
        frm.fields_dict.custom_new_site_contact.$wrapper.find('button').on('click', function() {
            open_contact_dialog(frm, 'custom_new_site_contact', 'custom_site_contact', 'custom_site_contact_name');
        });

        // Bind functionality to the custom_new_architect_contact button
        frm.fields_dict.custom_new_architect_contact.$wrapper.find('button').on('click', function() {
            open_contact_dialog(frm, 'custom_new_architect_contact', 'custom_architect_contact', 'custom_architect_contact_name');
        });

        // Bind functionality to the custom_new_structural_consultant_contact button
        frm.fields_dict.custom__new_structural_consultant_contact.$wrapper.find('button').on('click', function() {
            open_contact_dialog(frm, 'custom__new_structural_consultant_contact', 'custom_structural_consultant_contact', 'custom_structural_consultant_contact_name');
        });

        // Bind functionality to the custom_new_engineer_incharge_contact button
        frm.fields_dict.custom__new_engineer_incharge_contact.$wrapper.find('button').on('click', function() {
            open_contact_dialog(frm, 'custom__new_engineer_incharge_contact', 'custom_engineer_contact', 'custom_engineer_contact_name');
        });
    },

    custom_contact_name: function(frm) {
        update_contact_details(frm, 'custom_contact_name', 'custom_contact_details');
    },

    custom_site_contact_name: function(frm) {
        update_contact_details(frm, 'custom_site_contact_name', 'custom_site_contact');
    },

    custom_architect_contact_name: function(frm) {
        update_contact_details(frm, 'custom_architect_contact_name', 'custom_architect_contact');
    },

    custom_structural_consultant_contact_name: function(frm) {
        update_contact_details(frm, 'custom_structural_consultant_contact_name', 'custom_structural_consultant_contact');
    },

    custom_engineer_contact_name: function(frm) {
        update_contact_details(frm, 'custom_engineer_contact_name', 'custom_engineer_contact');
    }
});

function open_address_dialog(frm, html_field, custom_address_field, custom_address_name_field) {
    let dialog = new frappe.ui.Dialog({
        title: __('New Address'),
        fields: [
            {fieldname: 'link_doctype', label: 'Link Document Type', fieldtype: 'Link', options: 'DocType', reqd: 1},
            {fieldname: 'link_name', label: 'Link Name', fieldtype: 'Dynamic Link', options: 'link_doctype', reqd: 1},
            {fieldname: 'gstin_uin', label: 'GSTIN / UIN', fieldtype: 'Data'},
            {fieldname: 'address_type', label: 'Address Type', fieldtype: 'Select', options: ['Billing', 'Shipping'], default: 'Billing', reqd: 1},
            {fieldname: 'gst_category', label: 'GST Category', fieldtype: 'Select', options: ['Registered', 'Unregistered'], default: 'Unregistered', reqd: 1},
            {fieldname: 'postal_code', label: 'Postal Code', fieldtype: 'Data', reqd: 1},
            {fieldname: 'city', label: 'City/Town', fieldtype: 'Data', reqd: 1},
            {fieldname: 'address_line1', label: 'Address Line 1', fieldtype: 'Data', reqd: 1},
            {fieldname: 'state', label: 'State/Province', fieldtype: 'Data', reqd: 1},
            {fieldname: 'country', label: 'Country', fieldtype: 'Data', default: 'India', reqd: 1}
        ],
        primary_action_label: __('Save'),
        primary_action: function(values) {
            frappe.call({
                method: 'frappe.client.insert',
                args: {
                    doc: {
                        doctype: 'Address',
                        address_title: values.link_name,
                        address_type: values.address_type,
                        gst_category: values.gst_category,
                        gstin: values.gstin_uin,
                        address_line1: values.address_line1,
                        city: values.city,
                        state: values.state,
                        country: values.country,
                        pincode: values.postal_code,
                        links: [{link_doctype: values.link_doctype, link_name: values.link_name}]
                    }
                },
                callback: function(response) {
                    if (response.message) {
                        let address = response.message;
                        let formatted_address = `
                            <b>${address.address_title} · ${address.address_type}</b><br>
                            ${address.address_line1}<br>
                            ${address.city}, ${address.state}<br>
                            PIN Code: ${address.pincode}<br>
                            ${address.country}
                        `;
                        frm.set_value(custom_address_field, formatted_address);
                        frm.set_value(custom_address_name_field, address.name);
                        frappe.msgprint(__('Address created successfully and updated in the form.'));
                        dialog.hide();
                    }
                }
            });
        }
    });

    dialog.show();
}

function open_contact_dialog(frm, html_field, custom_contact_field, custom_contact_name_field) {
    let dialog = new frappe.ui.Dialog({
        title: 'Add New Contact',
        fields: [
            { fieldname: 'first_name', label: 'First Name', fieldtype: 'Data', reqd: 1 },
            { fieldname: 'middle_name', label: 'Middle Name', fieldtype: 'Data' },
            { fieldname: 'last_name', label: 'Last Name', fieldtype: 'Data' },
            {
                fieldname: 'email_ids',
                label: 'Email IDs',
                fieldtype: 'Table',
                options: 'Contact Email',
                fields: [
                    { fieldname: 'email_id', label: 'Email ID', fieldtype: 'Data', reqd: 1, in_list_view: 1 },
                    { fieldname: 'is_primary', label: 'Is Primary', fieldtype: 'Check', in_list_view: 1 }
                ]
            },
            {
                fieldname: 'phone_nos',
                label: 'Phone Numbers',
                fieldtype: 'Table',
                options: 'Contact Phone',
                fields: [
                    { fieldname: 'phone', label: 'Number', fieldtype: 'Data', reqd: 1, in_list_view: 1 },
                    { fieldname: 'is_primary_phone', label: 'Is Primary Phone', fieldtype: 'Check', in_list_view: 1 },
                    { fieldname: 'is_primary_mobile_no', label: 'Is Primary Mobile', fieldtype: 'Check', in_list_view: 1 }
                ]
            },
            { fieldname: 'link_doctype', label: 'Link Document Type', fieldtype: 'Link', options: 'DocType', reqd: 1 },
            { fieldname: 'link_name', label: 'Link Name', fieldtype: 'Dynamic Link', options: 'link_doctype', reqd: 1 }
        ],
        primary_action_label: 'Save Contact',
        primary_action: function(values) {
            frappe.call({
                method: 'frappe.client.insert',
                args: {
                    doc: {
                        doctype: 'Contact',
                        first_name: values.first_name,
                        middle_name: values.middle_name,
                        last_name: values.last_name,
                        email_ids: values.email_ids.map(row => ({
                            email_id: row.email_id,
                            is_primary: row.is_primary
                        })),
                        phone_nos: values.phone_nos.map(row => ({
                            phone: row.phone,
                            is_primary_phone: row.is_primary_phone,
                            is_primary_mobile_no: row.is_primary_mobile_no
                        })),
                        links: [{ link_doctype: values.link_doctype, link_name: values.link_name }]
                    }
                },
                callback: function(response) {
                    if (response.message) {
                        let contact = response.message;
                        
                        // Set the contact name in the specified field
                        frm.set_value(custom_contact_name_field, contact.name);

                        // Call the update_contact_details function to set formatted details
                        update_contact_details(frm, custom_contact_name_field, custom_contact_field);

                        frappe.msgprint(__('Contact created successfully and updated in the form.'));
                        dialog.hide();
                    }
                }
            });
        }
    });

    dialog.show();
}

function update_contact_details(frm, contact_name_field, contact_details_field) {
    if (frm.doc[contact_name_field]) {
        frappe.call({
            method: 'frappe.client.get',
            args: { doctype: 'Contact', name: frm.doc[contact_name_field] },
            callback: function(response) {
                if (response.message) {
                    let contact = response.message;
                    let formatted_contact = `
${contact.first_name || ''} ${contact.middle_name || ''} ${contact.last_name || ''}
${contact.phone_nos && contact.phone_nos.length > 0
    ? contact.phone_nos
        .map(p => `${p.phone || ''} ${p.is_primary_phone ? '(Primary Phone)' : ''} ${p.is_primary_mobile_no ? '(Primary Mobile)' : ''}`)
        .join('\n')
    : 'No phone numbers available'}
${contact.email_ids && contact.email_ids.length > 0
    ? contact.email_ids
        .map(e => `${e.email_id || ''} ${e.is_primary ? '(Primary Email)' : ''}`)
        .join('\n')
    : 'No email IDs available'}
                    `;
                    frm.set_value(contact_details_field, formatted_contact.trim());
                }
            }
        });
    } else {
        frm.set_value(contact_details_field, '');
    }
}
