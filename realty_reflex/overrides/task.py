import frappe
from frappe import _
from frappe.model.document import Document
import json
from frappe.utils import now_datetime







def before_save(doc, method = None):
    if doc.custom_total_budget_allocated and doc.custom_allocated_amount:
        allocated_amo = doc.custom_allocated_amount
        amo = doc.custom_total_budget_allocated
        doc.custom_amount = doc.custom_total_budget_allocated
        if allocated_amo > amo:
            frappe.throw("Allocated Ammount can not be greater than Total Amount")
        else:
            doc.custom_pending_amount =  amo - allocated_amo

    # data_long_text(doc, method)
    # update_revision(doc, method = None)


def on_update(doc, method = None):
	# Collect data from specified fields
		data_to_store = {
			"custom_remark": doc.custom_remark or None,
            "custom_allocated_amount": doc.custom_allocated_amount or None,
            "custom_rate": doc.custom_rate or None,
            "custom_budget_type": doc.custom_budget_type or None,
            "custom_builtup_area": doc.custom_builtup_area or None,
		}

		# Join the data into a single long text string
		doc.custom_validate_data = json.dumps(data_to_store)






def data_long_text(doc, method):
    try:
        service_data = json.loads(doc.custom_service_specification_data)
    except (TypeError, json.JSONDecodeError):
        frappe.throw("Invalid JSON format in Custom Service Specification Data")
    
    # Initialize totals
    total_service = 0
    total_material = 0

    # Iterate through the parsed data for service totals
    for item in service_data:
        total_service += float(item.get("service_total", 0) or 0)
        total_material += float(item.get("material_total", 0) or 0)

    # Set the calculated totals to the respective fields
    doc.custom_service_totalinr = total_service
    doc.custom_material_totalinr = total_material
    doc.custom_totalinr = total_service + total_material

    # Process the material_specification data to populate the child table
    material_data = []
    for item in service_data:
        for material in item.get("material_specification", []):
            # Create a composite key for matching
            key = (
                material.get("material_category_id"),
                material.get("unit"),
                material.get("rate"),
                material.get("material_name", "Unknown")
            )
            existing_entry = next((m for m in material_data if (
                m["material_category_id"] == key[0] and
                m["unit"] == key[1] and
                m["rate"] == key[2] and
                m["material_name"] == key[3]
            )), None)

            if existing_entry:
                # Update quantity and amount for matching entries
                existing_entry["qty"] += float(material.get("qty", 0))
                existing_entry["amount"] = existing_entry["qty"] * existing_entry["rate"]
            else:
                # Add a new entry
                material_data.append({
                    "material_category_id": material.get("material_category_id"),
                    "material_name": material.get("material_name", None),
                    "material_category": material.get("material_category", None),
                    "unit": material.get("unit", "Unknown"),
                    "qty": float(material.get("qty", 0)),
                    "rate": float(material.get("rate", 0)),
                    "amount": float(material.get("qty", 0)) * float(material.get("rate", 0))
                })

    # Clear existing child table and populate with updated data
    doc.custom_material_specification = []
    total_material_inr = 0
    for material in material_data:
        doc.append("custom_material_specification", material)
        total_material_inr += material["amount"]

    # Update the total material amount field
    doc.custom_total_material_inr = total_material_inr








def update_revision(doc, method = None):
	# Parse the existing JSON data stored in `custom_validate_data`
	stored_data = json.loads(doc.custom_validate_data) if doc.custom_validate_data else {}

	# Prepare current field values
	current_values = {
		"custom_remark": doc.custom_remark,
		"custom_allocated_amount": doc.custom_allocated_amount,
		"custom_rate": doc.custom_rate,
		"custom_budget_type": doc.custom_budget_type,
		"custom_builtup_area": doc.custom_builtup_area
	}

	# Compare stored data with current data
	if current_values != stored_data:
		# Add a new row in the `custom_revisions` child table if data has changed
		revision_row = doc.append("custom_revisions", {})
		revision_row.date_and_time = now_datetime()
		revision_row.budget_type = doc.custom_budget_type
		revision_row.remark = doc.custom_remark
		revision_row.rate = doc.custom_rate
		revision_row.trans_amount = doc.custom_allocated_amount
		revision_row.built_up_area = doc.custom_builtup_area
		revision_row.entered_by = frappe.session.user
		revision_row.attachment = getattr(doc, "custom_attach", None)
		revision_row.status = "Pending"  # Default status

		budget_type = doc.custom_budget_type
		if budget_type == "Concept Budget":
			revision_prefix = "R0"
		elif budget_type == "Design Budget":
			revision_prefix = "R1"
		elif budget_type == "GFC":
			revision_prefix = "R2"
		else:
			revision_prefix = "REV"  # Default to "REV" if no match

		# Calculate and set the revision number with the appropriate prefix
		revision_count = len(doc.custom_revisions or [])
		revision_row.revision = f"{revision_prefix}-{str(revision_count).zfill(3)}"

















@frappe.whitelist()
def get_item_group_details(item_group_id):
    """Fetch custom fields from the Item Group doctype."""
    if not item_group_id:
        frappe.throw(_("Item Group ID is required"))

    data = frappe.db.get_value(
        "Item Group",
        item_group_id,
        ["custom_material_category_id", "custom_unit"],
        as_dict=True
    )
    
    if not data:
        frappe.throw(_("No data found for the given Item Group"))

    return data
