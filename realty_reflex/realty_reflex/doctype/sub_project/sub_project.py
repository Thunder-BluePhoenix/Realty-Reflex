# Copyright (c) 2025, Thunder and contributors
# For license information, please see license.txt

import frappe
from frappe.utils.nestedset import NestedSet
from frappe.model.document import Document
from frappe.utils import flt, money_in_words
import json
from frappe.utils import now_datetime


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

		update_revision(self, method = None)
		if self.custom_total_budget_allocated:
			val=self.number_to_words(self.custom_total_budget_allocated)
			self.custom_amount_in_word=val
		if self.custom_no_of_floors:
			self.get_floor()

	def get_floor(self):
		self.custom_floors_table=[]
		floors=frappe.db.get_all("Floors",{"floor":["<=",self.custom_no_of_floors]},["name"],order_by='floor asc')
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


