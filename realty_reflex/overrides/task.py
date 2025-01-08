import frappe
from frappe import _
from frappe.model.document import Document
import json








def before_save(doc, method = None):
    if doc.custom_total_budget_allocated and doc.custom_allocated_amount:
        allocated_amo = doc.custom_allocated_amount
        amo = doc.custom_total_budget_allocated
        doc.custom_amount = doc.custom_total_budget_allocated
        if allocated_amo > amo:
            frappe.throw("Allocated Ammount can not be greater than Total Amount")
        else:
            doc.custom_pending_amount =  amo - allocated_amo

    data_long_text(doc, method)


def validate(doc, method = None):
# Store previous values in cache for comparison
    if not hasattr(doc, '_previous_values'):
        doc._previous_values = frappe._dict({
            'custom_remark': doc.get_doc_before_save().custom_remark if doc.get_doc_before_save() else None,
            'custom_allocated_amount': doc.get_doc_before_save().custom_allocated_amount if doc.get_doc_before_save() else None,
            'custom_rate': doc.get_doc_before_save().custom_rate if doc.get_doc_before_save() else None,
            'custom_budget_type': doc.get_doc_before_save().custom_budget_type if doc.get_doc_before_save() else None,
            'custom_builtup_area':doc.get_doc_before_save().custom_builtup_area if doc.get_doc_before_save() else None,
            'custom_attach': doc.get_doc_before_save().custom_attach if doc.get_doc_before_save() else None

    })
        






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
        total_service += item.get("service_total", 0)
        total_material += item.get("material_total", 0)

    # Set the calculated totals to the respective fields
    doc.custom_service_totalinr = total_service
    doc.custom_material_totalinr = total_material
    doc.custom_totalinr = total_service + total_material

    # Process the material_specification data to populate the child table
    material_data = []
    for item in service_data:
        for material in item.get("material_specification", []):
            # Create a composite key for matching
            key = (material["material_category_id"], material["unit"], material["rate"])
            existing_entry = next((m for m in material_data if (
                m["material_category_id"] == key[0] and 
                m["unit"] == key[1] and 
                m["rate"] == key[2]
            )), None)

            if existing_entry:
                # Update quantity and amount for matching entries
                existing_entry["qty"] += material["qty"]
                existing_entry["amount"] = existing_entry["qty"] * existing_entry["rate"]
            else:
                # Add a new entry
                material_data.append({
                    "material_category_id": material["material_category_id"],
                    "material_category": material["material_category"],
                    "unit": material["unit"],
                    "qty": material["qty"],
                    "rate": material["rate"],
                    "amount": material["qty"] * material["rate"]
                })

    # Clear existing child table and populate with updated data
    doc.custom_material_specification = []
    total_material_inr = 0
    for material in material_data:
        doc.append("custom_material_specification", material)
        total_material_inr += material["amount"]

    # Update the total material amount field
    doc.custom_total_material_inr = total_material_inr


