import frappe
from frappe.model.document import Document
import json
import csv
from frappe.utils import flt
from frappe.utils.background_jobs import enqueue
from io import StringIO
import base64



class UnitCreationTool(Document):
    # pass
	def before_save(self):
		self.set_unit()
	def set_unit(self):
			value=[]
			all_project=frappe.db.get_all("Unit Creation Tool",{"sub_project":self.sub_project,"unit_type":self.unit_type,"name":["!=",self.name]},["name"])
			for j in all_project:
				sub_pro=frappe.get_doc("Unit Creation Tool",j.name)

				for i in sub_pro.custom_floor_details:
					if i.qty:
						value.append(i.qty)


			for i in self.custom_floor_details:
				if i.qty:
					value.append(i.qty)
			if self.sub_project:
				update=0
				doc=frappe.get_doc("Sub Project",self.sub_project)
				for i in doc.custom_unit_type:
					if i.unit_type==self.unit_type:
						update=1
						i.qty=sum(value)
				if update==0:
					doc.append("custom_unit_type",{
						"unit_type":self.unit_type,
						"qty":sum(value)
					})
				saleble_area=flt(doc.custom_total_saleable_area_sq_ft)
				doc.custom_total_saleable_area_sq_ft=saleble_area+self.saleable_area
				doc.save(ignore_permissions=True)



	def on_update(self):
		create_unit(self)
			

	def after_delete(self):
		value=[]
		for i in self.custom_floor_details:
			if i.qty:
				value.append(i.qty)
		if self.sub_project:
			doc=frappe.get_doc("Sub Project",self.sub_project)
			for i in doc.custom_unit_type:
				if i.unit_type==self.unit_type:
					if i.qty>sum(value):
						i.qty-=sum(value)
					else:
						frappe.delete_doc("Floor Type Realty Reflex",i.name)
			saleble_area=flt(doc.custom_total_saleable_area_sq_ft)
			doc.custom_total_saleable_area_sq_ft=saleble_area-flt(self.saleable_area)
			doc.save(ignore_permissions=True)
		
    






def create_unit(doc, method=None):
    """
    Before saving the Unit Creation Tool document:
    - Process each row in the custom_floor_details table.
    - Create Unit documents based on the qty field in each row.
    - Validate for duplication before creating the Unit documents.
    """
    if not doc.custom_floor_details:
        frappe.throw("The 'custom_floor_details' table cannot be empty.")

    for floor_details in doc.custom_floor_details:
        # Fetch data from the current row in custom_floor_details
        floor = floor_details.floor  # Already provided (e.g., 'Ground', '1st', '2nd')
        floor_type = floor_details.floor_type
        qty = floor_details.qty

        if qty < 1:
            frappe.throw(f"Invalid qty {qty} for floor {floor}. Quantity must be at least 1.")

        # Loop through the quantity and create Unit docs
        for unit_no in range(1, qty + 1):
            # Generate unit number dynamically based on the floor and unit number
            generated_unit_no = f"{floor} Floor {get_unit_name(unit_no)}"  # This is the "Unit No" field for each unit
            
            # Check for duplicate Unit records (Unit Creation Tool and Unit No)
            if frappe.db.exists("Unit", {"unit_creation_tool": doc.name, "unit_no": generated_unit_no}):
                # If the Unit already exists, skip creating this unit and continue to the next one
                frappe.log_error(f"Skipping creation of Unit '{generated_unit_no}' as it already exists.")
                continue

            # Create the Unit document
            unit_doc = frappe.get_doc({
                "doctype": "Unit",
                "project_name": doc.project_name,
                "unit_name": generated_unit_no,  # Use unit__appartment_no for the unit name
                "unit_type": doc.unit_type,
                "mandatory_car_park": doc.mandatory_car_park,
                "sub_project": doc.sub_project,
                "status": doc.status,
                "custom_holdrelease": doc.custom_holdrelease,
                "custom_sub_project_name": doc.custom_sub_project_name,
                "unit_creation_tool": doc.name,
                "land_area": doc.land_area,
                "terrace_area": doc.terrace_area,
                "garden_area": doc.garden_area,
                "rera_area": doc.rera_area,
                "common_area": doc.common_area,
                "carpet_area": doc.carpet_area,
                "landplot_area": doc.landplot_area,
                "saleable_area": doc.saleable_area,
                "porche_area": doc.porche_area,
                "built_up_area": doc.built_up_area,
                "dimensions": doc.dimensions,
                "remarks": doc.remarks,
                "custom_plc_applicable": doc.custom_plc_applicable,
                "udi": doc.udi,
                "floor": floor,
                "floor_type": floor_type,
                "unit_no": generated_unit_no,  # Dynamically created Unit No
            })

            # Insert the Unit document into the database
            unit_doc.insert(ignore_permissions=True)

            # Log the created unit
            frappe.log_error(f"Created Unit: {generated_unit_no} for Floor: {floor}")

    # After processing all floors, save the updated document with the child table
    # doc.save()


def get_unit_name(unit_no):
    
    if 10 <= unit_no % 100 <= 20:  # Special case for 11th, 12th, 13th, etc.
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(unit_no % 10, "th")
    return f"{unit_no}{suffix} unit"


