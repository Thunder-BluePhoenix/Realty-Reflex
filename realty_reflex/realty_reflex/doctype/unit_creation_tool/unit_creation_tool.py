import frappe
from frappe.model.document import Document
import json
import csv
from frappe.utils import flt
from frappe.utils.background_jobs import enqueue
from io import StringIO
import base64



class UnitCreationTool(Document):
    def before_save(self):
        self.update_subproject_details()
    
    def update_subproject_details(self):
        if not self.sub_project:
            return
            
        # Get all OTHER unit creation tools for this subproject and unit type
        other_unit_tools = frappe.get_all("Unit Creation Tool", 
            filters={
                "sub_project": self.sub_project,
                "unit_type": self.unit_type,
                "name": ["!=", self.name],  # Exclude current document
                "docstatus": ["!=", 2]  # Exclude cancelled documents
            },
            pluck="name"
        )
        
        # Calculate total quantity including current doc and other tools
        total_qty = self.calculate_total_quantity(other_unit_tools)
        
        # Update subproject document
        self.update_subproject(total_qty)
    
    def calculate_total_quantity(self, other_unit_tools):
        total_qty = 0
        
        # Add quantity from current document
        current_qty = sum(flt(row.qty) for row in self.custom_floor_details if row.qty)
        total_qty += current_qty
        
        # Add quantities from other unit tools
        for tool_name in other_unit_tools:
            tool_doc = frappe.get_doc("Unit Creation Tool", tool_name)
            qty = sum(flt(row.qty) for row in tool_doc.custom_floor_details if row.qty)
            total_qty += qty
            
        return total_qty
    
    def calculate_remaining_quantity(self):
        """Calculate total quantity from remaining unit tools"""
        total_qty = 0
        other_tools = frappe.get_all("Unit Creation Tool", 
            filters={
                "sub_project": self.sub_project,
                "unit_type": self.unit_type,
                "name": ["!=", self.name],
                "docstatus": ["!=", 2]
            },
            pluck="name"
        )
        
        for tool_name in other_tools:
            tool_doc = frappe.get_doc("Unit Creation Tool", tool_name)
            qty = sum(flt(row.qty) for row in tool_doc.custom_floor_details if row.qty)
            total_qty += qty
            
        return total_qty
    
    def calculate_remaining_saleable_area(self):
        """Calculate total saleable area from remaining unit tools"""
        total_area = 0
        other_tools = frappe.get_all("Unit Creation Tool", 
            filters={
                "sub_project": self.sub_project,
                "name": ["!=", self.name],
                "docstatus": ["!=", 2]
            },
            fields=["name", "saleable_area"]
        )
        
        for tool in other_tools:
            tool_doc = frappe.get_doc("Unit Creation Tool", tool.name)
            tool_qty = sum(flt(row.qty) for row in tool_doc.custom_floor_details if row.qty)
            total_area += flt(tool.saleable_area) * tool_qty
            
        return total_area
    
    def update_subproject(self, total_qty):
        subproject = frappe.get_doc("Sub Project", self.sub_project)
        unit_type_updated = False
        
        # Update unit type quantities
        for unit_type_row in subproject.custom_unit_type:
            if unit_type_row.unit_type == self.unit_type:
                unit_type_row.qty = total_qty
                unit_type_updated = True
                break
        
        # Add new unit type if not found
        if not unit_type_updated:
            subproject.append("custom_unit_type", {
                "unit_type": self.unit_type,
                "qty": total_qty
            })
        
        # Calculate total saleable area
        total_saleable_area = self.calculate_total_saleable_area()
        subproject.custom_total_saleable_area_sq_ft = total_saleable_area
        
        # Save subproject
        subproject.save(ignore_permissions=True)
    
    def calculate_total_saleable_area(self):
        """Calculate total saleable area by multiplying each unit tool's saleable area with its total quantity"""
        total_area = 0
        
        # Calculate area for current document
        current_qty = sum(flt(row.qty) for row in self.custom_floor_details if row.qty)
        total_area += flt(self.saleable_area) * current_qty
        
        # Get other unit tools
        other_tools = frappe.get_all("Unit Creation Tool", 
            filters={
                "sub_project": self.sub_project,
                "name": ["!=", self.name],
                "docstatus": ["!=", 2]
            },
            fields=["name", "saleable_area"]
        )
        
        # Calculate area for other tools
        for tool in other_tools:
            tool_doc = frappe.get_doc("Unit Creation Tool", tool.name)
            tool_qty = sum(flt(row.qty) for row in tool_doc.custom_floor_details if row.qty)
            total_area += flt(tool.saleable_area) * tool_qty
            
        return total_area
    
    def after_delete(self):
        if not self.sub_project:
            return
            
        subproject = frappe.get_doc("Sub Project", self.sub_project)
        unit_types_to_remove = []
        
        # Update unit type quantities
        for unit_type_row in subproject.custom_unit_type:
            if unit_type_row.unit_type == self.unit_type:
                remaining_qty = self.calculate_remaining_quantity()
                
                if remaining_qty > 0:
                    unit_type_row.qty = remaining_qty
                else:
                    unit_types_to_remove.append(unit_type_row)
        
        # Remove unit types with zero quantity
        for row in unit_types_to_remove:
            subproject.remove(row)
        
        # Update total saleable area
        remaining_area = self.calculate_remaining_saleable_area()
        subproject.custom_total_saleable_area_sq_ft = remaining_area
        
        subproject.save(ignore_permissions=True)


		
    
    def on_update(self):
        create_unit(self)





def create_unit(doc, method=None):
    """
    Before saving the Unit Creation Tool document:
    - Process each row in the custom_floor_details table.
    - Create, update, or delete Unit documents based on the qty field in each row.
    - Validate for duplication before creating the Unit documents.
    """
    if not doc.custom_floor_details:
        frappe.throw("The 'custom_floor_details' table cannot be empty.")

    name_of_unit = doc.unit_name

    for floor_details in doc.custom_floor_details:
        floor = floor_details.floor
        floor_type = floor_details.floor_type
        new_qty = floor_details.qty  # New quantity after update

        if new_qty < 1:
            frappe.throw(f"Invalid qty {new_qty} for floor {floor}. Quantity must be at least 1.")

        # Fetch existing unit documents for this floor
        existing_units = frappe.get_all(
            "Unit",
            filters={"unit_creation_tool": doc.name, "floor": floor},
            fields=["name", "unit_no"]
        )
        
        existing_unit_nos = {unit["unit_no"]: unit["name"] for unit in existing_units}  # Mapping of unit_no to doc name

        # Create or update units up to new_qty
        for unit_no in range(1, new_qty + 1):
            generated_unit_no = f"{name_of_unit}-{floor}{get_unit_name(unit_no)}"

            if generated_unit_no in existing_unit_nos:
                # Update existing unit
                existing_unit = frappe.get_doc("Unit", existing_unit_nos[generated_unit_no])
                update_unit_fields(existing_unit, doc)
                existing_unit.save(ignore_permissions=True)
                frappe.log_error(f"Updated Unit: {generated_unit_no} for Floor: {floor}")
            else:
                # Create new unit
                unit_doc = frappe.get_doc({
                    "doctype": "Unit",
                    "project_name": doc.project_name,
                    "unit_name": generated_unit_no,
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
                    "unit_no": generated_unit_no,
                })
                unit_doc.insert(ignore_permissions=True)
                frappe.log_error(f"Created Unit: {generated_unit_no} for Floor: {floor}")

        # Delete extra units if qty is reduced
        extra_units = [unit_no for unit_no in existing_unit_nos if int(unit_no.split(" ")[-2][:-2]) > new_qty]

        for unit_no in extra_units:
            frappe.delete_doc("Unit", existing_unit_nos[unit_no], force=True)
            frappe.log_error(f"Deleted Unit: {unit_no} for Floor: {floor}")

def update_unit_fields(unit_doc, doc):
    """ Update existing unit fields """
    unit_doc.unit_creation_tool = doc.name
    unit_doc.land_area = doc.land_area
    unit_doc.terrace_area = doc.terrace_area
    unit_doc.garden_area = doc.garden_area
    unit_doc.rera_area = doc.rera_area
    unit_doc.common_area = doc.common_area
    unit_doc.carpet_area = doc.carpet_area
    unit_doc.landplot_area = doc.landplot_area
    unit_doc.saleable_area = doc.saleable_area
    unit_doc.porche_area = doc.porche_area
    unit_doc.built_up_area = doc.built_up_area
    unit_doc.dimensions = doc.dimensions
    unit_doc.remarks = doc.remarks
    unit_doc.custom_plc_applicable = doc.custom_plc_applicable
    unit_doc.udi = doc.udi
    unit_doc.mandatory_car_park = doc.mandatory_car_park

def get_unit_name(unit_no):
    """ Generate a readable unit number with suffixes (1st, 2nd, 3rd, etc.) """
    if 10 <= unit_no % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(unit_no % 10, "th")
    return f"{unit_no}{suffix} unit"




