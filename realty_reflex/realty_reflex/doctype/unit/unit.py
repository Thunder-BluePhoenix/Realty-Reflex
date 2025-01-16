# Copyright (c) 2024, alok@hybrowlabs.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import json
import csv
from frappe.utils.background_jobs import enqueue
from io import StringIO
import base64


class Unit(Document):
    pass


@frappe.whitelist()
def unblock(**kwargs):
    try:
        if kwargs.get("docname"):
            frappe.db.set_value(
                "Unit",
                kwargs.get("docname"),
                {
                    "status": "Available",
                    "party_type": "",
                    "party_name": "",
                    "party": "",
                    "company_bank_account": "",
                    "party_bank_account": "",
                    "contact": "",
                    "address": "",
                    "valid_upto": None,
                    "booking_date": None,
                },
            )
            return "Successfully Unblocked"

    except Exception as ex:
        frappe.logger("Unblock Error").exception(ex)
        return "Error"


@frappe.whitelist()
def block_without_money(**kwargs):
    try:
        if kwargs.get("booking_for") == "Customer":
            frappe.db.set_value(
                "Unit",
                kwargs.get("docname"),
                {
                    "party_type": kwargs.get("booking_for"),
                    "party_name": kwargs.get("customer_name"),
                    "contact": kwargs.get("contact_details"),
                    "address": kwargs.get("address"),
                    "valid_upto": kwargs.get("valid_upto"),
                    "booking_date": kwargs.get("booking_date"),
                    "status": "Block Without Money",
                },
            )
            return "Blocked Without Money"
        elif kwargs.get("booking_for") == "Lead":
            frappe.db.set_value(
                "Unit",
                kwargs.get("docname"),
                {
                    "party_type": kwargs.get("booking_for"),
                    "party_name": kwargs.get("lead"),
                    "contact": kwargs.get("contact_details_lead"),
                    "address": kwargs.get("address_lead"),
                    "valid_upto": kwargs.get("valid_upto"),
                    "booking_date": kwargs.get("booking_date"),
                    "status": "Block Without Money",
                },
            )
            return "Blocked Without Money"
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Block Error")
        return "Error Message"


# @frappe.whitelist()
# def import_units_from_csv(filedata):
#     # Convert filedata from base64 to a CSV string
#     csv_data = StringIO(frappe.utils.decode_base64(filedata).decode("utf-8"))
#     reader = csv.DictReader(csv_data)

#     total_len = len(list(reader))
#     csv_data.seek(0)
#     next(reader)  # Skip header row

#     for index, row in enumerate(reader):
#         enqueue(
#             create_unit,
#             row=row,
#             index=index,
#             total_len=total_len,
#             job_name="import_units_from_csv",
#         )


# def create_unit(index, row, total_len):
#     set_progress(index + 1, total_len, "Importing Units")

#     try:
#         unit = frappe.get_doc(
#             {
#                 "doctype": "Unit",
#                 "project_name": row.get("project_name"),
#                 "tower_name": row.get("tower_name"),
#                 "floor": row.get("floor"),
#                 "unit_type": row.get("unit_type"),
#                 "status": row.get("status"),
#                 "hold_release": row.get("hold_release"),
#                 "floor_type": row.get("floor_type"),
#                 "plc_applicable": row.get("plc_applicable") == "1",
#                 "land_area": row.get("land_area"),
#                 "saleable_area": row.get("saleable_area"),
#                 "common_area": row.get("common_area"),
#                 "dimensions": row.get("dimensions"),
#                 "terrace_area": row.get("terrace_area"),
#                 "carpet_area": row.get("carpet_area"),
#                 "land_plot_area": row.get("land_plot_area"),
#                 "rera_area": row.get("rera_area"),
#                 "remarks": row.get("remarks"),
#             }
#         )
#         unit.insert()
#         frappe.db.commit()
#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Unit Import Error")


def set_progress(current, total, description):
    progress = {"current": current, "total": total, "description": description}
    frappe.publish_realtime("progress", progress)


# @frappe.whitelist(allow_guest=True)
# def filter_floors(doctype, txt, searchfield, start, page_len, filters):
#     return frappe.db.sql(
#         """
#         SELECT floor_list
#         FROM `tabFloor Data`
#         WHERE parent = %s
#     """,
#         (filters.get("tower"),),
#     )

import json

# @frappe.whitelist(allow_guest=True)
# def filter_unit_type(doctype, txt, searchfield, start, page_len, filters):
#     if isinstance(filters, str):
#         filters = json.loads(filters)

#     return frappe.db.sql(
#         """
#         SELECT unit_type, mandatory_car_park
#         FROM `tabUnit Type`
#         WHERE parent = %s
#     """,
#         (filters.get("tower"),),
#     )

# @frappe.whitelist()
# def get_mandatory_car_park(unit_type):
#     mandatory_car_park = frappe.db.get_value('Unit Type', unit_type, 'mandatory_car_park')
#     return mandatory_car_park


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
        "unit_number": row.get("unit_unique_id"),
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