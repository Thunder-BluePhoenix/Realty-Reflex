
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
        // Create the initial table structure with editable fields
        const alignment_css = `
             <style>
        #service-spec-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        #service-spec-table th, #service-spec-table td {
            text-align: left;
            vertical-align: middle;
            border: 1px solid #ddd; /* Match Frappe table border style */
            padding: 8px; /* Match standard table padding */
        }

        #service-spec-table th {
            background-color: #f9f9f9; /* Match Frappe table header background */
            font-weight: bold;
            text-transform: capitalize;
        }

       

        #service-spec-table td .frappe-control {
            margin: auto !important;
            width: 100% !important;
        }

        #service-spec-table .select-row {
            margin: auto !important;
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
    </style>

        `;

        // Inject the alignment CSS into the page
        $('head').append(alignment_css);

        let table_html = `
            <table class="table table-bordered" id="service-spec-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>No</th>
                        <th>Service Item</th>
                        <th>Unit</th>
                        <th>Qty</th>
                        <th>Service Total</th>
                        <th>Material Total</th>
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

        // Event Handlers
        setTimeout(() => {
            $('#add-row-btn').on('click', function () {
                addRow();
                updateSerialNumbers();
            });

            $('#service-spec-table').on('click', '.select-row', function () {
                let selected = $('#service-spec-table-body').find('.select-row:checked').length;
                $('#delete-row-btn').toggle(selected > 0);
            });

            $('#delete-row-btn').on('click', function () {
                $('#service-spec-table-body').find('.select-row:checked').closest('tr').remove();
                $('#delete-row-btn').hide();
                updateSerialNumbers();
            });

            $('#service-spec-table').on('click', '.edit-row', function () {
                let row = $(this).closest('tr');
                openEditDialog(
                    row.find('.service-item-link').data('value'),
                    row.find('.unit-link').data('value'),
                    row.find('.qty-field').data('value'),
                    row.find('.service-total-field').data('value'),
                    row.find('.material-total-field').data('value'),
                    row.data('rate'),
                    row.data('material_specification'),
                    row.data('item_total')
                );
            });
        }, 500);

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
                // Initialize Service Item field
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
            });
        }

        function openEditDialog(service_item, unit, qty, service_total, material_total, rate, material_specification = [], item_total = 0) {

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
                                                    row.refresh();
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

                    selectedRow.data('material_specification', values.material_specification);
                    selectedRow.data('rate', values.rate);
                    selectedRow.data('item_total', values.item_total);

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
            }

            function updateServiceTotal(dialog) {
                const rate = flt(dialog.get_value('rate') || 0);
                const qty = flt(dialog.get_value('qty') || 0);
                dialog.set_value('service_total', rate * qty);
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

