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
		for i in self.custom_floor_details:
			value.append(i.qty)
		if self.sub_project:
			update=0
			doc=frappe.get_doc("Sub Project",self.sub_project)
			for i in doc.custom_unit_type:
				if i.unit_type==self.unit_type:
					update=1
					i.qty+=sum(value)
			if update==0:
				doc.append("custom_unit_type",{
					"unit_type":self.unit_type,
					"qty":sum(value)
				})
			saleble_area=flt(doc.custom_total_saleable_area_sq_ft)
			doc.custom_total_saleable_area_sq_ft=saleble_area+self.saleable_area
			doc.save(ignore_permissions=True)
			

	def after_delete(self):
		value=[]
		for i in self.custom_floor_details:
			value.append(i.qty)
		if self.sub_project:
			update=0
			doc=frappe.get_doc("Sub Project",self.sub_project)
			for i in doc.custom_unit_type:
				if i.unit_type==self.unit_type:
					update=1
					if i.qty>sum(value):
						i.qty-=sum(value)
					else:
						frappe.delete_doc("")
			if update==0:
				doc.append("custom_unit_type",{
					"unit_type":self.unit_type,
					"qty":sum(value)
				})
			saleble_area=flt(doc.custom_total_saleable_area_sq_ft)
			doc.custom_total_saleable_area_sq_ft=saleble_area+self.saleable_area
			doc.save(ignore_permissions=True)
		
    
