
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
        if (frm.doc.custom_wbs_status == "Locked") {
            frm.set_df_property('custom_budget_type', 'read_only', 1); // Replace with actual field name
            frm.set_df_property('custom_builtup_area', 'read_only', 1);
            frm.set_df_property('custom_rate', 'read_only', 1); // Replace with actual field name
            frm.set_df_property('custom_total_budget_allocated', 'read_only', 1);
            frm.set_df_property('custom_allocated_amount', 'read_only', 1); // Replace with actual field name
            frm.set_df_property('custom_remark', 'read_only', 1);
            frm.set_df_property('custom_attach', 'read_only', 1);
            frm.set_df_property('custom_pending_amount', 'read_only', 1);
            
            frm.refresh_fields();
        }
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



// frappe.ui.form.on('Task', {
//     refresh: function(frm) {
//         if (!frm.service_material_spec) {
//             let wrapper = $('<div>').appendTo(frm.fields_dict.custom_service_specification_html.wrapper);
//             frm.service_material_spec = new frappe.ui.form.ServiceMaterialSpecification({
//                 parent: wrapper,
//                 frm: frm
//             });
//         }
        
//         // Load saved data if any
//         let saved_data = frm.doc.custom_service_specification_data;
//         if (saved_data) {
//             try {
//                 saved_data = JSON.parse(saved_data);
//                 frm.service_material_spec.set_value(saved_data);
//             } catch (e) {
//                 console.error('Error parsing service specification data:', e);
//             }
//         }
//     },

//     before_save: function(frm) {
//         // Save the data before form submission
//         let data = frm.service_material_spec.get_value();
//         frm.doc.custom_service_specification_data = JSON.stringify(data);
//     }
// });



// frappe.ui.form.on('Task', {
//     refresh: function(frm){
//             frm.fields_dict.custom_service_specification_html.$wrapper.load('/assets/realty_reflex/js/service_specification.html');
//     }
// })
frappe.ui.form.on('Task', {
    refresh: function (frm) {
        const alignment_css = `
            <style>
       #service-spec-table {
               width: 100%;
    border-collapse: collapse;
    margin-bottom: 10px;
    
    border-radius: 7px;
    border: 5px;
       }

       #service-spec-table th, {
              text-align: left;
              vertical-align: middle;
              border: 1px solid #ddd;
              padding-left: 5px;
              padding-right: 5px;
              min-width: 3rem !important;
           
           
       }
            #service-spec-table td {
              text-align: left;
              vertical-align: middle;
              border: 1px solid #ddd;
              padding-left: 5px;
              padding-right: 5px;
              padding-bottom: 0;
              padding-top: 0;
              min-width: 3rem !important;
           
           
       }

       #service-spec-table th {
           background-color: #f9f9f9;
           font-weight: bold;
           text-transform: capitalize;
           
       }

       /* Adjust column widths */
       #service-spec-table th:nth-child(4), /* Unit column */
       #service-spec-table td:nth-child(4) {
           width: 8%;
       }

       #service-spec-table th:nth-child(5), /* Qty column */
       #service-spec-table td:nth-child(5) {
           width: 8%;
       }

       #service-spec-table th:nth-child(8), /* Total column */
       #service-spec-table td:nth-child(8) {
           width: 15%;
           font-weight: bold;
       }

       #service-spec-table td .frappe-control {
           margin: auto !important;
           width: 100% !important;
       }

       /* Make total field text bigger */
       #service-spec-table td:nth-child(8) input {
           font-size: 1.1em;
           font-weight: bold;
       }

       #service-spec-table .select-row {
           margin-left: 1px;
           display: block;
       }

       #service-spec-table .edit-row {
           display: flex;
           justify-content: center;
           align-items: center;
           width: 30px;
           height: 30px;
           margin: auto;
       }

       #service-spec-table .edit-row i {
           font-size: 16px;
       }

       #add-row-btn, #delete-row-btn {
           margin-top: 1px;
       }
         #select-counter {
         font-size: 12px;
         font-weight: 600;
         }
       #select-check{
       display: flex;
       algin-items: center;
       justify-content: start;
       }
   </style>`;

 
        $('head').append(alignment_css);
 
        let table_html = `
            <table class="table table-bordered" id="service-spec-table">
                <thead>
                    <tr>
                        <th><span id="select-check"><input type="checkbox" id="select-all-rows" class="select-all-checkbox"><span id="select-counter"></span></span></th>
                        <th>No</th>
                        <th>Service Item</th>
                        <th>Unit</th>
                        <th>Qty</th>
                        <th>Service Total</th>
                        <th>Material Total</th>
                        <th>Total</th>
                        <th>Edit</th>
                    </tr>
                </thead>
                <tbody id="service-spec-table-body">
                </tbody>
            </table>
            <div>
                <button id="add-row-btn" class="btn btn-primary">Add Row</button>
                <button id="delete-row-btn" class="btn btn-danger" style="display: none;">Delete Selected Row(s)</button>
            </div>
        `;
 
        frm.set_df_property('custom_service_specification_html', 'options', table_html);
 
        if (frm.doc.custom_service_specification_data) {
            populateTable(frm.doc.custom_service_specification_data);
        } else {
            addRow();
        }
 
        setTimeout(() => {
           
            function updateSelectCounter() {
                let selectedCount = $('#service-spec-table-body').find('.select-row:checked').length;
                if (selectedCount > 0) {
                    $('#select-counter').text(selectedCount + 'Row(s)').show();
                } else {
                    $('#select-counter').hide();
                }
                $('#delete-row-btn').toggle(selectedCount > 0); 
            }
        
            $('#add-row-btn').on('click', function () {
                addRow();
                updateSerialNumbers();
            });
        
            
            $('#select-all-rows').on('click', function () {
                let isChecked = $(this).is(':checked');
                $('#service-spec-table-body').find('.select-row').prop('checked', isChecked);
                updateSelectCounter(); 
            });
        
            
            $('#service-spec-table').on('click', '.select-row', function () {
                let selected = $('#service-spec-table-body').find('.select-row:checked').length;
                let total = $('#service-spec-table-body').find('.select-row').length;
                $('#delete-row-btn').toggle(selected > 0);
        
                
                $('#select-all-rows').prop('checked', selected === total);
        
                updateSelectCounter(); 
            });
        
           
            $('#delete-row-btn').on('click', function () {
                $('#service-spec-table-body').find('.select-row:checked').closest('tr').remove();
                $('#delete-row-btn').hide();
                updateSerialNumbers();
          
                $('#select-all-rows').prop('checked', false);
        
                updateSelectCounter(); 
            });
        
            
            $('#service-spec-table').on('click', '.edit-row', function () {
                let row = $(this).closest('tr');
                openEditDialog(
                    row.find('.service-item-link').data('value'),
                    row.find('.unit-link').data('value'),
                    row.find('.qty-field').data('value'),
                    row.find('.service-total-field').data('value'),
                    row.find('.material-total-field').data('value'),
                    row.find('.total-field').data('value'),
                    row.data('rate'),
                    row.data('material_specification'),
                    row.data('item_total')
                );
            });
        }, 500);
        
        
 
        function updateRowTotal(row) {
            const serviceTotal = flt(row.find('.service-total-field').data('value') || 0);
            const materialTotal = flt(row.find('.material-total-field').data('value') || 0);
            const total = serviceTotal + materialTotal;
            row.find('.total-field').data('value', total)
                .find('input').val(total);
        }
 
        function addRow(data = {}) {
            let row = $(`
                <tr>
                    <td><input type="checkbox" class="select-row"></td>
                    <td class="serial-no"></td>
                    <td><div class="service-item-link" data-value="${data.service_item || ''}"></div></td>
                    <td><div class="unit-link" data-value="${data.unit || ''}"></div></td>
                    <td><div class="qty-field" data-value="${data.qty || ''}"></div></td>
                    <td><div class="service-total-field" data-value="${data.service_total || ''}"></div></td>
                    <td><div class="material-total-field" data-value="${data.material_total || ''}"></div></td>
                    <td><div class="total-field" data-value="${data.service_total + data.material_total || ''}"></div></td>
                    <td><button class="btn btn-light edit-row"><i class="fa fa-pencil"></i></button></td>
                </tr>
            `);
 
 
            if (data.material_specification) {
                row.data('material_specification', data.material_specification);
            }
            if (data.rate) {
                row.data('rate', data.rate);
            }
            if (data.item_total) {
                row.data('item_total', data.item_total);
            }
 
            $('#service-spec-table-body').append(row);
            initializeLinkFields();
            updateSerialNumbers();
            updateRowTotal(row);
        }
 
        function populateTable(data) {
            try {
                let table_data = JSON.parse(data);
                table_data.forEach(row => {
                    if (row.material_specification) {
                        if (typeof row.material_specification === 'string') {
                            try {
                                row.material_specification = JSON.parse(row.material_specification);
                            } catch (e) {
                                row.material_specification = [];
                            }
                        }
                    } else {
                        row.material_specification = [];
                    }
                    addRow(row);
                });
            } catch (error) {
                console.error("Error parsing table data: ", error);
                addRow({});
            }
        }


        function initializeLinkFields() {
            $('#service-spec-table-body tr').each(function() {
               
                $(this).find('.service-item-link').each(function() {
                    let $cell = $(this);
                    if (!$cell.find('.frappe-control').length) {
                        let value = $cell.data('value') || '';
                        let control = frappe.ui.form.make_control({
                            df: {
                                fieldtype: 'Link',
                                options: 'Item',
                                value: value,
                                onchange: () => {
                                    let serviceItem = control.get_value();
                                    $cell.data('value', serviceItem);
        
                                    // Fetch the stock_uom from the Item document
                                    if (serviceItem) {
                                        frappe.db.get_value('Item', serviceItem, 'stock_uom', (r) => {
                                            if (r && r.stock_uom) {
                                                let unitCell = $cell.closest('tr').find('.unit-link');
                                                if (unitCell.length && unitCell.data('control')) {
                                                    unitCell.data('control').set_value(r.stock_uom);
                                                }
                                            }
                                        });
                                    }
                                },
                            },
                            parent: this,
                            render_input: true,
                        });
                        control.set_value(value);
                        $cell.css('margin', '0');
                    }
                });
        
                // Initialize Unit field
                $(this).find('.unit-link').each(function() {
                    let $cell = $(this);
                    if (!$cell.find('.frappe-control').length) {
                        let value = $cell.data('value') || '';
                        let control = frappe.ui.form.make_control({
                            df: {
                                fieldtype: 'Link',
                                options: 'UOM',
                                value: value,
                                onchange: () => {
                                    $cell.data('value', control.get_value());
                                },
                            },
                            parent: this,
                            render_input: true,
                        });
                        control.set_value(value);
                        $cell.css('margin', '0');
        
                        // Store reference to the control for updates
                        $cell.data('control', control);
                    }
                });
        

                // Initialize Qty field
                $(this).find('.qty-field').each(function() {
                    let $cell = $(this);
                    if (!$cell.find('.frappe-control').length) {
                        let value = $cell.data('value') || '';
                        let control = frappe.ui.form.make_control({
                            df: {
                                fieldtype: 'Float',
                                value: value,
                                onchange: () => {
                                    $cell.data('value', control.get_value());
                                },
                            },
                            parent: this,
                            render_input: true,
                        });
                        control.set_value(value);
                        $cell.css('margin', '0');
                    }
                });

                // Initialize Service Total field
                $(this).find('.service-total-field').each(function() {
                    let $cell = $(this);
                    if (!$cell.find('.frappe-control').length) {
                        let value = $cell.data('value') || '';
                        let control = frappe.ui.form.make_control({
                            df: {
                                fieldtype: 'Float',
                                value: value,
                                onchange: () => {
                                    $cell.data('value', control.get_value());
                                },
                            },
                            parent: this,
                            render_input: true,
                        });
                        control.set_value(value);
                        $cell.css('margin', '0');
                    }
                });

                // Initialize Material Total field
                $(this).find('.material-total-field').each(function() {
                    let $cell = $(this);
                    if (!$cell.find('.frappe-control').length) {
                        let value = $cell.data('value') || '';
                        let control = frappe.ui.form.make_control({
                            df: {
                                fieldtype: 'Float',
                                value: value,
                                onchange: () => {
                                    $cell.data('value', control.get_value());
                                },
                            },
                            parent: this,
                            render_input: true,
                        });
                        control.set_value(value);
                        $cell.css('margin', '0');
                    }
                });
                $(this).find('.total-field').each(function() {
                    let $cell = $(this);
                    if (!$cell.find('.frappe-control').length) {
                        let value = $cell.data('value') || '';
                        let control = frappe.ui.form.make_control({
                            df: {
                                fieldtype: 'Float',
                                value: value,
                                read_only: 1,
                            },
                            parent: this,
                            render_input: true,
                        });
                        control.set_value(value);
                        $cell.css('margin', '0');
                    }
                });
                const $row = $(this);
                $row.find('.service-total-field, .material-total-field').each(function() {
                    $(this).on('change', 'input', function() {
                        updateRowTotal($row);
                    });
                });
            });
        }
 

        function openEditDialog(service_item, unit, qty, service_total, material_total, total, rate, material_specification = [], item_total = 0) {

            const rowId = $('#service-spec-table-body tr').has('.edit-row:focus').find('.serial-no').text() ||
                        $('#service-spec-table-body tr').last().find('.serial-no').text();

            const dialog = new frappe.ui.Dialog({
                title: `<div style="margin-bottom: 15px;">
                            <h4 style="margin: 0; padding: 0;">Edit Service Specification</h4>
                            <div style="font-size: 14px; margin-top: 5px;">Editing Row: ${rowId}</div>
                        </div>`,
                size: "large",
                fields: [
                    {
                        fieldtype: 'Section Break',
                        label: 'Service Item Details',
                    },
                    {
                        fieldtype: 'Link',
                        label: 'Service Item',
                        fieldname: 'service_item',
                        options: 'Item',
                        default: service_item,
                        onchange: function(e) {
                            if (this.value) {
                                frappe.db.get_value('Item', this.value, 'stock_uom')
                                    .then(r => {
                                        if (r && r.message) {
                                            dialog.set_value('unit', r.message.stock_uom);
                                        }
                                    });
                            }
                        }
                    },

                    {
                        fieldtype: 'Float',
                        label: 'Rate',
                        fieldname: 'rate',
                        default: rate,
                        onchange: function() {
                            updateServiceTotal(dialog);
                        }
                    },
                    {
                        fieldtype: 'Column Break',
                        label: '',
                    },
                    {
                        fieldtype: 'Link',
                        label: 'Unit',
                        fieldname: 'unit',
                        options: 'UOM',
                        default: unit,
                    },
                    {
                        fieldtype: 'Float',
                        label: 'Service Total',
                        fieldname: 'service_total',
                        default: service_total,
                        read_only: 1,
                    },
                    {
                        fieldtype: 'Column Break',
                        label: '',
                    },
                    {
                        fieldtype: 'Float',
                        label: 'Qty',
                        fieldname: 'qty',
                        default: qty,
                        onchange: function() {
                            updateServiceTotal(dialog);
                            calculateTotals(dialog);
                        }
                    },
                    {
                        fieldtype: 'Float',
                        label: 'Material Total',
                        fieldname: 'material_total',
                        default: material_total,
                        read_only: 1,
                    },
                    {
                        fieldtype: 'Section Break',
                        label: '',
                    },
                    {
                        fieldtype: 'Float',
                        label: 'Total',
                        fieldname: 'total',
                        default: total,
                        read_only: 1,
                    },
 
                    {
                        fieldtype: 'Section Break',
                        label: '',
                    },
                    {
                        fieldtype: 'Table',
                        label: 'Material Specification Table',
                        fieldname: 'material_specification',
                        data: material_specification,
                        fields: [
                            {
                                fieldtype: 'Link',
                                label: 'Material Category ID',
                                fieldname: 'material_category_id',
                                in_list_view: 1,
                                options: 'Item Group',
                                change: function() {  // Changed from onchange to change
                                    console.log('Material Category ID changed:', this.get_value()); // Debug log
                                    
                                    const field = this;
                                    const row = field.grid_row;
                                    const material_category_id = field.get_value();
                                    
                                    console.log('Current row:', row); // Debug log
                                    console.log('Material Category ID:', material_category_id); // Debug log
                                    
                                    if (!material_category_id) {
                                        console.log('No material_category_id selected'); // Debug log
                                        return;
                                    }
                                    if (row && row.doc) {
                                        // frappe.model.set_value(row.doc.doctype, row.doc.name, 'material_name', '');
                                        row.doc.material_name = '';
                                        field.grid.refresh();
                                    // }
        
                                    // Update the row immediately to show loading
                                    frappe.model.set_value(row.doc.doctype, row.doc.name, 'material_category', 'Loading...');
                                    frappe.model.set_value(row.doc.doctype, row.doc.name, 'unit', 'Loading...');                                    
                                    console.log('Making frappe.call...'); // Debug log
                                    
                                    frappe.call({
                                        method: 'realty_reflex.overrides.task.get_item_group_details',
                                        args: {
                                            item_group_id: material_category_id
                                        },
                                        freeze: true,
                                        callback: function(response) {
                                            console.log('Got response:', response); // Debug log
                                            
                                            if (response.message) {
                                                console.log('Setting values:', response.message); // Debug log
                                                
                                                // Try both ways to update the values
                                                try {
                                                    // Method 1: Using frappe.model.set_value
                                                    frappe.model.set_value(row.doc.doctype, row.doc.name, {
                                                        'material_category': response.message.custom_material_category_id || '',
                                                        'unit': response.message.custom_unit || ''
                                                    });
                                                    
                                                    // Method 2: Direct assignment
                                                    row.doc.material_category = response.message.custom_material_category_id || '';
                                                    row.doc.unit = response.message.custom_unit || '';
                                                    
                                                    // Refresh everything
                                                    // row.refresh();
                                                    field.grid.refresh();
                                                    dialog.fields_dict.material_specification.grid.refresh();
                                                    
                                                    console.log('Values set successfully'); // Debug log
                                                } catch (err) {
                                                    console.error('Error setting values:', err); // Debug log
                                                    frappe.msgprint({
                                                        title: __('Error'),
                                                        message: __('Error updating values: ') + err.message,
                                                        indicator: 'red'
                                                    });
                                                }
                                            } else {
                                                console.log('No message in response'); // Debug log
                                                frappe.msgprint({
                                                    title: __('Error'),
                                                    message: __('No data found for the selected Material Category ID.'),
                                                    indicator: 'orange'
                                                });
                                            }
                                        },
                                        error: function(err) {
                                            console.error('Server error:', err); // Debug log
                                            frappe.msgprint({
                                                title: __('Error'),
                                                message: __('Failed to fetch material category details: ') + err.message,
                                                indicator: 'red'
                                            });
                                        }
                                    });
                                }

                                    // frappe.call({
                                    //     method: 'realty_reflex.overrides.task.get_material_names',
                                    //     args: {
                                    //         material_category_id: material_category_id
                                    //     },
                                    //     callback: function(response) {
                                    //         if (response.message) {
                                    //             // Store the items in the row for filtering
                                    //             if (row && row.doc) {
                                    //                 row.doc._available_items = response.message;
                                    //             }
                                    //         }
                                    //     }
                                    // });
                    


                                    // if (row && row.doc) {
                                    //     row.doc.material_name = '';
                                    //     field.grid.refresh();
                                    // }
                                }
                            },
                            {
                                fieldtype: 'Link',
                                label: 'Material Name',
                                fieldname: 'material_name',
                                in_list_view: 1,
                                options: 'Item',
                                get_query: function(doc) {
                                    // Access the material_category_id directly from the current row
                                    const material_category_id = doc.material_category_id;
                                    
                                    return {
                                        filters: {
                                            'item_group': material_category_id || ''
                                        }
                                    };
                                }
                            },
                            
                            
 
        
                            {
                                fieldtype: 'Data',
                                label: 'Material Category',
                                fieldname: 'material_category',
                                in_list_view: 1,
                            },
                            {
                                fieldtype: 'Link',
                                label: 'Unit',
                                fieldname: 'unit',
                                in_list_view: 1,
                                columns: 1,
                                options: 'UOM',
                            },
                            {
                                fieldtype: 'Float',
                                label: 'Qty',
                                in_list_view: 1,
                                columns: 1,
                                fieldname: 'qty',
                            },
                            {
                                fieldtype: 'Float',
                                label: 'Rate',
                                in_list_view: 1,
                                fieldname: 'rate',
                            },
                            {
                                fieldtype: 'Float',
                                label: 'Amount',
                                in_list_view: 1,
                                fieldname: 'amount',
                                read_only: 1,
                            },
                        ],
                        onchange: function() {
                            calculateTotals(dialog);
                        }
                    },
                    {
                        fieldtype: 'Section Break',
                        label: '',
                    },
                    {
                        fieldtype: 'Float',
                        label: 'Item Total',
                        fieldname: 'item_total',
                        default: item_total,
                        read_only: 1,
                    },
                    {
                        fieldtype: 'Column Break',
                        label: '',
                    },
                ],
                primary_action_label: 'Save',
                primary_action: function() {
                    let values = dialog.get_values();
                    let selectedRow = $('#service-spec-table-body tr').has('.edit-row:focus').length ?
                        $('#service-spec-table-body tr').has('.edit-row:focus') :
                        $('#service-spec-table-body tr').last();

                    selectedRow.find('.service-item-link').data('value', values.service_item)
                        .find('input').val(values.service_item);
                    selectedRow.find('.unit-link').data('value', values.unit)
                        .find('input').val(values.unit);
                    selectedRow.find('.qty-field').data('value', values.qty)
                        .find('input').val(values.qty);
                    selectedRow.find('.service-total-field').data('value', values.service_total)
                        .find('input').val(values.service_total);
                    selectedRow.find('.material-total-field').data('value', values.material_total)
                        .find('input').val(values.material_total);
                    
                        
                    const total = flt(values.service_total) + flt(values.material_total);
                    selectedRow.find('.total-field').data('value', total)
                        .find('input').val(total);
     
 

                    selectedRow.data('material_specification', values.material_specification);
                    selectedRow.data('rate', values.rate);
                    selectedRow.data('item_total', values.item_total);

                    updateRowTotal(selectedRow);
                    dialog.hide();
                }
            });
            
 

            function calculateAmount(row) {
                const qty = flt(row.qty || 0);
                const rate = flt(row.rate || 0);
                row.amount = qty * rate;
                return row.amount;
}

            function calculateTotals(dialog) {
                let total_amount = 0;
                let material_spec = dialog.get_value('material_specification') || [];

                // Calculate amount for each row and sum up
                material_spec.forEach(row => {
                    total_amount += calculateAmount(row);
                });

                // Set item total
                dialog.set_value('item_total', total_amount);

                // Calculate material total (item_total * parent qty)
                const parent_qty = flt(dialog.get_value('qty') || 0);
                dialog.set_value('material_total', total_amount * parent_qty);

                const service_total = flt(dialog.get_value('service_total') || 0);
                dialog.set_value('total', service_total + material_total);

            }

            function updateServiceTotal(dialog) {
                const rate = flt(dialog.get_value('rate') || 0);
                const qty = flt(dialog.get_value('qty') || 0);
                dialog.set_value('service_total', rate * qty);
                const material_total = flt(dialog.get_value('material_total') || 0);
                dialog.set_value('total', service_total + material_total);

            }

            // Bind events for child table calculations
            dialog.fields_dict.material_specification.grid.wrapper.on('change', function() {
                calculateTotals(dialog);
            });

            // Initial calculations
            updateServiceTotal(dialog);
            calculateTotals(dialog);

            dialog.show();
        }

        // Save function to store all data
        function updateSerialNumbers() {
            $('#service-spec-table-body tr').each(function (index) {
                $(this).find('.serial-no').text(index + 1);
            });
        }

        frm.save_custom_service_spec_data = function () {
            let table_data = [];
            $('#service-spec-table-body tr').each(function () {
                let row = {
                    service_item: $(this).find('.service-item-link').data('value') || '',
                    unit: $(this).find('.unit-link').data('value') || '',
                    qty: $(this).find('.qty-field').data('value') || '',
                    service_total: $(this).find('.service-total-field').data('value') || '',
                    material_total: $(this).find('.material-total-field').data('value') || '',
                    total: $(this).find('.total-field').data('value') || '',

                    material_specification: $(this).data('material_specification') || [],
                    rate: $(this).data('rate') || 0,
                    item_total: $(this).data('item_total') || 0
                };
                table_data.push(row);
            });
            frm.set_value('custom_service_specification_data', JSON.stringify(table_data));
        };
    },

    before_save: function (frm) {
        frm.save_custom_service_spec_data();
    }
});




frappe.ui.form.on('Task', {
    refresh: function(frm) {
        // Create the custom HTML container
        const customHtml = `
        <div class="unit-management">
            <div class="units-table-container">
                <div class="button-container tw-mb-4">
                    <div class="flex-spacer"></div>
                    <div class="right-buttons">
                        <button class="upload-csv-btn">Upload CSV</button>
                        <button class="download-sample-csv-btn">Download Sample CSV</button>
                        <input type="file" accept=".csv" class="hidden-file-input" style="display: none;">
                    </div>
                </div>

                <div class="unit-actions">
                    <div class="action-buttons">
                        <button class="btn btn-sm release-btn">Release</button>
                        <button class="btn btn-sm hold-btn">Hold</button>
                    </div>
                    <div class="status-indicators">
                        <div class="status-item">
                            <span class="status-dot sold"></span>
                            <span class="status-text">Sold</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot hold"></span>
                            <span class="status-text">Hold</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot available"></span>
                            <span class="status-text">Available</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot blocked-without-money"></span>
                            <span class="status-text">Blocked Without Money</span>
                        </div>
                        <div class="status-item">
                            <span class="status-dot blocked-with-money"></span>
                            <span class="status-text">Blocked With Money</span>
                        </div>
                    </div>
                </div>

                <div class="table-scroll-container">
                    <table class="units-table">
                        <thead>
                            <tr>
                                <th class="checkbox-col"><input type="checkbox" class="select-all-checkbox"> Fl.no</th>
                                <th>Unit</th>
                                <th>Sale Area</th>
                                <th>Carpet Area</th>
                                <th>Terrace Area</th>
                                <th>Built-up Area</th>
                                <th>Common Area</th>
                                <th>Unit Status</th>
                                <th>Hold/Release</th>
                                <th>Edit</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
        `;

        // Update the styles
        const styles = `
        <style>
            /* Table container styles */
            .table-scroll-container {
                overflow-x: auto;
                max-height: 600px;
                overflow-y: auto;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                margin-bottom: 16px;
            }



            /* Button container styles */
            .button-container {
                display: flex;
                justify-content: flex-end;
                margin-bottom: 16px;
                position: sticky;
                top: 0;
                background-color: white;
                z-index: 10;
            }

            .right-buttons {
                display: flex;
                gap: 8px;
            }

            /* Upload CSV button */
            .upload-csv-btn {
                background-color: #4F46E5;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            /* Download Sample CSV button */
            .download-sample-csv-btn {
                background-color: #22c55e;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            /* Release/Hold buttons */
            .release-btn {
                background-color: #22c55e;
                color: white;
                border: none;
                padding: 6px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            .hold-btn {
                background-color: #dc2626;
                color: white;
                border: none;
                padding: 6px 16px;
                border-radius: 4px;
                font-size: 13px;
                cursor: pointer;
            }

            /* Hover states */
            .upload-csv-btn:hover { background-color: #4338CA; }
            .download-sample-csv-btn:hover { background-color: #16a34a; }
            .release-btn:hover { background-color: #16a34a; }
            .hold-btn:hover { background-color: #b91c1c; }

            /* Status dots */
            .status-dot {
                width: 12px;
                height: 12px;
                border-radius: 2px;
                display: inline-block;
            }

            .status-dot.sold { background-color: #fcd34d; }
            .status-dot.hold { background-color: #dc2626; }
            .status-dot.available { background-color: #166534; }
            .status-dot.blocked-without-money { background-color: #a21caf; }
            .status-dot.blocked-with-money { background-color: #1e40af; }

            /* Unit management styles */
            .unit-management {
                font-size: 13px;
            }

            .unit-actions {
                display: flex;
                justify-content: space-between;
                padding: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                margin-bottom: 12px;
                position: sticky;
                top: 0;
                background-color: white;
                z-index: 10;
            }

            .action-buttons {
                display: flex;
                gap: 8px;
            }

            .status-indicators {
                display: flex;
                gap: 16px;
            }

            .status-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
            }

            /* Table styles */
            .units-table {
                width: 100%;
                border-collapse: collapse;  /* Changed from separate to collapse */
            }



            /* Remove all internal borders */
            .units-table th,
            .units-table td {
                padding: 10px;
                border: none;  /* Remove internal borders */
                font-size: 13px;
                min-width: 120px;
                white-space: nowrap;
            }



            .units-table th {
                position: sticky;
                top: 0;
                background-color: #f9fafb;
                z-index: 5;
                font-weight: 600;
                border-bottom: 1px solid #e5e7eb;  /* Only bottom border for headers */
            }
            
            .frappe-control[data-fieldtype="HTML"] {
                position: relative;
                z-index: 1;
            }



        tr.status-sold td { 
            background-color: #fcd34d !important; 
            color: white !important;
            border: none !important;
        }
        tr.status-hold td { 
            background-color: #dc2626 !important; 
            color: white !important;
            border: none !important;
        }
        tr.status-available td { 
            background-color: #16a34a !important; 
            color: white !important;
            border: none !important;
        }
        tr.status-blocked-without-money td { 
            background-color: #a21caf !important; 
            color: white !important;
            border: none !important;
        }
        tr.status-blocked-with-money td { 
            background-color: #1e40af !important; 
            color: white !important;
            border: none !important;
        }

        /* Ensure menu options are visible */
        .frappe-control .dropdown-menu {
            background-color: white !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            z-index: 1000 !important;
        }

        .frappe-control .dropdown-menu > li > a {
            color: #1f2937 !important;
            background-color: transparent !important;
        }

        .frappe-control .dropdown-menu > li > a:hover {
            background-color: #f3f4f6 !important;
        }

        /* Fix checkbox alignment */
        .checkbox-col {
            min-width: 80px;
            border: none !important;
        }

        /* Add subtle hover effect for rows */
        .units-table tbody tr:hover td {
            filter: brightness(95%);
        }




        </style>
        `;

        // Set the custom HTML to the field
        frm.set_df_property('custom_release_hold_html', 'options', styles + customHtml);

        // Initialize the component after the HTML is rendered
        setTimeout(() => {
            initializeUnitManagement(frm);
        }, 100);
    }
});

function initializeUnitManagement(frm) {
    const container = frm.fields_dict.custom_release_hold_html.$wrapper[0];
    
    // Get elements
    const releaseBtn = container.querySelector('.release-btn');
    const holdBtn = container.querySelector('.hold-btn');
    const uploadCsvBtn = container.querySelector('.upload-csv-btn');
    const downloadSampleCsvBtn = container.querySelector('.download-sample-csv-btn');
    const fileInput = container.querySelector('.hidden-file-input');
    const selectAllCheckbox = container.querySelector('.select-all-checkbox');
    const tbody = container.querySelector('.units-table tbody');

    let selectedUnits = new Set();
    let unitsData = [];

    // Get status-based CSS class
    function getStatusClass(unit) {
        if (unit.custom_holdrelease === 'Hold') {
            return 'status-hold';
        }else if (unit.custom_holdrelease === 'Release') {
            return 'status-available';
        }
        
        switch(unit.status) {
            case 'Sold':
                return 'status-sold';
            case 'Available':
                return 'status-available';
            case 'Block Without Money':
                return 'status-blocked-without-money';
            case 'Blocked With Money':
                return 'status-blocked-with-money';
            default:
                return '';
        }
    }

    // Render table rows
    function renderUnitsTable() {
        tbody.innerHTML = '';
        
        const sortedUnits = [...unitsData].sort((a, b) => {
            const getFloorNumber = (floor) => {
                if (!floor) return Infinity;
                if (floor.toLowerCase() === 'ground floor') return 0;
                const match = floor.match(/(\d+)/);
                return match ? parseInt(match[1]) : Infinity;
            };
            return getFloorNumber(a.floor) - getFloorNumber(b.floor);
        });

        sortedUnits.forEach(unit => {
            const tr = document.createElement('tr');
            tr.className = getStatusClass(unit);  // Apply status class to row
            
            // Format numbers for better display
            const formatNumber = (num) => num ? Number(num).toLocaleString('en-IN', {
                maximumFractionDigits: 2
            }) : '';

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="unit-checkbox" data-unit="${unit.name}"
                           ${selectedUnits.has(unit.name) ? 'checked' : ''}>
                    ${frappe.utils.escape_html(unit.floor || '')}
                </td>
                <td>${frappe.utils.escape_html(unit.unit_name || '')}</td>
                <td>${formatNumber(unit.saleable_area)}</td>
                <td>${formatNumber(unit.carpet_area)}</td>
                <td>${formatNumber(unit.terrace_area)}</td>
                <td>${formatNumber(unit.built_up_area)}</td>
                <td>${formatNumber(unit.common_area)}</td>
                <td>${frappe.utils.escape_html(unit.status || '')}</td>
                <td>${frappe.utils.escape_html(unit.custom_holdrelease || '')}</td>
                <td><i class="fa fa-pencil edit-icon"></i></td>
            `;

            bindRowEventListeners(tr, unit);
            tbody.appendChild(tr);
        });
    }

    function loadUnitsData() {
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Unit',
                filters: {
                    project: frm.doc.project_name,
                    sub_project: frm.doc.custom_sub_project
                },
                fields: ['*'],
                limit: 1000
            },
            callback: function(response) {
                if (response.message) {
                    unitsData = response.message;
                    renderUnitsTable();
                }
            }
        });
    }

    function handleBulkAction(action) {
        if (selectedUnits.size === 0) {
            frappe.throw(__('Please select units first'));
            return;
        }

        frappe.call({
            method: `realty_reflex.overrides.task_stock_custom.${action}_units`,
            args: {
                unit_ids: JSON.stringify(Array.from(selectedUnits))
            },
            callback: function(response) {
                if (response.message === "done") {
                    frappe.show_alert({
                        message: __(`Units ${action}ed successfully`),
                        indicator: 'green'
                    });
                    loadUnitsData();
                    selectedUnits.clear();
                }
            }
        });
    }

    function bindRowEventListeners(tr, unit) {
        const editIcon = tr.querySelector('.edit-icon');
        const checkbox = tr.querySelector('.unit-checkbox');

        editIcon.addEventListener('click', () => {
            frappe.set_route('Form', 'Unit', unit.name);
        });

        checkbox.addEventListener('click', (e) => {
            if (e.target.checked) {
                selectedUnits.add(unit.name);
            } else {
                selectedUnits.delete(unit.name);
            }
            updateSelectAllCheckbox();
        });
    }

    // Event listeners
    releaseBtn.addEventListener('click', () => handleBulkAction('release'));
    holdBtn.addEventListener('click', () => handleBulkAction('hold'));
    uploadCsvBtn.addEventListener('click', () => fileInput.click());
    downloadSampleCsvBtn.addEventListener('click', downloadSampleCsv);
    fileInput.addEventListener('change', handleFileUpload);

    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = tbody.querySelectorAll('.unit-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = e.target.checked;
            const unitId = checkbox.dataset.unit;
            if (e.target.checked) {
                selectedUnits.add(unitId);
            } else {
                selectedUnits.delete(unitId);
            }
        });
    });

    function updateSelectAllCheckbox() {
        const checkboxes = tbody.querySelectorAll('.unit-checkbox');
        selectAllCheckbox.checked = 
            checkboxes.length > 0 && 
            Array.from(checkboxes).every(checkbox => checkbox.checked);
    }

// CSV related functions
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result.split(',')[1];
            frappe.call({
                method: 'realty_reflex.overrides.task_stock_custom.create_units_from_csv',
                args: {
                    filedata: base64Data
                },
                callback: function(response) {
                    if (response.message) {
                        frappe.show_alert({
                            message: __('CSV uploaded successfully'),
                            indicator: 'green'
                        });
                        loadUnitsData();
                    }
                }
            });
        };
        reader.readAsDataURL(file);
    }
}

function downloadSampleCsv() {
    const csvContent = `data:text/csv;charset=utf-8,project_id,tower_id,floor,unit_unique_id,unit__appartment_no,unit_type,hold_release,land_area,saleable_area,common_area,dimensions,garden_area,terrace_area,carpet_area,landplot_area,built_up_area,rera_area,remarks,
PROJ-0001,T-A,Ground,101,A1,1BHK,Release,500,400,100,10x20,50,30,150,200,250,300,First unit remarks,
PROJ-0001,T-A,Ground,102,A2,2BHK,Hold,600,500,100,12x25,60,40,200,250,300,350,Second unit remarks`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sample_units.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initial load
loadUnitsData();
}



