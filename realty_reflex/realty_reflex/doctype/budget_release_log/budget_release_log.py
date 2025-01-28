# Copyright (c) 2025, Thunder and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class BudgetReleaseLog(Document):
	def before_save(self):
		self.task_update()
		
	def task_update(self):
		if self.status=="Approved":
			if not self.approved_task:
				frappe.throw("Still Budget Didn't released")

			if self.approved_task:
				for i in eval(self.approved_task):
					task=frappe.get_doc("Task",i.get("task"))
					task.custom_release_budget_type=i.get("changed_budget_type")
					task.custom_release_builtup_area=i.get("changed_built_up_area")
					task.custom_release_rate=i.get("changed_rate")
					task.custom_release_amount=i.get("changed_total")
					task.custom_release_allocated_amount=i.get("changed_allocated_amount")
					task.custom_release_pending_amount=i.get("changed_pending_amount")
					task.custom_release_remarks=i.get("changed_remarks")
					task.save(ignore_permissions=True)