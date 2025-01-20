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
    - Create Unit documents based on the qty field in each row.
    - Validate for duplication before creating the Unit documents.
    """
    if not doc.custom_floor_details:
        frappe.throw("The 'custom_floor_details' table cannot be empty.")
		
    name_of_unit = doc.unit_name

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
            generated_unit_no = f"{name_of_unit}-{floor} Floor {get_unit_name(unit_no)}"  # This is the "Unit No" field for each unit
            
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


