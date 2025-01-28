# Copyright (c) 2025, Thunder and contributors
# For license information, please see license.txt

import json
import frappe
from frappe.model.document import Document


class BudgetRelease(Document):
	@frappe.whitelist()
	def get_changed_tasks(self):
		br=frappe.db.get_value("Budget Release Log",{"project":self.project,"status":["!=","Approved"]},"name")
		if br:
			doc=frappe.get_doc("Budget Release Log",br)
			staged_task=[]
			approved_task=[]
			if doc.staged_tasks:
				for jk in eval(doc.staged_tasks):
					staged_task.append(jk.get("task"))
			if doc.approved_task:
				for appk in eval(doc.approved_task):
					approved_task.append(appk.get("task"))

	
			for i in eval(doc.changed_task):
				if i.get("name") not in staged_task and i.get("name") not in approved_task:
					task=frappe.get_doc("Task",i.get("name"))
					self.append("changed_tasks",{
						"task":i.get("name"),
						"task_name":task.get("subject"),
						"budget_type":task.custom_release_budget_type,
						"built_up_area":task.custom_release_builtup_area,
						"rate":task.custom_release_rate,
						"total":task.custom_release_amount,
						"allocated_amount":task.custom_release_allocated_amount,
						"pending_amount":task.custom_release_pending_amount,
						"remarks":task.custom_release_remarks,
						"changed_budget_type":task.custom_budget_type,
						"changed_built_up_area":task.custom_builtup_area,
						"changed_rate":task.custom_rate,
						"changed_total":task.custom_total_budget_allocated,
						"changed_allocated_amount":task.custom_allocated_amount,
						"changed_pending_amount":task.custom_pending_amount,
						"changed_remarks":task.custom_remark,
					})
			if doc.staged_tasks:
				for j in eval(doc.staged_tasks):
					if j.get("task") not in approved_task:
						self.append("staged_tasks",{
							"task":j.get("task"),
							"task_name":j.get("task_name"),
							"budget_type":j.get("budget_type"),
							"built_up_area":j.get("built_up_area"),
							"rate":j.get("rate"),
							"total":j.get("total"),
							"allocated_amount":j.get("allocated_amount"),
							"pending_amount":j.get("pending_amount"),
							"remarks":j.get("remarks"),
							"changed_budget_type":j.get("changed_budget_type"),
							"changed_built_up_area":j.get("changed_built_up_area"),
							"changed_rate":j.get("changed_rate"),
							"changed_total":j.get("changed_total"),
							"changed_allocated_amount":j.get("changed_allocated_amount"),
							"changed_pending_amount":j.get("changed_pending_amount"),
							"changed_remarks":j.get("changed_remarks")
						})



	@frappe.whitelist()
	def stage_changes(self,changed_tasks):
		print("$$$$$$$$$$$$$$$$$$$$",changed_tasks)
		stage_task=[]
		value=0
		for i in changed_tasks:
			if i.get("__checked")==1:
				value=1
				self.append("staged_tasks",{
					"task":i.get("task"),
					"task_name":i.get("task_name"),
					"budget_type":i.get("budget_type"),
					"built_up_area":i.get("built_up_area"),
					"rate":i.get("rate"),
					"total":i.get("total"),
					"allocated_amount":i.get("allocated_amount"),
					"pending_amount":i.get("pending_amount"),
					"remarks":i.get("remarks"),
					"changed_budget_type":i.get("changed_budget_type"),
					"changed_built_up_area":i.get("changed_built_up_area"),
					"changed_rate":i.get("changed_rate"),
					"changed_total":i.get("changed_total"),
					"changed_allocated_amount":i.get("changed_allocated_amount"),
					"changed_pending_amount":i.get("changed_pending_amount"),
					"changed_remarks":i.get("changed_remarks")
				})

				stage_task.append({
					"task":i.get("task"),
					"task_name":i.get("task_name"),
					"budget_type":i.get("budget_type"),
					"built_up_area":i.get("built_up_area"),
					"rate":i.get("rate"),
					"total":i.get("total"),
					"allocated_amount":i.get("allocated_amount"),
					"pending_amount":i.get("pending_amount"),
					"remarks":i.get("remarks"),
					"changed_budget_type":i.get("changed_budget_type"),
					"changed_built_up_area":i.get("changed_built_up_area"),
					"changed_rate":i.get("changed_rate"),
					"changed_total":i.get("changed_total"),
					"changed_allocated_amount":i.get("changed_allocated_amount"),
					"changed_pending_amount":i.get("changed_pending_amount"),
					"changed_remarks":i.get("changed_remarks")
				})
		if value==0:
			frappe.throw("Please Select Atleast One Change Task")
		br=frappe.db.get_value("Budget Release Log",{"project":self.project,"status":["!=","Approved"]},"name")
		if br:
			doc=frappe.get_doc("Budget Release Log",br)
			doc.staged_tasks=str(stage_task)
			doc.save(ignore_permissions=True)


			
				
	@frappe.whitelist()
	def release(self,staged_tasks):
		stage_task=[]
		for i in staged_tasks:
			stage_task.append({
				"task":i.get("task"),
				"task_name":i.get("task_name"),
				"changed_budget_type":i.get("changed_budget_type"),
				"changed_built_up_area":i.get("changed_built_up_area"),
				"changed_rate":i.get("changed_rate"),
				"changed_total":i.get("changed_total"),
				"changed_allocated_amount":i.get("changed_allocated_amount"),
				"changed_pending_amount":i.get("changed_pending_amount"),
				"changed_remarks":i.get("changed_remarks")
			})
			
		br=frappe.db.get_value("Budget Release Log",{"project":self.project,"status":["!=","Approved"]},"name")
		if br:
			doc=frappe.get_doc("Budget Release Log",br)	
			doc.approved_task=str(stage_task)
			doc.save(ignore_permissions=True)
			frappe.msgprint("Budget release sucessfully")

