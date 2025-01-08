// Create a new file: service_material_specification.js and place it in:
// apps/your_app_name/your_app_name/public/js/service_material_specification.js

frappe.provide('frappe.ui.form');

frappe.ui.form.ServiceMaterialSpecification = class ServiceMaterialSpecification {
    constructor(opts) {
        Object.assign(this, opts);
        this.make();
    }

    make() {
        this.wrapper = $(`<div class="service-material-spec"></div>`).appendTo(this.parent);
        this.make_service_table();
        this.bind_events();
    }

    make_service_table() {
        this.service_table = $(`
            <div class="service-spec-container">
                <div class="clearfix">
                    <button class="btn btn-sm btn-default pull-right" 
                            onclick="cur_frm.service_material_spec.add_service_row()">
                        Add Service Row
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered">
                        <thead>
                            <tr>
                                <th>Service Item</th>
                                <th>Unit</th>
                                <th>Qty</th>
                                <th>Service Total</th>
                                <th>Material Total</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        `).appendTo(this.wrapper);
    }

    add_service_row(data = {}) {
        let row = $(`
            <tr>
                <td>
                    <div class="form-group">
                        <input type="text" class="form-control service-item" 
                               value="${data.service_item || ''}">
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <input type="text" class="form-control unit" 
                               value="${data.unit || 'Nos'}">
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <input type="number" class="form-control qty" 
                               value="${data.qty || 0}">
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <input type="number" class="form-control service-total" 
                               value="${data.service_total || 0}" readonly>
                    </div>
                </td>
                <td>
                    <div class="form-group">
                        <input type="number" class="form-control material-total" 
                               value="${data.material_total || 0}" readonly>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-default edit-materials" 
                            title="Edit Materials">
                        <i class="fa fa-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger remove-row" 
                            title="Remove Row">
                        <i class="fa fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).appendTo(this.service_table.find('tbody'));

        row.data('materials', data.materials || []);
        return row;
    }

    show_material_dialog(service_row) {
        let dialog = new frappe.ui.Dialog({
            title: 'Edit Materials',
            fields: [
                {
                    fieldtype: 'Table',
                    fieldname: 'materials',
                    label: 'Materials',
                    cannot_add_rows: false,
                    in_place_edit: true,
                    data: service_row.data('materials'),
                    fields: [
                        {
                            fieldname: 'material_category_id',
                            fieldtype: 'Link',
                            options: 'Item',
                            in_list_view: 1,
                            label: 'Material Category ID'
                        },
                        {
                            fieldname: 'material_category',
                            fieldtype: 'Data',
                            in_list_view: 1,
                            label: 'Material Category'
                        },
                        {
                            fieldname: 'unit',
                            fieldtype: 'Link',
                            options: 'UOM',
                            in_list_view: 1,
                            label: 'Unit'
                        },
                        {
                            fieldname: 'qty',
                            fieldtype: 'Float',
                            in_list_view: 1,
                            label: 'Qty'
                        },
                        {
                            fieldname: 'rate',
                            fieldtype: 'Currency',
                            in_list_view: 1,
                            label: 'Rate'
                        },
                        {
                            fieldname: 'amount',
                            fieldtype: 'Currency',
                            in_list_view: 1,
                            label: 'Amount',
                            read_only: 1
                        }
                    ]
                }
            ],
            primary_action_label: 'Update',
            primary_action: (values) => {
                service_row.data('materials', values.materials);
                this.update_totals(service_row);
                dialog.hide();
            }
        });

        dialog.show();
    }

    update_totals(row) {
        let materials = row.data('materials') || [];
        let material_total = materials.reduce((total, mat) => 
            total + (mat.amount || 0), 0);
        row.find('.material-total').val(material_total);
        
        let qty = parseFloat(row.find('.qty').val()) || 0;
        let rate = parseFloat(row.find('.rate').val()) || 0;
        let service_total = qty * rate;
        row.find('.service-total').val(service_total);
    }

    bind_events() {
        this.wrapper.on('click', '.edit-materials', (e) => {
            let row = $(e.target).closest('tr');
            this.show_material_dialog(row);
        });

        this.wrapper.on('click', '.remove-row', (e) => {
            $(e.target).closest('tr').remove();
        });

        this.wrapper.on('change', '.qty, .rate', (e) => {
            let row = $(e.target).closest('tr');
            this.update_totals(row);
        });
    }

    get_value() {
        let data = [];
        this.wrapper.find('tbody tr').each((i, row) => {
            row = $(row);
            data.push({
                service_item: row.find('.service-item').val(),
                unit: row.find('.unit').val(),
                qty: row.find('.qty').val(),
                service_total: row.find('.service-total').val(),
                material_total: row.find('.material-total').val(),
                materials: row.data('materials') || []
            });
        });
        return data;
    }

    set_value(value) {
        this.wrapper.find('tbody').empty();
        (value || []).forEach(row_data => {
            this.add_service_row(row_data);
        });
    }
};

