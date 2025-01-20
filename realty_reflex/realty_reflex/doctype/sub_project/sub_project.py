# Copyright (c) 2025, Thunder and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils.nestedset import NestedSet
from frappe.model.document import Document
from frappe.utils import flt, money_in_words
import json
from frappe.utils import now_datetime
from frappe.utils import date_diff, nowdate


class SubProject(NestedSet):
	pass






class SubProject(Document):
	def before_save(self, method = None):
		if self.custom_total_budget_allocated and self.custom_allocated_amount:
			allocated_amo = self.custom_allocated_amount
			amo = self.custom_total_budget_allocated
			if allocated_amo > amo:
				frappe.throw("Allocated Ammount can not be greater than Total Amount")
			else:
				self.custom_pending_amount =  amo - allocated_amo
		self.total_parking_and_unit()

		# update_revision(self, method = None)
		if self.custom_total_budget_allocated:
			val=self.number_to_words(self.custom_total_budget_allocated)
			self.custom_amount_in_word=val

		validate_floors_before_save(self)
		if self.custom_no_of_floors:
			# self.get_floor()
			validate_and_create_floors(self)

		calculate_tat(self, method)

	def get_floor(self):
		self.custom_floors_table=[]
		floors=frappe.db.get_all("Floors",{"floor":["<",self.custom_no_of_floors]},["name"],order_by='floor asc')
		for j in floors:
			self.append("custom_floors_table",{
				"floors":j.get("name")
			})
		
	def number_to_words(self,num):
		crore = num // 10**7
		lakh = (num % 10**7) // 10**5
		thousand = (num % 10**5) // 10**3
		
		result = []
		if crore > 0:
			result.append(f"{crore} cr")
		if lakh > 0:
			result.append(f"{lakh} lakh")
		if thousand > 0:
			result.append(f"{thousand} thousand")
		
		return " ".join(result)


	def total_parking_and_unit(self):
		qty=0
		parking=0
		for i in self.custom_unit_type:
			qty+=flt(i.qty)
			parking+=flt(i.mandatory_car_park)
		self.custom_total_saleable_units=qty
		self.custom_no_of_car_parks=parking

			

	def on_update(self, method = None):
	# Collect data from specified fields
		data_to_store = {
			"custom_remark": self.custom_remark or None,
            "custom_allocated_amount": self.custom_allocated_amount or None,
            "custom_rate": self.custom_rate or None,
            "custom_budget_type": self.custom_budget_type or None,
            "custom_builtup_area": self.custom_builtup_area or None,
		}

		# Join the data into a single long text string
		self.custom_validate_data = json.dumps(data_to_store)


	

	def validate(self, method = None):
		# Check for duplicates
		duplicate = frappe.db.exists("Sub Project", {
			"custom_subproject_name": self.custom_subproject_name
		})

		if duplicate and duplicate != self.name:
			frappe.throw(_("A Sub Project with the name '{0}' already exists.").format(self.custom_subproject_name))



def update_revision(self, method = None):
	# Parse the existing JSON data stored in `custom_validate_data`
	stored_data = json.loads(self.custom_validate_data) if self.custom_validate_data else {}

	# Prepare current field values
	current_values = {
		"custom_remark": self.custom_remark,
		"custom_allocated_amount": self.custom_allocated_amount,
		"custom_rate": self.custom_rate,
		"custom_budget_type": self.custom_budget_type,
		"custom_builtup_area": self.custom_builtup_area
	}

	# Compare stored data with current data
	if current_values != stored_data:
		# Add a new row in the `custom_revisions` child table if data has changed
		revision_row = self.append("custom_revisions", {})
		revision_row.date_and_time = now_datetime()
		revision_row.budget_type = self.custom_budget_type
		revision_row.remark = self.custom_remark
		revision_row.rate = self.custom_rate
		revision_row.trans_amount = self.custom_allocated_amount
		revision_row.built_up_area = self.custom_builtup_area
		revision_row.entered_by = frappe.session.user
		revision_row.attachment = getattr(self, "custom_attach", None)
		revision_row.status = "Pending"  # Default status

		budget_type = self.custom_budget_type
		if budget_type == "Concept Budget":
			revision_prefix = "R0"
		elif budget_type == "Design Budget":
			revision_prefix = "R1"
		elif budget_type == "GFC":
			revision_prefix = "R2"
		else:
			revision_prefix = "REV"  # Default to "REV" if no match

		# Calculate and set the revision number with the appropriate prefix
		revision_count = len(self.custom_revisions or [])
		revision_row.revision = f"{revision_prefix}-{str(revision_count).zfill(3)}"


		# Update the stored JSON data
		# self.custom_validate_data = json.dumps(current_values)




@frappe.whitelist()
def create_group_task(values, project):
    try:
        data = json.loads(values)  # Safely parse JSON
        template_name = data.get("template")
        if not template_name:
            frappe.throw("Template is required")
        
        doc = frappe.get_doc("WBS Template", template_name)
        tasks = {task.task_id: task for task in doc.tasks}  # Index tasks by task_id
        
        for task_id, task_data in tasks.items():
            if task_data.is_group and not task_data.parent_task:
                # Create root-level group tasks
                task = frappe.new_doc("Task")
                task.subject = task_data.subject
                task.project = project
                task.is_group = task_data.is_group
                task.save(ignore_permissions=True)
                
                # Build the task tree
                build_task_tree(task.name, task_data.task_id, tasks, project)
        return True
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Create Group Task Failed")
        frappe.throw(str(e))

def build_task_tree(parent_task_name, parent_task_id, tasks, project):
    for task_id, task_data in tasks.items():
        if task_data.parent_task == parent_task_id:
            # Create child task
            child_task = frappe.new_doc("Task")
            child_task.subject = task_data.subject
            child_task.project = project
            child_task.parent_task = parent_task_name
            child_task.is_group = task_data.is_group
            child_task.save(ignore_permissions=True)
            
            # Recursively build the tree for this child
            build_task_tree(child_task.name, task_data.task_id, tasks, project)






@frappe.whitelist()
def create_tasks(values, project):
	data = json.loads(values)  # Safely parse JSON
	for i in data.get("subprojects"):
		for j in data.get("templates"):
			doc = frappe.get_doc("WBS Template", j.get("template"))
			tasks = {task.task_id: task for task in doc.tasks}  # Index tasks by task_id
			
			for task_id, task_data in tasks.items():
				if task_data.is_group and not task_data.parent_task:
					# Create root-level group tasks
					task = frappe.new_doc("Task")
					task.subject = task_data.subject
					task.project = project
					task.is_group = task_data.is_group
					task.sub_project=i.get("sub_project")
					task.parent_task=j.get("parent")
					task.save(ignore_permissions=True)
					
					# Build the task tree
					child_build_task_tree(task.name, task_data.task_id, tasks, project,i.get("sub_project"))
	return True



def child_build_task_tree(parent_task_name, parent_task_id, tasks, project,sub_project):
	for task_id, task_data in tasks.items():
		if task_data.parent_task == parent_task_id:
			# Create child task
			child_task = frappe.new_doc("Task")
			child_task.subject = task_data.subject
			child_task.project = project
			child_task.parent_task = parent_task_name
			child_task.is_group = task_data.is_group
			child_task.sub_project=sub_project
			child_task.save(ignore_permissions=True)
			
			# Recursively build the tree for this child
			child_build_task_tree(child_task.name, task_data.task_id, tasks, project,sub_project)







@frappe.whitelist()
def prepare_unit_creation_tool(sub_project_name, method = None):
    # Fetch the Sub Project document
    sub_project = frappe.get_doc("Sub Project", sub_project_name)
    
    # Prepare data for the Unit Creation Tool
    unit_creation_tool = frappe.new_doc("Unit Creation Tool")
    unit_creation_tool.project_name = sub_project.project
    unit_creation_tool.sub_project = sub_project.name

    # Populate child table (custom_floor_details) from Sub Project's custom_floors_table
    if sub_project.custom_floors_table:
        for floor_row in sub_project.custom_floors_table:
            unit_creation_tool.append("custom_floor_details", {
                "floor": floor_row.floors  # Map the field from Sub Project
            })

    # Return the document as JSON without saving it
    return unit_creation_tool.as_dict()



@frappe.whitelist()
def validate_and_create_floors(self):
    """
    Validate the custom_no_of_floors in the Sub Project doctype, 
    create missing Floor docs, and populate the custom_floors_table.
    """
    # Get the number of floors specified in Sub Project
    custom_no_of_floors = self.custom_no_of_floors
    if custom_no_of_floors is None or custom_no_of_floors < 1:
        frappe.throw("Please specify a valid number of floors in the 'custom_no_of_floors' field.")
    
    # Fetch all existing Floor documents and map them by their floor number
    existing_floors = frappe.get_all("Floors", fields=["name", "floor"], order_by="floor")
    existing_floors_map = {int(floor["floor"]): floor["name"] for floor in existing_floors}

    # Ensure all floors from 1 to custom_no_of_floors exist
    for floor_number in range(1, custom_no_of_floors + 1):
        if floor_number not in existing_floors_map:
            # Create a new Floor document
            floor_doc = frappe.get_doc({
                "doctype": "Floors",
                "floor": floor_number,
                "floor_name": get_floor_name(floor_number)
            })
            floor_doc.insert(ignore_permissions=True)  # Insert new Floor document

            # Update the map with the newly created Floor
            existing_floors_map[floor_number] = floor_doc.name

    # Populate the custom_floors_table in Sub Project
    self.custom_floors_table = []
    for floor_number in range(1, custom_no_of_floors + 1):
        floor_doc_name = existing_floors_map[floor_number]
        self.append("custom_floors_table", {
            "floors": floor_doc_name  # Link to the Floors document
        })


def get_floor_name(floor_number):
    """Generate floor name dynamically based on the floor number."""
    if 10 <= floor_number % 100 <= 20:  # Special case for '11th', '12th', etc.
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(floor_number % 10, "th")
    return f"{floor_number}{suffix}"








@frappe.whitelist()
def validate_floors_before_save(self):
	"""
	Before saving the Sub Project, check the number of units created for each floor.
	Ensure that the number of units for a floor is not reduced beyond the specified
	number of floors in the Sub Project.
	"""
	# Fetch the Sub Project document
	# sub_project = frappe.get_doc("Sub Project", self)

	# Get the number of floors specified in Sub Project
	custom_no_of_floors = self.custom_no_of_floors
	if custom_no_of_floors is None or custom_no_of_floors < 1:
		frappe.throw("Please specify a valid number of floors in the 'custom_no_of_floors' field.")

	# Retrieve all Unit documents where sub_project is linked to this Sub Project
	units = frappe.get_all("Unit", filters={"sub_project": self.name}, fields=["name", "floor"])

	# Initialize a set to store floors from the Unit documents
	floor_set_from_units = set()

	# Loop through the Unit docs and add floor information to the set
	for unit in units:
		# Add the floor to the set (set ensures no duplicates)
		floor_set_from_units.add(unit.floor)

	floor_count = len(floor_set_from_units)
	# Now check if the count of unique floors is less than the custom_no_of_floors
	print("@@@@@@@@@@@@@@@@@@@@@@@@@@@", floor_set_from_units)
	if floor_count > custom_no_of_floors:
		frappe.throw(f"Units for some floors have already been created. You cannot reduce the number of floors below {floor_count}.")







@frappe.whitelist()
def calculate_tat(doc, method):
	"""
	Calculate the Turnaround Time (TAT) in days between the start and end date-time fields
	and update the custom_tat field in the Sub Project doctype.
	"""
	# Ensure the required fields are present
	if not doc.custom_actual_start_date_and_time or not doc.custom_actual_finish_date__time:
		doc.custom_tat = None  # Clear the field if dates are not provided
		return

	# Calculate the difference in days
	start_date = doc.custom_actual_start_date_and_time
	end_date = doc.custom_actual_finish_date__time

	tat_days = date_diff(end_date, start_date)
	total_tat = tat_days + 1
	if total_tat < 1:
		frappe.throw("The finish date and time cannot be earlier than the start date and time.")

	# Format the TAT value with "day" or "days"
	if total_tat == 1:
		doc.custom_tat = f"{total_tat} Day"
	else:
		doc.custom_tat = f"{total_tat} Days"


