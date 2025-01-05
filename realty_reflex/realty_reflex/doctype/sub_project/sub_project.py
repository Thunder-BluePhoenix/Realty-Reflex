# Copyright (c) 2025, Thunder and contributors
# For license information, please see license.txt

import frappe
from frappe.utils.nestedset import NestedSet
from frappe.model.document import Document


class SubProject(NestedSet):
	pass






class SubProject(Document):
	def before_save(self, method = None):
		if self.custom_total_budget_allocated and self.custom_allocated_amount:
			allocated_amo = self.custom_allocated_amount
			amo = self.custom_total_budget_allocated
			self.custom_amount = self.custom_total_budget_allocated
			if allocated_amo > amo:
				frappe.throw("Allocated Ammount can not be greater than Total Amount")
			else:
				self.custom_pending_amount =  amo - allocated_amo


	def validate(self):
    # Store previous values in cache for comparison
		if not hasattr(self, '_previous_values'):
			self._previous_values = frappe._dict({
				'custom_remark': self.get_doc_before_save().custom_remark if self.get_doc_before_save() else None,
				'custom_allocated_amount': self.get_doc_before_save().custom_allocated_amount if self.get_doc_before_save() else None,
				'custom_rate': self.get_doc_before_save().custom_rate if self.get_doc_before_save() else None,
				'custom_budget_type': self.get_doc_before_save().custom_budget_type if self.get_doc_before_save() else None,
				'custom_builtup_area':self.get_doc_before_save().custom_builtup_area if self.get_doc_before_save() else None,
				'custom_attach': self.get_doc_before_save().custom_attach if self.get_doc_before_save() else None

        })


