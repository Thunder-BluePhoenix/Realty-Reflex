frappe.ui.form.on("Unit", {
    refresh: function (frm) {
        // Add custom buttons
        frm.add_custom_button(
            __("Project"),
            function () {
                var project_name = frm.doc.project_name;
                frappe.set_route("Form", "Project", project_name);
            },
            __("View")
        );

        frm.add_custom_button(
            __("Sub Project"),
            function () {
                var sub_project = frm.doc.sub_project;
                frappe.set_route("Form", "Sub Project", sub_project);
            },
            __("View")
        );
    },
});




frappe.ui.form.on('Unit', {

	custom_holdrelease: function (frm) {
		if (frm.doc.custom_holdrelease === "Hold") {
			disableButtons();
		} else {
			enableButtons();
		}
	}
});

frappe.ui.form.on('Unit', {
	onload: function (frm) {
		if (frm.doc.custom_holdrelease == "Hold") {
			frm.remove_custom_button('Create Quotation');
			frm.remove_custom_button('Actions');
			// Disable the "Actions" button
			$('div[data-label="Actions"] button').attr('disabled', 'disabled');

			// Disable the "Create Quotation" button
			$('button[data-label="Create%20Quotation"]').attr('disabled', 'disabled');
		}
	},
});
frappe.ui.form.on('Unit', {
	refresh: function (frm) {
		if (frm.doc.custom_holdrelease == "Hold") {
			// Disable the custom button while keeping the "Actions" button enabled
			frm.add_custom_button(__("Block With Money"), function () {
				// Custom button action
			}, __("Actions")).addClass("disabled");
			// Disable the custom button while keeping the "Actions" button enabled
			frm.add_custom_button(__("Block Without Money"), function () {
				// Custom button action
			}, __("Actions")).addClass("disabled");
			// Disable the custom button while keeping the "Actions" button enabled
			frm.add_custom_button(__("Create Quotation"), function () {
				// Custom button action
			}).addClass("disabled");
		}
	}
});

function disableButtons() {
	// Disable the "Actions" button
	$('div[data-label="Actions"] button').prop('disabled', true);

	// Disable the "Create Quotation" button
	$('button[data-label="Create%20Quotation"]').prop('disabled', true);
}

function enableButtons() {
	// Enable the "Actions" button
	$('div[data-label="Actions"] button').prop('disabled', false);

	// Enable the "Create Quotation" button
	$('button[data-label="Create%20Quotation"]').prop('disabled', false);
}
frappe.ui.form.on('Unit', {
	validate: function (frm) {
		var salablearea = frm.doc.saleable_area;
		if (salablearea == 0) {
			frappe.msgprint('salablearea cannot be 0');
			frappe.validated = false; // Prevent saving the document
		}
	}
})



frappe.ui.form.on('Unit', {
    unit_number: function (frm) {
        var unit_code = frm.doc.unit_number;
        var sub_project = frm.doc.sub_project;
        var combinedValue = sub_project + unit_code;
        frm.set_value('unit__appartment_no', combinedValue);
    }
});