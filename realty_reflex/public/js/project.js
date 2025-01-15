frappe.ui.form.on('Project', {
    custom_address_name: function(frm) {
        
            if (frm.doc.custom_address_name) {
                frappe.call({
                    method: "frappe.contacts.doctype.address.address.get_address_display",
                    args: {
                        address_dict: frm.doc.custom_address_name,
                    },
                    callback: function (r) {
                        frm.set_value("primary_address", r.message);
                    },
                });
            }
            if (!frm.doc.custom_address_name) {
                frm.set_value("primary_address", "");
            }
        
    },
    setup:function(frm) {
        frm.set_query("custom_address_name", function (doc) {
            return {
                filters: {
                    link_doctype: "Project",
                    link_name: doc.name,
                },
            };
        });
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
    refresh: function (frm) {
      if (frm.doc.__islocal) {
        return;
      }
      frm.toggle_display(["address_html", "contact_html"], !frm.doc.__islocal);

        if (frm.doc.__islocal) {
            frappe.contacts.clear_address_and_contact(frm);
        } else {
            frappe.contacts.render_address_and_contact(frm);
        }
      setTimeout(function () {
        // Remove existing custom buttons
        frm.remove_custom_button('Create tower');
        frm.remove_custom_button('Tower', 'View');
        frm.remove_custom_button('Stock', 'View');
  
  
        // Add custom button to create a Sub-Project
        frm.add_custom_button('Create Sub-Project', function () {
          var project_name = frm.doc.name;
          console.log(project_name, "project_name");
          frappe.new_doc('Sub Project', {
            'project': project_name
          });
        });
  
  
        // Add buttons under the "View" group
        frm.add_custom_button('Sub Projects', function () {
          // Update custom filter in frappe.project_selector
        //   frappe.project_selector.current_project = frm.doc.name;
  
  
          // Navigate to Sub Project list with filter
          frappe.set_route('List', 'Sub Project', {
            // project: frm.doc.name
          });
        }, 'View');
  
  
        frm.add_custom_button('Units', function () {
          // Update custom filter in frappe.project_selector
        //   frappe.project_selector.current_project = frm.doc.name;
  
  
          // Navigate to Unit list with filter
          frappe.set_route('List', 'Unit', {
            // project_name: frm.doc.name
          });
        }, 'View');
      }, 300);
    }
  });
  
  
  
  
  
  
  