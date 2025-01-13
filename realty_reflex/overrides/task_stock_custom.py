import frappe
from frappe.model.document import Document
import json
import csv
from frappe.utils import flt
from frappe.utils import cstr
from frappe.utils.background_jobs import enqueue
from io import StringIO
import base64
from collections import defaultdict






@frappe.whitelist(allow_guest=True)
def create_units_from_csv(filedata):
    try:
        decoded_filedata = base64.b64decode(filedata)
        csv_data = StringIO(decoded_filedata.decode("utf-8"))
        reader = csv.DictReader(csv_data)

        for row in reader:
            try:
                create_unit(row)
            except Exception as e:
                frappe.throw(f"Error creating unit: {row}, {str(e)}", "Create Units From CSV")
                return {"status": "error", "message": f"Error creating unit: {row}. Error: {str(e)}"}

        return {"status": "success", "message": "Units Created Successfully"}
    except Exception as e:
        frappe.throw(f"Error processing CSV: {str(e)}", "Create Units From CSV")
        return {"status": "error", "message": f"An error occurred while processing the file. Error: {str(e)}"}

def create_unit(row):
    # Assuming 'orientation_options' is a list of orientation names/identifiers from 'row'
    # orientation_options = row.get("orientation_options", [])  # This should be a list of orientation names/ids

    unit_data = {
        "doctype": "Unit",
        "project_name": row.get("project_id"),
        "tower_name": row.get("tower_id"),
        "floor": row.get("floor"),
        "unit_name": row.get("unit_unique_id"),
        "unit__appartment_no": row.get("unit__appartment_no"),
        "unit_type": row.get("unit_type"),
        "hold_release": row.get("hold_release"),
        "land_area": row.get("land_area"),
        "saleable_area": row.get("saleable_area"),
        "common_area": row.get("common_area"),
        "dimensions": row.get("dimensions"),
        "garden_area": row.get("garden_area"),
        "terrace_area": row.get("terrace_area"),
        "carpet_area": row.get("carpet_area"),
        "landplot_area": row.get("landplot_area"),
        "built_up_area": row.get("built_up_area"),
        "rera_area": row.get("rera_area"),
        "remarks": row.get("remarks"),
        # Add the orientations as a child table
        # "orientations": [{"orientation": orientation} for orientation in orientation_options]
    }

    unit = frappe.get_doc(unit_data)
    unit.insert(ignore_permissions=True)
    frappe.db.commit()




@frappe.whitelist(allow_guest=True)
def hold_units(unit_ids):
    try:
        # Parse the JSON string back to a list
        unit_ids = json.loads(unit_ids)
        
        for unit_id in unit_ids:
            doc = frappe.get_doc("Unit", unit_id)
            doc.custom_holdrelease = "Hold"
            doc.save(ignore_permissions=True)
        
        frappe.db.commit()
        return "done"
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), f"Error holding units: {str(e)}")
        frappe.throw("Error updating units")

@frappe.whitelist(allow_guest=True)
def release_units(unit_ids):
    try:
        # Parse the JSON string back to a list
        unit_ids = json.loads(unit_ids)
        
        for unit_id in unit_ids:
            doc = frappe.get_doc("Unit", unit_id)
            doc.custom_holdrelease = "Release"
            doc.save(ignore_permissions=True)
        
        frappe.db.commit()
        return "done"
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), f"Error releasing units: {str(e)}")
        frappe.throw("Error updating units")
