frappe.ui.form.on('Unit', {
    refresh: function (frm) {
      if (frm.doc.__islocal) {
        return;
      }
      setTimeout(function () {
        // Remove existing custom buttons
        frm.remove_custom_button('Create Quotation');
        frm.remove_custom_button('Block With Money', 'Actions');
        frm.remove_custom_button('Block Without Money', 'Actions');
  
  
        // Add custom button to create a Sub-Project
        
      }, 300);
    }
  });
  
  